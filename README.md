🎓 A Decentralized Ethereum-Based Fundraising Platform for Educational Institutions
📌 Overview

This project is a blockchain-powered fundraising platform built on Ethereum, designed to help educational institutions create transparent, secure, and decentralized fundraising campaigns. By leveraging smart contracts, the platform eliminates intermediaries, ensures donor trust, and guarantees that funds are only accessible under predefined conditions.

🚀 Key Features

Create Campaigns – Institutions can launch fundraising campaigns with details like title, description, goal amount, and deadline.

Donate Securely – Donors can contribute ETH directly to campaigns via MetaMask or any Web3 wallet.

Withdraw Funds – Campaign owners can withdraw donations only if the funding goal is met before the deadline.

Refund Mechanism – Donors automatically receive refunds if the campaign fails to reach its goal.

Transparency & Security – All transactions are on-chain, immutable, and publicly verifiable.

Decentralized Access – No central authority controls the platform; smart contracts manage the entire process.

🛠 Tech Stack

Blockchain: Ethereum

Smart Contracts: Solidity (Hardhat framework for development & testing)

Frontend: React.js (Vite)

Blockchain Interaction: Ethers.js

Wallet Integration: MetaMask

Storage: IPFS (optional for storing campaign images/documents)

📂 Project Structure
├── contracts/          # Solidity smart contracts
│   └── UniversityFundraiser.sol
├── scripts/            # Deployment and interaction scripts
├── test/               # Hardhat test cases
├── frontend/           # React.js frontend (Vite project)
│   ├── src/components/ # Reusable React components
│   ├── src/pages/      # UI pages (Home, Campaigns, Create, About)
│   └── src/utils/      # Helper functions & contract integration
├── hardhat.config.js   # Hardhat configuration
└── README.md           # Project documentation

🔑 Smart Contract Functionalities

createCampaign() → Allows institutions to launch new campaigns.

donateToCampaign() → Enables donors to contribute ETH to active campaigns.

withdrawFunds() → Lets campaign owners withdraw funds if goals are met.

refund() → Automatically processes refunds if campaigns fail.

getCampaigns() → Fetches all campaigns for frontend display.

🖥️ Frontend Features

Campaign Dashboard – View all active campaigns.

Campaign Details Page – Check funding progress, donor list, and deadlines.

Donation Modal – Easy ETH donation via MetaMask.

Create Campaign Form – Fully validated campaign creation form.

⚙️ Deployment
1. Clone the repository
git clone (https://github.com/EngrMohsinAzam/UETM-Fundraiser.git)
cd UETM-Fundraiser

2. Install dependencies
npm install

3. Compile and deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia

4. Start frontend
cd frontend
npm install
npm run dev

🎯 Impact

This dApp empowers schools, universities, and non-profits to raise funds in a transparent, trustless, and borderless way. By leveraging blockchain technology, it ensures security for donors and accountability for institutions, creating a fair and reliable fundraising ecosystem.

📜 License

This project is open-source under the MIT License.
