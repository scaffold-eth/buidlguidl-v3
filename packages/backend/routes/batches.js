const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withAddress, withRole } = require("../middlewares/auth");
const { EVENT_TYPES, createEvent } = require("../utils/events");
const { getEnsFromAddress } = require("../utils/ens");

const router = express.Router();

router.post("/create", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["batchNumber", "batchStatus", "batchStartDate", "batchTelegramLink"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  // ToDo. Param validation.
  const { signature, batchNumber, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress } = req.body;
  const address = req.address;
  console.log("POST /batches/create", address, batchNumber);

  if (batchContractAddress && !ethers.utils.isAddress(batchContractAddress)) {
    res.status(400).send("Invalid address");
    return;
  }

  const verifyOptions = {
    messageId: "batchCreate",
    address,
    batchNumber,
    batchStatus,
    batchStartDate: String(batchStartDate),
    batchTelegramLink,
    batchContractAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  let batch = await db.findBatchByNumber(batchNumber);

  // TODO: show it in the front-end
  if (batch.exists) {
    res.status(400).send("The batch already exists");
    return;
  }

  const batchData = {
    batchNumber: Number(batchNumber),
    batchStatus,
    batchStartDate,
    batchTelegramLink,
  };

  if (batchContractAddress) {
    batchData.batchContractAddress = batchContractAddress;
  }

  // Create user.
  await db.createBatch(batchNumber, batchData);
  batch = await db.findBatchByNumber(batchNumber);
  console.log("New batch created: ", batchNumber);
  //   const event = createEvent(EVENT_TYPES.USER_CREATE, { userAddress: builderAddress }, signature);
  //   db.createEvent(event); // INFO: async, no await here

  res.json(batch.data);
});

// TODO: implement
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

module.exports = router;
