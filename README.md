
# 🌐 Crowdfunding dApp

🚀 A decentralized crowdfunding platform built on Ethereum using Solidity, Hardhat, and Next.js.
Create campaigns, contribute ETH, and claim refunds — all transparently and securely on-chain.

<p align="center"> 
<img src="https://img.shields.io/badge/Solidity-0.8+-blue?logo=solidity" alt="Solidity"> 
<img src="https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs" alt="Next.js"> 
<img src="https://img.shields.io/badge/Hardhat-yellow?logo=ethereum" alt="Hardhat"> 
<img src="https://img.shields.io/badge/TailwindCSS-0EA5E9?logo=tailwindcss&logoColor=white" alt="TailwindCSS"> 
<img src="https://img.shields.io/badge/ethers.js-purple?logo=ethereum" alt="ethers.js"> 
</p>

## 🧭 Table of Contents

- [✨ Overview](#-overview)
- [🎯 Why This Project](#-why-this-project)
- [🧰 Tech Stack](#-tech-stack)
- [⚙️ Prerequisites](#️-prerequisites)
- [🧩 Installation](#-installation)
- [🛠️ Smart Contract Setup](#️-smart-contract-setup)
- [🧱 Deployment Sequence](#-deployment-sequence)
- [🌍 Connect MetaMask](#-connect-metamask)
- [🔧 Frontend Configuration](#-frontend-configuration)
- [🗂️ Repository Structure](#️-repository-structure)
- [🧪 Testing & Linting](#-testing--linting)
- [⚠️ Security Disclaimer](#️-security-disclaimer)
- [🧑‍💻 Contributing](#-contributing)
- [📜 License](#-license)
- [👤 Maintainer](#-maintainer)
- [📘 Quick Commands](#-quick-commands)

## ✨ Overview

Crowdfunding dApp is a demo decentralized application that demonstrates how blockchain can make crowdfunding transparent, trustless, and automatic.

### 💡 Users can:

- 🧾 Create campaigns (title, description, goal, deadline)
- 💰 Contribute ETH via MetaMask
- 🔓 Withdraw funds after goal completion (for campaign owners)
- 🔁 Claim refunds if campaign goals aren't met before the deadline

## 🎯 Why This Project

- 🧠 End-to-end Web3 learning resource
- ⚡ Demonstrates Solidity, Hardhat, Next.js, and ethers.js integration
- 🏗️ Full-stack example for developers learning dApp architecture
- 🔒 Includes refund logic, goal validation, and local blockchain deployment

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Solidity |
| Blockchain Tooling | Hardhat |
| Frontend Framework | Next.js (App Router) |
| Blockchain Interaction | ethers.js |
| Styling & UI | Tailwind CSS + shadcn/ui |
| Wallet Integration | MetaMask |
## ⚙️ Prerequisites

- 🟢 Node.js v18+
- 📦 pnpm or npm
- 🦊 MetaMask browser extension
- ⚙️ Local blockchain: Hardhat or Ganache

## 🧩 Installation

Clone and install dependencies:

```bash
git clone https://github.com/Pushkaraso19/crowdfunding-dapp.git
cd crowdfunding-dapp

pnpm install
# or
npm install
```

## 🛠️ Smart Contract Setup

<details>
<summary><strong>▶️ Step-by-step setup</strong></summary>

### 1️⃣ Compile Contracts
```bash
npx hardhat compile --config ./hardhat.config.cjs
```

### 2️⃣ Start Local Blockchain

Choose one:

**Option A — Hardhat Node**
```bash
npx hardhat node --config ./hardhat.config.cjs
```

**Option B — Ganache**
Run Ganache UI → RPC URL: http://127.0.0.1:8545

</details>
## 🧱 Deployment Sequence

Run the following in order (in separate terminals):

| Step | Command | Description |
|------|---------|-------------|
| 🟢 1 | `npx hardhat node --config ./hardhat.config.cjs` | Start local Hardhat node |
| 🟡 2 | `npx hardhat run --network localhost scripts/deploy-hardhat.cjs --config ./hardhat.config.cjs` | Deploy smart contracts |
| 🔵 3 | `pnpm dev` or `npm run dev` | Launch Next.js frontend |
## 🌍 Connect MetaMask

Open MetaMask → Add Network

- **Name:** Localhost 8545
- **RPC URL:** http://127.0.0.1:8545
- **Chain ID:** 31337
- **Symbol:** ETH

Import a funded private key from Hardhat or Ganache for testing.

## 🔧 Frontend Configuration

- Update `config/contract.ts` with your deployed contract address
- Frontend uses ABI from `lib/abi/crowdfunding.ts`
- (Regenerate it if contract logic changes)

## 🗂️ Repository Structure

```
crowdfunding-dapp/
├── app/                # Next.js pages & styles
├── components/         # Reusable UI components
├── contracts/          # Solidity contract (Crowdfunding.sol)
├── scripts/            # Hardhat deployment scripts
├── lib/                # ABI, utils, helpers
├── config/             # Contract configuration
├── test/               # Hardhat tests
├── artifacts/          # Compilation outputs
├── build-info/         # Build metadata
└── package.json
```

## 🧪 Testing & Linting

**Run Smart Contract Tests**
```bash
npx hardhat test
```

**Lint Frontend**
```bash
npm run lint
```

## ⚠️ Security Disclaimer

🚨 **This project is for educational purposes only.**
Do not deploy these contracts to production without a professional security audit.

## 🧑‍💻 Contributing

Contributions are welcome! 🎉

To contribute:

1. Fork this repository
2. Create a new branch
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit & push your changes
4. Open a Pull Request

## 📜 License

Licensed under the MIT License.
See the [LICENSE](LICENSE) file for details.

## 👤 Maintainer

**Pushkar Asodekar**
- 🔗 [GitHub](https://github.com/Pushkaraso19)
- 💼 [LinkedIn](https://www.linkedin.com/in/pushkar-asodekar)

## 📘 Quick Command Summary

| Task | Command |
|------|---------|
| 🧩 Install deps | `pnpm install` / `npm install` |
| ⚙️ Compile contracts | `npx hardhat compile` |
| ⛓️ Start blockchain | `npx hardhat node` |
| 🚀 Deploy contract | `npx hardhat run --network localhost scripts/deploy-hardhat.cjs` |
| 🌐 Start frontend | `pnpm dev` / `npm run dev` |
| ✅ Run tests | `npx hardhat test` |
<p align="center"> Built with ❤️ by <a href="https://github.com/Pushkaraso19">Pushkar Asodekar</a> <br/> <em>Empowering open-source blockchain learning.</em> </p>
