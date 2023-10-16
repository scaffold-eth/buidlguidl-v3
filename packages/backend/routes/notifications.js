const express = require("express");
const db = require("../services/db/db");
const { withAddress } = require("../middlewares/auth");
const { isUserEligibleForNotification } = require("../utils/notifications");

const router = express.Router();

/**
 * Get all Notifications for a given address
 */
router.get("/", withAddress, async (req, res) => {
  console.log("/notifications");
  const allNotifications = await db.findAllNotifications();

  const builderAddress = req.address;
  const user = await db.findUserByAddress(builderAddress);
  if (!user.exists) {
    res.sendStatus(404);
    return;
  }

  const eligibleNotifications = allNotifications.filter(notification =>
    isUserEligibleForNotification(user.data, notification),
  );

  res.json(eligibleNotifications);
});

module.exports = router;
