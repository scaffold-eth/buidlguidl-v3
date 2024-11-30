const { ethers } = require("ethers");

async function getNFTContractAddress(contractAddress) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.OP_RPC_URL);
    const contract = new ethers.Contract(
      contractAddress,
      ["function batchGraduationNFT() view returns (address)"],
      provider,
    );

    const nftContractAddress = await contract.batchGraduationNFT();
    return nftContractAddress;
  } catch (error) {
    console.log("Could not fetch NFT contract address:", error.message);
    return "0x0000000000000000000000000000000000000000";
  }
}

module.exports = {
  getNFTContractAddress,
};
