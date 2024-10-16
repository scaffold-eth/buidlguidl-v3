const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withRole } = require("../middlewares/auth");

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
    number: Number(batchNumber),
    status: batchStatus,
    startDate: Number(batchStartDate),
    telegramLink: batchTelegramLink,
  };

  if (batchContractAddress) {
    batchData.contractAddress = batchContractAddress;
  }

  // Create batch.
  await db.createBatch(batchData);
  batch = await db.findBatchByNumber(batchNumber);
  console.log("New batch created: ", batchNumber);
  // TODO: create event, do we need it for batches?
  //   const event = createEvent(EVENT_TYPES.USER_CREATE, { userAddress: builderAddress }, signature);
  //   db.createEvent(event); // INFO: async, no await here

  res.json(batch.data);
});

router.patch("/update", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["batchNumber", "batchStatus", "batchStartDate", "batchTelegramLink"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  const { signature, batchNumber, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress, id } = req.body;
  const address = req.address;
  console.log("PATCH /batches/update", address, batchNumber);

  const verifyOptions = {
    messageId: "batchEdit",
    address,
    batchNumber,
    batchStatus,
    batchStartDate,
    batchTelegramLink,
    batchContractAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  let batch = await db.findBatchByNumber(batchNumber);

  const batchData = {
    number: Number(batchNumber),
    status: batchStatus,
    startDate: Number(batchStartDate),
    telegramLink: batchTelegramLink,
  };

  if (batchContractAddress) {
    batchData.contractAddress = batchContractAddress;
  }

  //   Update batch
  await db.updateBatch(id, batchData);
  batch = await db.findBatchByNumber(batchNumber);
  console.log("batch updated: ", batchNumber);

  res.json(batch.data);
});

module.exports = router;
