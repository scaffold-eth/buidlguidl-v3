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
  const { builderAddress, builderFunction, builderRole, signature, builderStreamAddress } = req.body;
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
  const { builderAddress, builderFunction, builderRole, signature, builderStreamAddress } = req.body;
  const address = req.address;
  console.log("PATCH /builders/update", address, builderAddress);

  const verifyOptions = {
    messageId: "builderEdit",
    address,
    builderAddress,
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

module.exports = router;
