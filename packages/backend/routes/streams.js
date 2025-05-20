const express = require("express");
const ethers = require("ethers");
const db = require("../services/db/db");
const { getStreamEvents, updateStreamsForBuilders } = require("../utils/streams");
const { withRole, readOnlyMode } = require("../middlewares/auth");
const { verifySignature } = require("../utils/sign");

const router = express.Router();

/**
 * Update all builders stream data. (GET)
 */
router.get("/update", async (req, res) => {
  console.log("GET /streams/update");
  // This route is meant for cron runs. Protect it.
  if (process.env.NODE_ENV === "production" && req.header("X-Appengine-Cron") !== "true") {
    return res.status(403).send();
  }

  try {
    const updated = await updateStreamsForBuilders(req.query.max);
    res.status(200).send({ updated });
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * Update all builders stream data. (POST)
 */
router.post("/update", readOnlyMode, withRole("builder"), async (req, res) => {
  console.log("POST /streams/update");

  const { signature } = req.body;
  const address = req.address;

  const verifyOptions = {
    messageId: "streamsUpdate",
    address,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  try {
    const updated = await updateStreamsForBuilders(req.query.max);
    res.status(200).send({ updated });
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * Update a single builder stream data.
 */
router.post("/update-single", readOnlyMode, withRole("builder"), async (req, res) => {
  const address = req.address;
  console.log("/streams/update-single", address);

  const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);
  const currentBlock = await provider.getBlockNumber();

  const builderData = await db.findUserByAddress(address);
  const builder = builderData.data;
  const stream = builder.stream;

  const fromBlock = stream.lastIndexedBlock ?? 0;
  let updated = 0;

  try {
    const result = await getStreamEvents(provider, stream, fromBlock + 1, currentBlock);
    if (result.events.length) {
      console.log("Updating stream data for", address);
      await db.updateStreamData({ ...stream, builderAddress: address }, result);
      updated += 1;
    }
  } catch (e) {
    console.error("Error found. Not updating lastIndexedBlock", e);
    return res.status(500).send();
  }

  res.status(200).send({ updated });
});

module.exports = router;
