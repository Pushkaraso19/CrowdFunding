# Crowdfunding dApp (Ethereum + Solidity + Next.js)

A simple crowdfunding platform:
- Create campaigns with title, description, goal (ETH), and deadline
- Contribute to campaigns using MetaMask (Ganache test ETH)
- Track progress and contributors
- Auto-withdraw for creator when goal reached
- Refunds are self-claimed by contributors if the deadline passes without reaching the goal

Tech: Solidity, Ganache (local), MetaMask, Remix IDE, ethers.js, Next.js App Router (v0 preview), Tailwind + shadcn/ui.

## 1) Local blockchain with Ganache

- Install and start Ganache (GUI or CLI) on http://127.0.0.1:8545
- Note the chain ID (typically 1337 or 5777) and the funded test accounts

## 2) Connect MetaMask to Ganache

- Open MetaMask -> Networks -> Add a network manually
  - Network Name: Ganache
  - New RPC URL: http://127.0.0.1:8545
  - Chain ID: 1337 (or 5777 if Ganache shows that)
  - Currency symbol: ETH
- Import a Ganache test account with its private key if needed

## 3) Compile & deploy the contract (Remix)

- Open https://remix.ethereum.org
- Create a new file `Crowdfunding.sol` and paste the contents of `contracts/Crowdfunding.sol`
- In Remix:
  - Compiler: 0.8.20 (or compatible)
  - Deploy & Run: Environment = "Injected Provider - MetaMask"
  - Ensure MetaMask is set to your Ganache network
  - Deploy `Crowdfunding`
- Copy the deployed contract address

## 4) Frontend configuration

- Open `config/contract.ts` and set `CONTRACT_ADDRESS` to the address from Remix
- The ABI is already provided in `lib/abi/crowdfunding.ts` matching this contract.
  - If you change the contract, update the ABI accordingly in that file.

## 5) Using the dApp

- In the preview or locally after installing, click "Connect Wallet" and connect MetaMask to Ganache
- Create a new campaign (title, goal in ETH, deadline, description)
- Contribute to a campaign using ETH via MetaMask
- If goal is reached, the owner can withdraw
- If deadline passes and goal not met, contributors can press "Claim Refund"

## 6) Notes

- Reads use a JSON-RPC provider (http://127.0.0.1:8545); writes require MetaMask
- If preview cannot reach your local Ganache, install this project and run locally
- Security: This is a demo; for production, audit contracts and add tests

## Bonus Filters

- Use the buttons on the homepage to sort by Recent, Most funded, or Nearly complete
