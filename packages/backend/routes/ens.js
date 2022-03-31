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

// Get all pending ENS claims
router.get("/claims", async (req, res) => {
  console.log("GET /ens/claims");

  const buildersWithPendingEnsClaims = await db.getBuildersWithPendingEnsClaims();

  res.status(200).json(buildersWithPendingEnsClaims);
});

// Claim ENS
router.post("/claims", withAddress, async (req, res) => {
  const { signature } = req.body;
  const address = req.address;
  console.log("POST /ens/claims", address);

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
router.patch("/claims", withRole("admin"), async (req, res) => {
  const { builderAddress, signature } = req.body;
  const address = req.address;
  console.log("PATCH /ens/claims", builderAddress);

  const verifyOptions = {
    messageId: "builderProvideEns",
    address,
    builderAddress,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const builder = await db.findUserByAddress(builderAddress);

  const ensClaimData = {
    ...builder.data.ensClaimData,
    provided: true,
  };

  const updatedUser = await db.updateUser(builderAddress, { ensClaimData });
  res.status(200).json(updatedUser);
});

module.exports = router;
