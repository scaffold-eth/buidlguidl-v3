const express = require("express");
const db = require("../services/db/db");
const { getEnsFromAddress } = require("../utils/ens");

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

module.exports = router;
