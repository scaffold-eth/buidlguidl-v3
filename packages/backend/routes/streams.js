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
  const streams = db.findUpdatableStreams({ lastBlock: currentBlock, limit: maxItems });
  let updated = 0;

  const updates = streams.map(async stream => {
    const streamUpdate = await getStreamEvents(provider, stream.streamAddress, stream.lastIndexedBlock, currentBlock);

    if (!streamUpdate.events.length) {
      return;
    }
    db.updateStreamData(stream, streamUpdate);
    updated += 1;
  });

  Promise.all(updates)
    .then(() => {
      res.status(200).send({ updated });
    })
    .catch(e => {
      console.error(e);
      res.status(500).send();
    });
});

module.exports = router;
