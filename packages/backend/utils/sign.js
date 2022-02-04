const ethers = require("ethers");

const getSignMessageForId = (messageId, options) => {
  switch (messageId) {
    case "buildSubmit":
      return JSON.stringify({
        messageId,
        address: options.address,
        buildUrl: options.buildUrl,
      });
    case "buildReview":
      return JSON.stringify({
        messageId,
        address: options.address,
        buildId: options.buildId,
        newStatus: options.newStatus,
      });
    case "builderUpdateSocials":
      return `I want to update my social links as ${options.address}`;
    default:
      return "Invalid signing option";
  }
};

const verifySignature = (signature, verifyOptions) => {
  const trustedMessage = getSignMessageForId(verifyOptions.messageId, verifyOptions);
  const signingAddress = ethers.utils.verifyMessage(trustedMessage, signature);

  console.log("trustedMessage", trustedMessage);
  console.log("signingAddress       ", signingAddress);
  console.log("verifyOptions.address", verifyOptions.address);

  return signingAddress === verifyOptions.address;
};

module.exports = {
  getSignMessageForId,
  verifySignature,
};
