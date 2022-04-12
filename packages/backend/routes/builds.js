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
  // ToDo. Featured not used now, but keeping it for now.
  const featured = req.query.featured ? Boolean(req.query.featured) : null;
  const allBuilds = await db.findAllBuilds(featured);
  res.json(allBuilds);
});

/**
 * Get a Build by id.
 */
router.get("/:buildId", async (req, res) => {
  const buildId = req.params.buildId;
  console.log(`/builds/${buildId}`);
  const build = await db.findBuildById(buildId);
  res.json(build);
});

/**
 * Get all Builds for a given Builder
 */
router.get("/builder/:builderAddress", async (req, res) => {
  const builderAddress = req.params.builderAddress;
  console.log(`/builds/builder/${builderAddress}`);

  const builderBuilds = await db.findBuilderBuilds(builderAddress);
  res.json(builderBuilds);
});

/**
 * Create a new build.
 */
router.post("/", withRole("builder"), async (req, res) => {
  console.log("POST /builds");
  const { buildUrl, demoUrl, desc, image, name, signature } = req.body;
  const address = req.address;

  const verifyOptions = {
    messageId: "buildSubmit",
    address,
    buildUrl,
    demoUrl,
    desc,
    name,
    image,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const buildData = {
    branch: buildUrl,
    demoUrl,
    desc,
    image,
    name,
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

/**
 * Edit a build.
 */
router.patch("/:buildId", withRole("builder"), async (req, res) => {
  const buildId = req.params.buildId;
  const { buildUrl, demoUrl, desc, image, name, signature } = req.body;
  console.log("EDIT /builds/", buildId);

  const address = req.address;

  const verifyOptions = {
    messageId: "buildEdit",
    address,
    buildId,
    buildUrl,
    demoUrl,
    desc,
    name,
    image,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  // Make sure build is owned by the user.
  const build = await db.findBuildById(buildId);

  if (build.builder !== address) {
    const requestingBuilder = await db.findUserByAddress(address);

    if (requestingBuilder?.data?.role !== "admin") {
      // Bypass admins
      res.status(401).send("Not your build.");
      return;
    }
  }

  const buildData = {
    branch: buildUrl,
    demoUrl,
    desc,
    image,
    name,
    // Keep existing build (admin can edit)
    builder: build.builder,
  };

  await db.updateBuild(buildId, buildData);

  const eventPayload = {
    userAddress: address,
    buildId,
    name: build.name,
  };

  const event = createEvent(EVENT_TYPES.BUILD_EDIT, eventPayload, signature);
  db.createEvent(event); // INFO: async, no await here

  res.sendStatus(200);
});

/**
 * Delete a build.
 */
router.delete("/:buildId", withRole("builder"), async (req, res) => {
  const buildId = req.params.buildId;
  console.log("DELETE /builds/", buildId);

  const address = req.address;
  const { signature } = req.body;

  const verifyOptions = {
    messageId: "buildDelete",
    address,
    buildId,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  // Make sure build is owned by the user.
  const build = await db.findBuildById(buildId);

  if (build.builder !== address) {
    const requestingBuilder = await db.findUserByAddress(address);

    if (requestingBuilder?.data?.role !== "admin") {
      // Bypass admins
      res.status(401).send("Not your build.");
      return;
    }
  }

  await db.deleteBuild(buildId);

  const eventPayload = {
    userAddress: address,
    buildId,
    name: build.name,
  };

  const event = createEvent(EVENT_TYPES.BUILD_DELETE, eventPayload, signature);
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
 * Post a like for a build.
 */
router.post("/like", withRole("builder"), async (req, res) => {
  const { buildId, signature, userAddress } = req.body;
  console.log(`POST /builds/like`);
  const address = req.address;

  const verifyOptions = {
    messageId: "buildLike",
    address,
    buildId,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  const build = await db.findBuildById(buildId);
  const currentLikesSet = new Set(build.likes ?? []);
  const willUnlike = currentLikesSet.has(address);

  if (willUnlike) {
    currentLikesSet.delete(address);
  } else {
    currentLikesSet.add(address);
  }

  await db.updateBuild(buildId, { likes: Array.from(currentLikesSet) });

  const eventPayload = {
    liked: !willUnlike,
    userAddress,
    buildId,
    name: build.name,
  };
  const event = createEvent(EVENT_TYPES.BUILD_LIKED, eventPayload, signature);
  db.createEvent(event); // INFO: async, no await here

  res.sendStatus(200);
});

/**
 * Feature / Unfeature a build
 */
router.patch("/", withRole("admin"), async (req, res) => {
  console.log("PATCH /builds");
  const { buildId, featured, signature, userAddress } = req.body;
  const address = req.address;

  const verifyOptions = {
    messageId: "buildFeature",
    address,
    buildId,
    featured,
  };

  const isSignatureValid = await verifySignature(signature, verifyOptions);
  if (!isSignatureValid) {
    res.status(401).send(" 🚫 Signature verification failed! Please reload and try again. Sorry! 😅");
    return;
  }

  // TODO we can skip this query if the db.featureBuild returns the featured build
  const build = await db.findBuildById(buildId);
  await db.featureBuild(buildId, Boolean(featured));

  const eventPayload = {
    featured,
    userAddress,
    reviewerAddress: address,
    buildId,
    name: build.name,
  };
  const event = createEvent(EVENT_TYPES.BUILD_FEATURED, eventPayload, signature);
  db.createEvent(event); // INFO: async, no await here

  res.sendStatus(200);
});

module.exports = router;
