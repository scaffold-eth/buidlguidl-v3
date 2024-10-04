const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withAddress, withRole } = require("../middlewares/auth");
const { EVENT_TYPES, createEvent } = require("../utils/events");
const { getEnsFromAddress } = require("../utils/ens");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("/builders");
  const builders = await db.findAllUsers();
  res.status(200).send(builders);
});

router.get("/batchBuilders", async (req, res) => {
  console.log("/builders/batchBuilders");
  const builders = await db.findAllBatchedUsers();
  res.status(200).send(builders);
});

router.get("/cohorts", async (req, res) => {
  console.log(`/builders/cohorts`);

  const cohorts = await db.findAllCohorts();
  res.status(200).json(cohorts);
});

router.get("/:builderAddress", async (req, res) => {
  const builderAddress = req.params.builderAddress;
  console.log(`/builders/${builderAddress}`);

  const builder = await db.findUserByAddress(builderAddress);

  if (!builder.exists) {
    res.status(404).send("User doesn't exist");
    return;
  }
  console.log("Retrieving existing user: ", builderAddress);
  res.status(200).json(builder.data);
});

router.post("/create", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["builderAddress", "builderFunction", "builderRole", "signature"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  // ToDo. Param validation.
  const {
    builderAddress,
    builderFunction,
    builderRole,
    signature,
    builderStreamAddress,
    builderCohort,
    batchNumber,
    batchStatus,
  } = req.body;
  const address = req.address;
  console.log("POST /builders/create", address, builderAddress);

  if (!ethers.utils.isAddress(builderAddress)) {
    res.status(400).send("Invalid address");
    return;
  }

  const verifyOptions = {
    messageId: "builderCreate",
    address,
    builderAddress,
    builderFunction,
    builderRole,
    builderStreamAddress,
    builderCohort,
    batchNumber,
    batchStatus,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  let user = await db.findUserByAddress(builderAddress);

  if (user.exists) {
    res.status(400).send("The builder already exists");
    return;
  }

  const builderData = {
    creationTimestamp: new Date().getTime(),
    role: builderRole,
    function: builderFunction,
  };

  if (builderStreamAddress) {
    builderData.stream = {
      streamAddress: builderStreamAddress,
    };
  }

  if (builderCohort) {
    builderData.builderCohort = builderCohort;
  }

  if (batchNumber) {
    builderData.batch = {
      number: batchNumber,
      ...(batchStatus && { status: batchStatus }),
    };
  }

  const ens = await getEnsFromAddress(builderAddress);
  if (ens) {
    builderData.ens = ens;
  }

  // Create user.
  await db.createUser(builderAddress, builderData);
  user = await db.findUserByAddress(builderAddress);
  console.log("New user created: ", builderAddress);
  const event = createEvent(EVENT_TYPES.USER_CREATE, { userAddress: builderAddress }, signature);
  db.createEvent(event); // INFO: async, no await here

  res.json(user.data);
});

router.patch("/update", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["builderAddress", "builderFunction", "builderRole", "signature"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  // ToDo. Param validation.
  const {
    builderAddress,
    builderFunction,
    builderRole,
    signature,
    builderStreamAddress,
    builderCohort,
    batchNumber,
    batchStatus,
  } = req.body;
  const address = req.address;
  console.log("PATCH /builders/update", address, builderAddress);

  const verifyOptions = {
    messageId: "builderEdit",
    address,
    builderAddress,
    builderFunction,
    builderRole,
    builderStreamAddress,
    builderCohort,
    batchNumber,
    batchStatus,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  let user = await db.findUserByAddress(builderAddress);

  if (!user.exists) {
    res.status(400).send("The builder doesn't exist");
    return;
  }

  const builderData = {
    role: builderRole,
    function: builderFunction,
  };

  if (builderStreamAddress !== user.data.stream?.streamAddress) {
    builderData.stream = {
      streamAddress: builderStreamAddress,
    };
  }

  if (builderCohort !== user.data.builderCohort?.name) {
    builderData.builderCohort = builderCohort ?? {};
  }

  if (batchNumber !== user.data.batch?.number || batchStatus !== user.data.batch?.status) {
    builderData.batch = {
      number: batchNumber ?? user.data.batch?.number,
      status: batchStatus ?? user.data.batch?.status,
    };
  }

  // Update user.
  await db.updateUser(builderAddress, builderData);
  user = await db.findUserByAddress(builderAddress);
  console.log("User updated: ", builderAddress);

  res.json(user.data);
});

router.post("/update-socials", withAddress, async (req, res) => {
  const { socialLinks, signature } = req.body;
  const address = req.address;
  console.log("POST /builders/update-socials", address, socialLinks);

  const verifyOptions = {
    messageId: "builderUpdateSocials",
    address,
    socialLinks,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(address, { socialLinks });
  res.status(200).json(updatedUser);
});

router.post("/update-status", withAddress, async (req, res) => {
  const { status, signature } = req.body;
  const address = req.address;
  console.log("POST /builders/update-status", address, status);

  const verifyOptions = {
    messageId: "builderUpdateStatus",
    address,
    status,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const newStatusData = {
    text: status,
    timestamp: new Date().getTime(),
  };

  const updatedUser = await db.updateUser(address, { status: newStatusData });

  const event = createEvent(EVENT_TYPES.USER_UPDATE_STATUS, { userAddress: address, text: status }, signature);
  db.createEvent(event); // INFO: async, no await here

  res.status(200).json(updatedUser);
});

router.post("/update-location", withAddress, async (req, res) => {
  const { location, signature } = req.body;
  const address = req.address;
  console.log("POST /builders/update-location", address, location);

  const verifyOptions = {
    messageId: "builderUpdateLocation",
    address,
    location,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(address, { location });

  res.status(200).json(updatedUser);
});

router.post("/update-reached-out", withRole("admin"), async (request, response) => {
  const { reachedOut, builderAddress, signature } = request.body;
  const address = request.address;
  console.log("POST /builders/update-reached-out", address, reachedOut);

  const verifyOptions = {
    messageId: "builderUpdateReachedOut",
    address,
    reachedOut,
    builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    response.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(builderAddress, { reachedOut });
  response.status(200).send(updatedUser);
});

router.post("/update-scholarship", withRole("admin"), async (request, response) => {
  const { scholarship, builderAddress, signature } = request.body;
  const address = request.address;
  console.log("POST /builders/update-scholarship", address, scholarship);

  const verifyOptions = {
    messageId: "builderUpdateScholarship",
    address,
    scholarship,
    builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    response.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(builderAddress, { scholarship });
  response.status(200).send(updatedUser);
});

router.post("/update-graduated", withRole("admin"), async (request, response) => {
  const { graduated, reason, builderAddress, signature } = request.body;
  const address = request.address;
  console.log("POST /builders/update-graduated", address, graduated, reason);

  const verifyOptions = {
    messageId: "builderUpdateGraduated",
    address,
    graduated,
    reason,
    builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    response.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const graduatedField = {
    status: graduated,
    reason,
  };

  const updatedUser = await db.updateUser(builderAddress, { graduated: graduatedField });
  response.status(200).send(updatedUser);
});

router.post("/update-disabled", withRole("admin"), async (request, response) => {
  const { disabled, builderAddress, signature } = request.body;
  const address = request.address;
  console.log("POST /builders/update-disabled", address, disabled);

  const verifyOptions = {
    messageId: "builderUpdateDisabled",
    address,
    disabled,
    builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    response.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(builderAddress, { disabled });
  response.status(200).send(updatedUser);
});

module.exports = router;
