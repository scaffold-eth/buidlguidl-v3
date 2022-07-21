require("dotenv").config();

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("StreamMultiFunder", {
    from: deployer,
    log: true,
  });
};

module.exports.tags = ["StreamMultiFunder"];
