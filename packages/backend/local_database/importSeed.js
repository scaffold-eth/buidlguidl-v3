require("dotenv").config();
const fs = require("fs");

const importSeed = async database => {
  // Seed check
  const SEED_PATH = "./local_database/seed.json";
  const SEED_EXAMPLE_PATH = "./local_database/seed.sample.json";

  const existingCollections = await database.listCollections();
  if (existingCollections.length > 0) {
    console.log("*** Local firebase is not empty. Skipping seed import...");
    return;
  }

  if (!fs.existsSync(SEED_PATH)) {
    // Seed the local database if empty.
    fs.copyFileSync(SEED_EXAMPLE_PATH, SEED_PATH, fs.constants.COPYFILE_EXCL);
  }

  const exampleSeed = JSON.parse(fs.readFileSync(SEED_EXAMPLE_PATH, "utf8"));
  const currentSeed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

  const needsToUpdateDbVersion = exampleSeed.version !== currentSeed.version;
  if (needsToUpdateDbVersion) {
    console.log("New local db version: overwriting exiting seed file");
    fs.copyFileSync(SEED_EXAMPLE_PATH, SEED_PATH);
  }

  // Do Import
  const seedToImport = needsToUpdateDbVersion ? exampleSeed : currentSeed;
  console.log("Importing seed to firebase emulator....");

  // Users
  Object.entries(seedToImport.users).forEach(([userId, userData]) => {
    database.collection("users").doc(userId).set(userData);
  });

  // Builds
  Object.entries(seedToImport.builds).forEach(([buildId, buildData]) => {
    database.collection("builds").doc(buildId).set(buildData);
  });

  // Events
  Object.entries(seedToImport.events).forEach(([_, eventData]) => {
    database.collection("events").add(eventData);
  });

  // Config
  Object.entries(seedToImport.config).forEach(([configId, configData]) => {
    database.collection("config").doc(configId).set(configData);
  });

  // Cohorts
  Object.entries(seedToImport.cohorts).forEach(([cohortId, cohortData]) => {
    database.collection("cohorts").doc(cohortId).set(cohortData);
  });

  // Notifications
  Object.entries(seedToImport.notifications).forEach(([_, notificationData]) => {
    database.collection("notifications").add(notificationData);
  });

  // Batches
  if (seedToImport.batches) {
    Object.entries(seedToImport.batches).forEach(([batchId, batchData]) => {
      database.collection("batches").doc(batchId).set(batchData);
    });
  }
};

module.exports = {
  importSeed,
};
