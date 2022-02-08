const express = require("express");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withAddress, withRole } = require("../middlewares/auth");
const { EVENT_TYPES, createEvent } = require("../utils/events");

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

  const { builderAddress, builderFunction, builderRole, signature } = req.body;
  const address = req.address;
  console.log("POST /builders/create", address, builderAddress);

  const verifyOptions = {
    messageId: "builderCreate",
    address,
    builderAddress,
  };

  if (!verifySignature(signature, verifyOptions)) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  let user = await db.findUserByAddress(builderAddress);

  if (user.exists) {
    res.status(400).send("The builder already exists");
    return;
  }

  // Create user.
  await db.createUser(builderAddress, {
    creationTimestamp: new Date().getTime(),
    role: builderRole,
    function: builderFunction,
  });
  user = await db.findUserByAddress(builderAddress);
  console.log("New user created: ", builderAddress);
  const event = createEvent(EVENT_TYPES.USER_CREATE, { builderAddress }, signature);
  db.createEvent(event); // INFO: async, no await here

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

  if (!verifySignature(signature, verifyOptions)) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const updatedUser = await db.updateUser(address, { socialLinks });
  res.status(200).json(updatedUser);
});

module.exports = router;
