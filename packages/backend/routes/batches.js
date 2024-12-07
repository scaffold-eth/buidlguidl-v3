const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withRole } = require("../middlewares/auth");
const { getNFTContractAddress } = require("../utils/contracts");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("/batches");

  const builders = await db.findAllBatchedUsers();
  const batches = await db.findAllBatches();

  const stats = batches.map(batch => {
    const batchBuilders = builders.filter(builder => builder.batch?.number === batch.name);
    const batchGraduates = batchBuilders.filter(builder => builder.batch?.status === "graduate");

    return {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      startDate: batch.startDate,
      telegramLink: batch.telegramLink,
      contractAddress: batch.contractAddress,
      totalParticipants: batchBuilders.length,
      graduates: batchGraduates.length,
    };
  });

  res.status(200).json(stats);
});

router.get("/latest-open", async (req, res) => {
  console.log("/batches/latest-open");
  const batch = await db.findLatestOpenBatch();
  res.status(200).send(batch);
});

router.post("/create", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["batchName", "batchStatus", "batchStartDate", "batchTelegramLink"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  const { signature, batchName, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress } = req.body;
  const address = req.address;
  console.log("POST /batches/create", address, batchName);

  if (batchContractAddress && !ethers.utils.isAddress(batchContractAddress)) {
    res.status(400).send("Invalid address");
    return;
  }

  const verifyOptions = {
    messageId: "batchCreate",
    address,
    batchName,
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

  let batch = await db.findBatchByName(batchName);

  if (batch.exists) {
    res.status(400).send("The batch already exists");
    return;
  }

  const batchData = {
    name: batchName,
    status: batchStatus,
    startDate: Number(batchStartDate),
    telegramLink: batchTelegramLink,
  };

  if (batchContractAddress) {
    batchData.contractAddress = batchContractAddress;
    batchData.nftContractAddress = await getNFTContractAddress(batchContractAddress);
  }

  // Create batch.
  await db.createBatch(batchData);
  batch = await db.findBatchByName(batchName);

  res.json(batch.data);
});

router.patch("/update", withRole("admin"), async (req, res) => {
  const neededBodyProps = ["batchName", "batchStatus", "batchStartDate", "batchTelegramLink"];
  if (neededBodyProps.some(prop => req.body[prop] === undefined)) {
    res.status(400).send(`Missing required body property. Required: ${neededBodyProps.join(", ")}`);
    return;
  }

  const { signature, batchName, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress, id } = req.body;
  const address = req.address;
  console.log("PATCH /batches/update", address, batchName);

  const verifyOptions = {
    messageId: "batchEdit",
    address,
    batchName,
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

  let batch = await db.findBatchByName(batchName);
  const batchById = await db.findBatchById(id);

  if (batch.exists && batch.data.number !== batchById.data.number) {
    res.status(400).send("The batch already exists");
    return;
  }

  const batchData = {
    name: batchName,
    status: batchStatus,
    startDate: Number(batchStartDate),
    telegramLink: batchTelegramLink,
  };

  if (!batchContractAddress) {
    batchData.contractAddress = "";
    batchData.nftContractAddress = "";
  } else if (batchContractAddress !== batch.data.contractAddress) {
    batchData.contractAddress = batchContractAddress;
    batchData.nftContractAddress = await getNFTContractAddress(batchContractAddress);
  }

  //   Update batch
  await db.updateBatch(id, batchData);
  batch = await db.findBatchByName(batchName);
  console.log("batch updated: ", batchName);

  res.json(batch.data);
});

router.get("/:batchName", async (req, res) => {
  console.log("GET /batches/:batchName", req.params.batchName);
  const batchName = req.params.batchName;
  const batch = await db.findBatchByName(batchName);
  res.json(batch.data);
});

module.exports = router;
