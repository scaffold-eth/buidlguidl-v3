const express = require("express");
const formidable = require("formidable");
const db = require("../services/db/db");
const storage = require("../services/storage/storage");
const { verifySignature } = require("../utils/sign");
const { EVENT_TYPES, createEvent } = require("../utils/events");
const { withRole } = require("../middlewares/auth");

const router = express.Router();

/**
 * Get all Builds.
 */
router.get("/", async (req, res) => {
  console.log("/builds");
  const featured = !!req.query.featured;
  const allBuilds = await db.findAllBuilds(featured);
  res.json(allBuilds);
});

/**
 * Get all Builds for a given Builder
 */
router.get("/:builderAddress", async (req, res) => {
  const builderAddress = req.params.builderAddress;
  console.log(`/builds/${builderAddress}`);

  const builderBuilds = await db.findBuilderBuilds(builderAddress);
  res.json(builderBuilds);
});

/**
 * Create a new build.
 */
router.post("/", withRole("builder"), async (req, res) => {
  console.log("POST /builds");
  const { buildUrl, desc, image, name, signature } = req.body;
  const address = req.address;

  const verifyOptions = {
    messageId: "buildSubmit",
    address,
    buildUrl,
  };

  if (!verifySignature(signature, verifyOptions)) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const buildData = {
    branch: buildUrl,
    desc,
    image,
    name,
    address,
    builder: address,
    featured: false,
    submittedTimestamp: new Date().getTime(),
  };

  const dbResponse = await db.createBuild(buildData);

  const eventPayload = {
    userAddress: address,
    buildUrl,
    name,
    buildId: dbResponse.id,
  };

  const event = createEvent(EVENT_TYPES.BUILD_SUBMIT, eventPayload, signature);
  db.createEvent(event); // INFO: async, no await here

  res.sendStatus(200);
});

router.post("/upload-img", withRole("builder"), async (req, res) => {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const file = files.imageFile;
    if (err || !file) {
      return res.sendStatus(400);
    }

    let imgFullUrl;
    try {
      imgFullUrl = await storage.uploadFile(file, req);
    } catch (e) {
      return res.sendStatus(400);
    }

    console.log("Uploaded file", imgFullUrl);
    return res.json({ imgUrl: imgFullUrl });
  });
});

/**
 * Publish / Delete a build
 */
router.patch("/", withRole("admin"), async (req, res) => {
  console.log("PATCH /builds");
  const { buildId, newStatus, signature, userAddress } = req.body;
  const address = req.address;

  const verifyOptions = {
    messageId: "buildReview",
    address,
    buildId,
    newStatus,
  };

  if (!verifySignature(signature, verifyOptions)) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  if (newStatus !== "ACCEPTED" && newStatus !== "REJECTED") {
    res.status(400).send("Invalid status");
    return;
  }

  if (newStatus === "ACCEPTED") {
    await db.publishBuild(buildId);
  } else if (newStatus === "REJECTED") {
    await db.removeBuild(buildId);
  }

  const eventPayload = {
    reviewAction: newStatus,
    userAddress,
    reviewerAddress: address,
    buildId,
  };
  const event = createEvent(EVENT_TYPES.BUILD_REVIEW, eventPayload, signature);
  db.createEvent(event); // INFO: async, no await here

  res.sendStatus(200);
});

module.exports = router;
