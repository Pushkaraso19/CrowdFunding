const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  await hre.run("compile");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy();
  await crowdfunding.waitForDeployment();

  const address = await crowdfunding.getAddress();
  console.log("Crowdfunding deployed at:", address);

  const configPath = path.join(process.cwd(), "config", "contract.ts");
  const content = `export const CONTRACT_ADDRESS = "${address}"\n`;
  try {
    fs.writeFileSync(configPath, content, "utf8");
    console.log("Wrote address to", configPath);
  } catch (err) {
    console.warn("Could not write config/contract.ts:", err.message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
