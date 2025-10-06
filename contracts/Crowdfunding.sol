// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
  Crowdfunding contract:
  - createCampaign(title, goal, deadline, description)
  - contribute(campaignId) payable
  - withdrawFunds(campaignId) only owner, after goal reached
  - refundContributors(campaignId) -> contributor claims own refund after deadline if goal not met
  - view helpers to list campaigns and contributors

  Design:
  - Each campaign tracks contributor addresses for visibility
  - Refunds are self-claimed to avoid gas-heavy loops
  - Deadline is a unix timestamp (seconds)
*/

contract Crowdfunding {
    struct Campaign {
        string title;
        string description;
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool withdrawn;
        mapping(address => uint256) contributions;
        address[] contributorList;
        mapping(address => bool) refunded;
    }

    // Lightweight view for listing (cannot return mappings directly)
    struct CampaignView {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool withdrawn;
        uint256 contributorCount;
    }

    Campaign[] private campaigns;

    event CampaignCreated(uint256 indexed id, address indexed creator, string title, uint256 goal, uint256 deadline);
    event ContributionReceived(uint256 indexed id, address indexed contributor, uint256 amount, uint256 newTotal);
    event FundsWithdrawn(uint256 indexed id, address indexed creator, uint256 amount);
    event RefundClaimed(uint256 indexed id, address indexed contributor, uint256 amount);

    function createCampaign(
        string memory title,
        uint256 goal,
        uint256 deadline,
        string memory description
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title required");
        require(goal > 0, "Goal must be > 0");
        require(deadline > block.timestamp, "Deadline must be in future");

        campaigns.push();
        uint256 id = campaigns.length - 1;

        Campaign storage c = campaigns[id];
        c.title = title;
        c.description = description;
        c.creator = payable(msg.sender);
        c.goal = goal;
        c.deadline = deadline;
        c.totalRaised = 0;
        c.withdrawn = false;

        emit CampaignCreated(id, msg.sender, title, goal, deadline);
        return id;
    }

    function contribute(uint256 id) external payable {
        require(id < campaigns.length, "Invalid id");
        Campaign storage c = campaigns[id];
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Must send ether");

        if (c.contributions[msg.sender] == 0) {
            c.contributorList.push(msg.sender);
        }
        c.contributions[msg.sender] += msg.value;
        c.totalRaised += msg.value;

        emit ContributionReceived(id, msg.sender, msg.value, c.totalRaised);
    }

    function withdrawFunds(uint256 id) external {
        require(id < campaigns.length, "Invalid id");
        Campaign storage c = campaigns[id];
        require(msg.sender == c.creator, "Only creator");
        require(!c.withdrawn, "Already withdrawn");
        require(c.totalRaised >= c.goal, "Goal not reached");

        c.withdrawn = true;
        uint256 amount = c.totalRaised;
        (bool ok, ) = c.creator.call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsWithdrawn(id, c.creator, amount);
    }

    // NOTE: Refund is per-contributor claim. The function name matches the requirement.
    function refundContributors(uint256 id) external {
        require(id < campaigns.length, "Invalid id");
        Campaign storage c = campaigns[id];
        require(block.timestamp >= c.deadline, "Not ended");
        require(c.totalRaised < c.goal, "Goal reached");
        require(!c.refunded[msg.sender], "Already refunded");
        uint256 bal = c.contributions[msg.sender];
        require(bal > 0, "No contribution");

        c.refunded[msg.sender] = true;
        c.contributions[msg.sender] = 0;
        (bool ok, ) = payable(msg.sender).call{value: bal}("");
        require(ok, "Refund failed");

        emit RefundClaimed(id, msg.sender, bal);
    }

    // Views

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }

    function getCampaign(uint256 id) external view returns (CampaignView memory) {
        require(id < campaigns.length, "Invalid id");
        Campaign storage c = campaigns[id];
        return CampaignView({
            id: id,
            title: c.title,
            description: c.description,
            creator: c.creator,
            goal: c.goal,
            deadline: c.deadline,
            totalRaised: c.totalRaised,
            withdrawn: c.withdrawn,
            contributorCount: c.contributorList.length
        });
    }

    function getCampaigns() external view returns (CampaignView[] memory list) {
        uint256 n = campaigns.length;
        list = new CampaignView[](n);
        for (uint256 i = 0; i < n; i++) {
            Campaign storage c = campaigns[i];
            list[i] = CampaignView({
                id: i,
                title: c.title,
                description: c.description,
                creator: c.creator,
                goal: c.goal,
                deadline: c.deadline,
                totalRaised: c.totalRaised,
                withdrawn: c.withdrawn,
                contributorCount: c.contributorList.length
            });
        }
    }

    function getContributorAt(uint256 id, uint256 index) external view returns (address contributor, uint256 amount) {
        require(id < campaigns.length, "Invalid id");
        Campaign storage c = campaigns[id];
        require(index < c.contributorList.length, "Invalid index");
        contributor = c.contributorList[index];
        amount = c.contributions[contributor];
    }

    function getContributionOf(uint256 id, address user) external view returns (uint256) {
        require(id < campaigns.length, "Invalid id");
        return campaigns[id].contributions[user];
    }
}
