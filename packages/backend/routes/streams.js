const express = require("express");
const ethers = require("ethers");
const db = require("../services/db/db");
const { getStreamEvents } = require("../utils/streams");

const router = express.Router();

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

  const lastIndexedBlock = (await db.getConfigData("streams")).lastIndexedBlock ?? 0;
  const updates = streams.map(async stream => {
    const fromBlock = stream.lastIndexedBlock ? lastIndexedBlock : 0;

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
      console.log("Updating stream lastIndexedBlock", currentBlock);
      await db.setConfigData("streams", { lastIndexedBlock: currentBlock });
      res.status(200).send({ updated });
    })
    .catch(e => {
      console.error("Error found. Not updating lastIndexedBlock", e);
      res.status(500).send();
    });
});

module.exports = router;
