const express = require("express");
const db = require("../services/db/db");
const { verifySignature } = require("../utils/sign");
const { withAddress } = require("../middlewares/auth");

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
