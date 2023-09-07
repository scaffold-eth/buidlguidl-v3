const express = require("express");
const db = require("../services/db/db");

const router = express.Router();

/**
 * Get all Cohort data.
 */
router.get("/", async (req, res) => {
  console.log("/cohorts");
  const allCohorts = await db.findAllCohorts();
  res.json(allCohorts);
});

module.exports = router;
