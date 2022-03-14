const express = require("express");
const { ethers } = require("ethers");
const db = require("../services/db/db");
const { createEvent, EVENT_TYPES } = require("../utils/events");

const router = express.Router();

// ToDo. Api Auth Middleware
router.post("/builders/create", async (req, res) => {
  const { builderAddress } = req.body;
  if (builderAddress === undefined) {
    res.status(400).send(`Missing required "builderAddress" body property`);
    return;
  }
  console.log("API POST /api/builders/create", builderAddress);

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
  };

  // Create user.
  await db.createUser(builderAddress, builderData);
  user = await db.findUserByAddress(builderAddress);
  console.log("New user created: ", builderAddress);
  const event = createEvent(EVENT_TYPES.USER_CREATE, { userAddress: builderAddress, fromApiCall: true }, "api-call");
  db.createEvent(event); // INFO: async, no await here

  res.json(user.data);
});

module.exports = router;
