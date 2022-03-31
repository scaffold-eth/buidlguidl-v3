/**
 * LOCAL DATABASE
 *
 *  - Users are stored in an object structure, with keys being users' addresses, and values being users' data.
 *  - Events are stored in an array structure. Each item in the array is the event's data.
 */
require("dotenv").config();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { getProp } = require("../../utils/object");

console.log("using local db");

const DATABASE_PATH = "./local_database/local_db.json";
const SEED_PATH = "./local_database/seed.json";
const databaseSeed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
const emptyTestDatabase = { version: 0, users: {}, builds: {}, events: [] };

if (!fs.existsSync(DATABASE_PATH)) {
  // Seed the local database if empty.
  fs.copyFileSync(SEED_PATH, DATABASE_PATH, fs.constants.COPYFILE_EXCL);
}

const currentDatabase = JSON.parse(fs.readFileSync(DATABASE_PATH, "utf8"));
const needsToUpdateDbVersion = databaseSeed.version !== currentDatabase.version;
if (needsToUpdateDbVersion) {
  console.log("New local db version: overwriting exiting local_db.json file");
  fs.copyFileSync(SEED_PATH, DATABASE_PATH);
}
let database;
if (process.env.NODE_ENV === "test") {
  database = emptyTestDatabase;
} else {
  database = needsToUpdateDbVersion ? databaseSeed : currentDatabase;
}

// --- Utilities
const persist = () => {
  if (process.env.NODE_ENV === "test") {
    // don't persist during tests
    return;
  }
  const file = fs.openSync(DATABASE_PATH, "w");
  fs.writeFileSync(file, JSON.stringify(database, null, 2));
  fs.closeSync(file);
};

/**
 * @param {*} conditionsArg
 * @returns an array of functions for every condition which returns true if a
 * given event passes the condition.
 */
const generateLocalDbConditionsFromArgs = conditionsArg => {
  return Object.entries(conditionsArg).map(([paths, values]) => {
    const brokenPaths = paths.split(",").map(path => path.split("/"));
    const valuesArray = values.split(",");
    return testedEvent => {
      return brokenPaths.some(pathArray => valuesArray.some(value => getProp(testedEvent, pathArray) === value));
    };
  });
};

// --- Users
const findUserByAddress = builderAddress => {
  if (!database.users[builderAddress]) {
    return { exists: false };
  }
  return { exists: true, data: { id: builderAddress, ...database.users[builderAddress] } };
};

const createUser = (userId, userData) => {
  database.users[userId] = userData;
  persist();
};

const updateUser = (userId, userData) => {
  const { id, ...existingUserData } = findUserByAddress(userId).data;

  database.users[userId] = {
    ...existingUserData,
    ...userData,
  };

  persist();

  return database.users[userId];
};

const findAllUsers = () => {
  return Object.entries(database.users).map(([id, userData]) => ({ id, ...userData }));
};

const getBuildersWithPendingEnsClaims = () => {
  return findAllUsers().filter(builder => builder.ensClaimData?.provided === false);
};

// --- Events
const createEvent = event => {
  database.events.push(event);

  persist();
};

const findAllEvents = ({ limit: limitArg } = {}) => {
  const limit = limitArg ?? database.events.length;
  return database.events.sort((a, b) => b.timestamp - a.timestamp).slice(limit * -1);
};

const findEventsWhere = ({ conditions: conditionsArg, limit } = {}) => {
  const allEvents = findAllEvents({ limit });

  const conditions = generateLocalDbConditionsFromArgs(conditionsArg);

  return allEvents.filter(event => conditions.every(condition => condition(event)));
};

const findBuildById = buildId => {
  return { id: buildId, ...database.builds[buildId] };
};

const createBuild = build => {
  const userId = build.builder;
  const newBuildId = uuidv4();
  const { id, ...existingUserData } = findUserByAddress(userId).data;

  // Save build
  database.builds[newBuildId] = build;

  // Save build reference on user.
  const buildsData = existingUserData.builds || [];

  buildsData.push({
    id: newBuildId,
    submittedTimestamp: build.submittedTimestamp,
  });

  database.users[userId] = {
    ...existingUserData,
    builds: buildsData,
  };

  persist();
  return { ...build, id: newBuildId };
};

const updateBuild = (buildId, buildData) => {
  const { id, ...existingBuildData } = findBuildById(buildId);

  database.builds[buildId] = {
    ...existingBuildData,
    ...buildData,
  };

  persist();

  return database.builds[buildId];
};

const deleteBuild = buildId => {
  const { id, ...existingBuildData } = findBuildById(buildId);
  const { id: userId, ...existingUserData } = findUserByAddress(existingBuildData.builder).data;

  delete database.builds[buildId];

  // Save build reference on user.
  const newBuildsData = existingUserData.builds.filter(buildReference => buildReference.id !== buildId);

  database.users[userId] = {
    ...existingUserData,
    builds: newBuildsData,
  };

  persist();
};

const findAllBuilds = (featured = null) => {
  const allBuilds = Object.entries(database.builds).map(([buildId, buildData]) => ({ id: buildId, ...buildData }));

  if (typeof featured === "boolean") {
    return allBuilds.filter(build => build.featured);
  }

  return allBuilds;
};

const findBuilderBuilds = builderAddress => {
  return findAllBuilds().filter(build => build.builder === builderAddress);
};

const featureBuild = (buildId, featured) => {
  const existingBuild = database.builds[buildId];
  existingBuild.featured = featured;
  database.builds[buildId] = existingBuild;

  persist();
};

// --- Streams
const findUpdatableStreams = ({ limit }) => {
  return findAllUsers()
    .filter(user => user.stream !== undefined)
    .sort((a, b) => a.stream.lastIndexedBlock - b.stream.lastIndexedBlock)
    .slice(0, limit)
    .map(user => {
      return { ...user.stream, builderAddress: user.id };
    });
};

// --- General config data
const getConfigData = category => {
  return database.config[category] ?? {};
};

const setConfigData = (category, configData) => {
  database.config[category] = {
    ...getConfigData(category),
    ...configData,
  };

  persist();

  return database.config[category];
};

const updateStreamData = (stream, streamUpdate) => {
  streamUpdate.events.map(createEvent);
  updateUser(stream.builderAddress, {
    stream: {
      ...stream,
      cap: streamUpdate.cap,
      frequency: streamUpdate.frequency,
      lastContract: streamUpdate.lastContract ?? 0,
      lastIndexedBlock: streamUpdate.lastBlock,
      balance: streamUpdate.balance,
      builderAddress: undefined,
    },
  });
  console.log(`Stream ${stream.streamAddress} updated to ${streamUpdate.lastBlock} balance ${streamUpdate.balance}`);
};

module.exports = {
  createUser,
  updateUser,
  findAllUsers,
  findUserByAddress,
  getBuildersWithPendingEnsClaims,

  createEvent,
  findAllEvents,
  findEventsWhere,

  findUpdatableStreams,
  updateStreamData,

  createBuild,
  updateBuild,
  deleteBuild,
  findBuildById,
  findAllBuilds,
  findBuilderBuilds,
  featureBuild,

  getConfigData,
  setConfigData,

  __internal_database: database, // testing only
};
