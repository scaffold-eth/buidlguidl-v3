require("dotenv").config();
const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("SimpleStream", {
    from: deployer,
    args: [
      process.env.FRONTEND_ADDRESS ||
        "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266" /* to address */,
      ethers.utils.parseEther("0.5") /* cap (ether) */,
      2592000 /* frequency (seconds): 1296000 (15 days), 2592000 (30 days) */,
      true /* starts full */,
    ],
    log: true,
  });

  // add some funds to the stream with a little message
  const simpleStream = await ethers.getContract("SimpleStream", deployer);
  await simpleStream.streamDeposit("Do some science, plz!", {
    value: ethers.utils.parseEther("2"),
  });
};

module.exports.tags = ["SimpleStream"];
