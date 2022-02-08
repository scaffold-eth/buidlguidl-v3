const ethers = require("ethers");

const getSignMessageForId = (messageId, options) => {
  switch (messageId) {
    case "buildSubmit":
      return `I want to submit a new build: ${options.buildUrl} as ${options.address}`;
    case "buildReview":
      return `I want to set the "${options.newStatus}" status to build#${options.buildId} as ${options.address}`;
    case "builderCreate":
      return `I want to add the builder "${options.builderAddress}" to BuidlGuidl as ${options.address}`;
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
