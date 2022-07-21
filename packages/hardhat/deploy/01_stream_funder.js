require("dotenv").config();
const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("StreamMultiFunder", {
    from: deployer,
    log: true,
  });

  // const signer = await ethers.getSigner(deployer);
  // const tx = signer.sendTransaction({
  //   to: "",
  //   value: ethers.utils.parseEther("5"),
  // });
  //
  // (await tx).wait;
};

module.exports.tags = ["StreamMultiFunder"];
