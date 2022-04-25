const express = require("express");
const ethers = require("ethers");
const db = require("../services/db/db");
const { getStreamEvents } = require("../utils/streams");
const { withRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Update all builders stream data.
 */
router.get("/update", async (req, res) => {
  console.log("/streams/update");
  if (process.env.NODE_ENV === "production" && req.header("X-Appengine-Cron") !== "true") {
    return res.status(403).send();
  }
  const maxItems = Number(req.query.max) || 100;
  const provider = new ethers.providers.StaticJsonRpcProvider(process.env.RPC_URL);
  const currentBlock = await provider.getBlockNumber();
  const streams = await db.findUpdatableStreams({ limit: maxItems });
  let updated = 0;

  const updates = streams.map(async stream => {
    const fromBlock = stream.lastIndexedBlock ?? 0;

    return [await getStreamEvents(provider, stream, fromBlock, currentBlock), stream];
  });

  Promise.all(updates)
    .then(async streamsResult => {
      await Promise.all(
        streamsResult.map(async ([streamUpdate, stream]) => {
          if (streamUpdate.events.length) {
            console.log("Updating stream data for", stream.builderAddress);
            await db.updateStreamData(stream, streamUpdate);
            updated += 1;
          }
        }),
      );
      // Not using it right now, but keeping it up to date.
      console.log("Updating stream lastIndexedBlock", currentBlock);
      await db.setConfigData("streams", { lastIndexedBlock: currentBlock });
      res.status(200).send({ updated });
    })
    .catch(e => {
      console.error("Error found. Not updating lastIndexedBlock", e);
      res.status(500).send();
    });
});

/**
 * Update a single builder stream data.
 */
router.post("/update-single", withRole("builder"), async (req, res) => {
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
    const result = await getStreamEvents(provider, stream, fromBlock, currentBlock);
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
