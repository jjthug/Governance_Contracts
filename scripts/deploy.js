// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Governance = await hre.ethers.getContractFactory("Governance");

  const governance = await Governance.deploy("0xc0A0aEa4f8457Caa8C47ED5B5DA410E40EFCbf3c");
  // const governance = await Governance.attach("0x3845c6857e6EbD654b6e38F2248dFa5364A706CB");
  // await governance.transferOwnership("0xc0A0aEa4f8457Caa8C47ED5B5DA410E40EFCbf3c");

  await governance.deployed();

  console.log("Governance deployed to:", governance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
