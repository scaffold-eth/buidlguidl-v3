const ethers = require("ethers");
const { findBuildById } = require("../services/db/db");

const getSignMessageForId = async (messageId, options) => {
  let data = {};
  switch (messageId) {
    case "buildSubmit":
      data = {
        type: options.buildType,
        name: options.name,
        buildUrl: options.buildUrl,
        demoUrl: options.demoUrl,
        videoUrl: options.videoUrl,
        desc: options.desc,
        image: options.image,
      };

      // Arrays are special :)
      if (options?.coBuilders?.length) {
        data.coBuilders = options.coBuilders;
      }

      return `I want to submit a new build as ${options.address}:\n\n${JSON.stringify(data, null, 2)}`;

    case "buildEdit":
      data = {
        type: options.buildType,
        name: options.name,
        buildUrl: options.buildUrl,
        demoUrl: options.demoUrl,
        videoUrl: options.videoUrl,
        desc: options.desc,
        image: options.image,
      };

      // Arrays are special :)
      if (options?.coBuilders?.length) {
        data.coBuilders = options.coBuilders;
      }

      return `I want to edit the build "${options.name}" (${options.buildId}) as ${
        options.address
      }:\n\n${JSON.stringify(data, null, 2)}`;

    case "buildDelete":
      return `I want to delete build#${options.buildId} as ${options.address}`;

    case "buildFeature":
      // ToDo. Something going on with bool values:
      // When calling from /sign-message, it's a string, not boolean.
      // When we call it from the PATH /build it's a boolean (since we compose the object)
      // One possible solution, use an express boolean parser.
      const featured = typeof options.featured === "boolean" ? options.featured : options.featured === "true";
      return `I want to ${featured ? "feature" : "unfeature"} the build#${options.buildId} as ${options.address}`;

    case "buildLike":
      const build = await findBuildById(options.buildId);
      const isLiked = build?.likes?.includes(options.address);
      return `${isLiked ? "Unlike" : "Like"} the build "${build.name}" as ${options.address}`;

    case "builderCreate":
      data = {
        builderAddress: options.builderAddress,
        builderFunction: options.builderFunction,
        builderRole: options.builderRole,
        builderStreamAddress: options.builderStreamAddress,
        batch: options.batch,
        builderCohort: options.builderCohort
          ? typeof options.builderCohort === "string"
            ? JSON.parse(options.builderCohort).name
            : options.builderCohort.name
          : undefined,
      };
      return `I want to add a builder to BuidlGuidl as ${options.address}:\n\n${JSON.stringify(data, null, 2)}`;

    case "builderEdit":
      data = {
        builderAddress: options.builderAddress,
        builderFunction: options.builderFunction,
        builderRole: options.builderRole,
        builderStreamAddress: options.builderStreamAddress,
        batch: options.batch,
        builderCohort: options.builderCohort
          ? typeof options.builderCohort === "string"
            ? JSON.parse(options.builderCohort).name
            : options.builderCohort.name
          : undefined,
      };
      return `I want to edit the builder "${options.builderAddress}" as ${options.address}:\n\n${JSON.stringify(
        data,
        null,
        2,
      )}`;

    case "builderUpdateSocials":
      // We do this because of the way GET params work (can't send JS objects as in POST requests)
      if (typeof options.socialLinks === "string") {
        data = options.socialLinks;
      } else {
        data = JSON.stringify(options.socialLinks);
      }
      return `I want to update my social links as ${options.address}:\n\n${data}`;

    case "builderUpdateStatus":
      return `I want to update my status as ${options.address}:\n\n"${options.status}"`;

    case "builderUpdateLocation":
      return `I want to update my location to ${options.location} as ${options.address}`;

    case "builderClaimEns":
      return `I want to claim an ENS as ${options.address}`;

    case "builderProvideEns":
      return `I want to mark as ENS provided to builder ${options.builderAddress} as ${options.address}`;

    case "streamsUpdate":
      return `I want to run the stream indexer as ${options.address}`;

    case "builderUpdateReachedOut":
      const reachedOut = typeof options.reachedOut === "boolean" ? options.reachedOut : options.reachedOut === "true";
      return `I (${options.address}) want to mark builder ${options.builderAddress} as ${
        reachedOut ? "reached out" : "NOT reached out"
      }`;

    case "builderUpdateScholarship":
      const scholarship =
        typeof options.scholarship === "boolean" ? options.scholarship : options.scholarship === "true";
      return `I (${options.address}) want to mark builder ${options.builderAddress} as ${
        scholarship ? "scholarship'd out" : "NOT scholarship'd"
      }`;

    case "builderUpdateGraduated":
      const graduated = typeof options.graduated === "boolean" ? options.graduated : options.graduated === "true";
      return `I (${options.address}) want to mark builder ${options.builderAddress} as ${
        graduated ? `graduated (${options.reason})` : "NOT graduated"
      }`;

    case "builderUpdateDisabled": {
      const disabled = typeof options.disabled === "boolean" ? options.disabled : options.disabled === "true";
      return `I (${options.address}) want to mark builder ${options.builderAddress} as ${
        disabled ? "disabled" : "NOT disabled"
      }`;
    }

    case "devconVoucherClaim":
      return `I want to claim my Devcon 2024 Bangkok voucher as ${options.address}`;

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
