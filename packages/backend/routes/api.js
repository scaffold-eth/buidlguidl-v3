const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { createEvent, EVENT_TYPES } = require("../utils/events");
const { withApiKey } = require("../middlewares/auth");
const { getEnsFromAddress } = require("../utils/ens");
const moment = require("moment");

const router = express.Router();

// ToDo. Api Auth Middleware
router.post("/builders/create", withApiKey, async (req, res) => {
  const { builderAddress, existingBuilderData } = req.body;
  if (builderAddress === undefined) {
    res.status(400).send(`Missing required "builderAddress" body property`);
    return;
  }
  console.log("API POST /api/builders/create", builderAddress, existingBuilderData);

  if (!ethers.utils.isAddress(builderAddress)) {
    res.status(400).send("Invalid address");
    return;
  }

  let user = await db.findUserByAddress(builderAddress);

  if (user.exists) {
    res.sendStatus(204);
    return;
  }

  const builderData = {
    creationTimestamp: new Date().getTime(),
    role: "builder",
    function: "cadets",
    ...existingBuilderData,
  };

  const ens = await getEnsFromAddress(builderAddress);
  if (ens) {
    builderData.ens = ens;
  }

  // Create user.
  await db.createUser(builderAddress, builderData);
  user = await db.findUserByAddress(builderAddress);
  console.log("New user created: ", builderAddress);
  const event = createEvent(EVENT_TYPES.USER_CREATE, { userAddress: builderAddress, fromApiCall: true }, "api-call");
  db.createEvent(event); // INFO: async, no await here

  res.json(user.data);
});

router.get("/stats", async (req, res) => {
  console.log("/stats");
  const builders = await db.findAllUsers();
  const builds = await db.findAllBuilds();
  const depositEvents = await db.findEventsWhere({ conditions: { type: EVENT_TYPES.STREAM_DEPOSIT } });

  const streamedEth = depositEvents.reduce((prevValue, currentValue) => {
    return prevValue + parseFloat(currentValue?.payload?.amount ?? 0.0);
  }, 0.0);

  const timestampOneMonthAgo = moment().subtract(1, "months").valueOf();
  const buildersMonth = builders.filter(builder => builder.creationTimestamp > timestampOneMonthAgo);
  const buildsMonth = builds.filter(build => build.submittedTimestamp > timestampOneMonthAgo);
  const depositEventsMonth = depositEvents.filter(event => event.timestamp > timestampOneMonthAgo);
  const streamedEthMonth = depositEventsMonth.reduce((prevValue, currentValue) => {
    return prevValue + parseFloat(currentValue?.payload?.amount ?? 0.0);
  }, 0.0);

  res.status(200).send({
    builderCount: builders.length,
    buildCount: builds.length,
    streamedEth,
    buildersIncrementMonth: buildersMonth.length,
    buildsIncrementMonth: buildsMonth.length,
    streamedEthMonth,
  });
});

module.exports = router;
