require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    blockdag: {
      url: "https://rpc.primordial.bdagscan.com", // Verified BlockDAG RPC URL
      chainId: 1043, // Verified BlockDAG chain ID (0x413 in hex)
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk"
      }
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com", // Polygon Mumbai testnet fallback
      chainId: 80001,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk"
      }
    },
  },
  paths: {
    sources: "./blockchain/contracts",
    tests: "./blockchain/test",
    cache: "./blockchain/cache",
    artifacts: "./blockchain/artifacts"
  },
};

module.exports = config;