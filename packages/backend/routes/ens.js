const express = require("express");
const db = require("../services/db/db");
const { getEnsFromAddress } = require("../utils/ens");
const { withAddress, withRole } = require("../middlewares/auth");
const { verifySignature } = require("../utils/sign");

const router = express.Router();

// Look up for new builder ENS.
// ToDo. Handle builders ENS changes.
router.get("/update", async (req, res) => {
  console.log("/ens/update");
  if (process.env.NODE_ENV === "production" && req.header("X-Appengine-Cron") !== "true") {
    return res.status(403).send();
  }
  const builders = await db.findAllUsers();

  const updates = await Promise.all(
    builders.map(async builder => {
      if (builder.ens) return false;

      const builderAddress = builder.id;
      const ens = await getEnsFromAddress(builderAddress);

      if (ens) {
        // Save builder ENS.
        console.log("Saving ENS", ens);
        await db.updateUser(builder.id, { ens });
        return ens;
      }

      return false;
    }),
  );

  const updated = updates.filter(result => !!result).length;
  return res.status(200).send({ updated });
});

// Claim ENS
router.post("/claim", withAddress, async (req, res) => {
  const { signature } = req.body;
  const address = req.address;
  console.log("POST /ens/claim", address);

  const verifyOptions = {
    messageId: "builderClaimEns",
    address,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const builder = await db.findUserByAddress(address);
  if (!builder.exists || builder.data.ens) {
    res.status(401).send(" 🚫 Can't claim an ENS");
    return;
  }

  const ensClaimData = {
    submittedTimestamp: new Date().getTime(),
    provided: false,
  };

  const updatedUser = await db.updateUser(address, { ensClaimData });
  res.status(200).json(updatedUser);
});

// Mark as ENS provided for builder.
router.patch("/claim", withRole("admin"), async (req, res) => {
  const { builderAddress, signature } = req.body;
  const address = req.address;
  console.log("PATCH /ens/claim", builderAddress);

  const verifyOptions = {
    messageId: "builderProvideEns",
    address,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const builder = await db.findUserByAddress(address);

  const ensClaimData = {
    ...builder.data.ensClaimData,
    provided: true,
  };

  const updatedUser = await db.updateUser(address, { ensClaimData });
  res.status(200).json(updatedUser);
});

module.exports = router;
