const ethers = require("ethers");
const { findBuildById } = require("../services/db/db");

const getSignMessageForId = async (messageId, options) => {
  switch (messageId) {
    case "buildSubmit":
      return `I want to submit a new build: ${options.buildUrl} as ${options.address}`;
    case "buildEdit":
      return `I want to edit build#${options.buildId} as ${options.address}`;
    case "buildDelete":
      return `I want to delete build#${options.buildId} as ${options.address}`;
    case "buildFeature":
      // ToDo. Something going on with bool values:
      // When calling from /sign-message, it's a string, not boolean.
      // When we call it from the PATH /build it's a boolean (since we compose the object)
      // One possible solution, use an express boolean parser.
      const featured = typeof options.featured === "boolean" ? options.featured : options.featured === "true";
      return `I want to ${featured ? "feature" : "unfeature"} the build#${options.buildId} as ${options.address}`;
    case "buildLike": {
      const build = await findBuildById(options.buildId);
      const isLiked = build?.likes?.includes(options.address);
      return `${isLiked ? "Unlike" : "Like"} the build "${build.name}" as ${options.address}`;
    }
    case "builderCreate":
      return `I want to add the builder "${options.builderAddress}" to BuidlGuidl as ${options.address}`;
    case "builderEdit":
      return `I want to edit the builder "${options.builderAddress}" as ${options.address}`;
    case "builderUpdateSocials":
      return `I want to update my social links as ${options.address}`;
    case "builderUpdateStatus":
      return `I want to update my status "${options.status}" as ${options.address}`;
    case "builderClaimEns":
      return `I want to update claim an ENS as ${options.address}`;
    case "builderProvideEns":
      return `I want to mark as ENS provided to builder ${options.builderAddress} as ${options.address}`;
    default:
      return "Invalid signing option";
  }
};

const verifySignature = async (signature, verifyOptions) => {
  const trustedMessage = await getSignMessageForId(verifyOptions.messageId, verifyOptions);
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
