require("@nomicfoundation/hardhat-toolbox");

/**
 * Use CommonJS config only (no ESM) to avoid module system conflicts.
 * Rely on Hardhat's integrated network accounts instead of custom keys.
 */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hardhat: {
      chainId: 31337,
    },
  },
};
