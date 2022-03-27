const ethers = require("ethers");
const { getAddress } = require("@ethersproject/address");

const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);

// Return the ENS for a given address or the empty string if not found.
const getEnsFromAddress = async address => {
  try {
    const reportedEns = await provider.lookupAddress(address);
    const resolvedAddress = await provider.resolveName(reportedEns);

    if (getAddress(address) === getAddress(resolvedAddress)) {
      return reportedEns;
    }

    return "";
  } catch (e) {
    return "";
  }
};

module.exports = {
  getEnsFromAddress,
};
