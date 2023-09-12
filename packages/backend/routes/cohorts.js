const express = require("express");
const db = require("../services/db/db");
const { updateCohorts } = require("../utils/cohorts");

const router = express.Router();

/**
 * Get all Cohort data.
 */
router.get("/", async (req, res) => {
  console.log("/cohorts");
  const allCohorts = await db.findAllCohorts();
  res.json(allCohorts);
});

/**
 * Get all Cohort data with stats.
 */
router.get("/stats", async (req, res) => {
  console.log("/cohorts/stats");
  const allCohorts = await db.findAllCohorts();
  const events = await db.findEventsWhere({ conditions: { type: "cohort.withdraw" } });

  // Get all the withdrawals by cohort
  const totalWithdrawByCohort = events.reduce((acc, event) => {
    const address = event.payload.streamAddress;

    if (!acc[address]) {
      acc[address] = { totalWithdrawn: 0 };
    }

    acc[address].totalWithdrawn += parseFloat(event.payload.amount);

    return acc;
  }, {});

  const allCohortWithStats = allCohorts.map(item => {
    return {
      ...item,
      totalWithdrawn: totalWithdrawByCohort[item.id]?.totalWithdrawn ?? 0,
    };
  });

  res.json(allCohortWithStats);
});

/**
 * Update all cohort  data. (GET)
 */
router.get("/update", async (req, res) => {
  console.log("GET /cohorts/update");
  // This route is meant for cron runs. Protect it.
  if (process.env.NODE_ENV === "production" && req.header("X-Appengine-Cron") !== "true") {
    return res.status(403).send();
  }

  try {
    const updated = await updateCohorts();
    res.status(200).send({ updated });
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
