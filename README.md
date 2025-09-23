# SkillXChange - Decentralized Skill Exchange Platform

A complete Web3 education platform where instructors can create courses and students can purchase access using cryptocurrency. Built with Next.js and Solidity smart contracts, deployed on BlockDAG testnet.

## 🚀 Features

### For Students
- **Browse Marketplace**: Discover courses from expert instructors
- **Secure Payments**: Purchase courses with BDAG cryptocurrency
- **Instant Access**: Get immediate access to Zoom links after purchase
- **Course Management**: Track all your purchased courses in one place

### For Instructors
- **Easy Course Creation**: Simple form to create and publish courses
- **Direct Payments**: Receive payments directly to your wallet
- **Course Analytics**: View your teaching statistics
- **Access Control**: Zoom links are securely protected until purchase

### Technical Features
- **Smart Contract Security**: Access control and payment verification
- **Wallet Integration**: MetaMask connection with BlockDAG testnet
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Instant blockchain state synchronization

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Network**: BlockDAG Testnet
- **Wallet**: MetaMask integration
- **Styling**: Tailwind CSS with responsive design

## 📁 Project Structure (for GitHub)

- `src/` - Next.js frontend source code
  - `components/` - Reusable React components
  - `hooks/` - Custom React hooks (wallet, contract, etc.)
  - `utils/` - Utility functions
  - `constants/` - Contract addresses, ABI, etc.
  - `web3/` - Ethers.js and blockchain logic
  - `types/` - TypeScript types
- `blockchain/` - Solidity smart contracts and scripts
  - `contracts/` - Solidity contract files
  - `scripts/` - Deployment and interaction scripts
- `docs/` - Documentation (deployment guide, usage, etc.)
- `public/` - Static assets

## 🎯 Getting Started

### Prerequisites
- Node.js 16+
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd SkillXChange
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
Create `.env.local` file:
```env
MNEMONIC="your twelve word mnemonic phrase"
BLOCKDAG_RPC_URL="https://rpc-testnet.blockdag.network"
BLOCKDAG_CHAIN_ID=#### (use official Chain ID)
```

4. **Deploy smart contract**
```bash
npm run compile
npm run deploy
```

5. **Start the application**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📖 Usage Guide

### Setting Up MetaMask

1. Add BlockDAG Testnet to MetaMask:
   - **Network Name**: BlockDAG Testnet
   - **RPC URL**: https://rpc-testnet.blockdag.network
   - **Chain ID**: 1043
   - **Currency**: BDAG

2. Get testnet tokens from the faucet

### Creating a Course

1. Connect your wallet
2. Navigate to "Create Course"
3. Fill in course details:
   - Title and description
   - Price in BDAG tokens
   - Zoom meeting link
4. Submit and confirm the transaction

### Purchasing a Course

1. Browse the marketplace
2. Click "Buy Course" on desired course
3. Confirm the payment transaction
4. Access the course from "My Courses"

## 🔧 Smart Contract

### Key Functions

- `createCourse()` - Create a new course
- `purchaseCourse()` - Buy access to a course  
- `getCourseZoomLink()` - Access Zoom link (enrolled users only)
- `getAllActiveCourses()` - List all available courses
- `isEnrolled()` - Check enrollment status

### Security Features

- Access control for Zoom links
- Payment verification before access
- Instructor ownership validation
- Course activation management

## 🌐 Live Demo

*Deploy your version and add the live demo link here*

## 📱 Screenshots

*Add screenshots of your application here*

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linting

# Smart Contracts  
npm run compile      # Compile contracts
npm run deploy       # Deploy to testnet
npm run deploy:local # Deploy locally
```

## 🔒 Security

- Smart contracts include access control mechanisms
- Payment verification before granting access
- Secure wallet integration through MetaMask
- Input validation and error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for smart contract libraries
- Next.js team for the amazing framework
- BlockDAG network for testnet support
- Ethers.js for blockchain integration

## 📞 Support

For questions and support:
- Open an issue on GitHub
- Check the [deployment guide](docs/DEPLOYMENT.md)
- Review the troubleshooting section

---

**Built with ❤️ for the decentralized education revolution**

See `docs/DEPLOYMENT.md` for deployment and usage instructions.
