import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  console.log("Deploying SkillXChange contract...");
  
  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name || "Unknown");
  console.log("Chain ID:", network.chainId.toString());

  // Get the ContractFactory and Signers
  const SkillXChange = await ethers.getContractFactory("SkillXChange");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const skillXChange = await SkillXChange.deploy();
  await skillXChange.waitForDeployment();

  const contractAddress = await skillXChange.getAddress();
  console.log("SkillXChange deployed to:", contractAddress);
  
  // Log the block explorer URL based on network
  if (network.chainId === 1043n) {
    console.log("View on BlockDAG Explorer:", `https://primordial.bdagscan.com/address/${contractAddress}`);
  } else if (network.chainId === 80001n) {
    console.log("View on Polygon Mumbai Explorer:", `https://mumbai.polygonscan.com/address/${contractAddress}`);
  }

  // Save the contract address and ABI to a file for frontend use
  const contractInfo = {
    address: contractAddress,
    abi: SkillXChange.interface.format('json')
  };

  // Create the constants directory if it doesn't exist
  const constantsDir = "./src/constants";
  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }

  fs.writeFileSync(
    `${constantsDir}/contract.json`,
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract info saved to src/constants/contract.json");
  
  // Verify contract on block explorer (if supported)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await skillXChange.deploymentTransaction().wait(6);
    
    console.log("Verifying contract...");
    try {
      await pkg.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });