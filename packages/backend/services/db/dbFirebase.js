require("dotenv").config();
const firebaseAdmin = require("firebase-admin");

console.log("using Firebase DB");
if (process.env.NODE_ENV === "test") {
  // We won't be using firebase for testing for now. At some point,
  // we might want to run tests against the Staging firebase instance.
  throw new Error(
    `This will connect to the production firestore. Make sure dbFirebase.js is updated before testing against Firebase`,
  );
}

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    storageBucket: "buidlguidl-v3.appspot.com",
  });
} else {
  firebaseAdmin.initializeApp({
    storageBucket: "buidlguidl-v3.appspot.com",
  });
}

// Docs: https://firebase.google.com/docs/firestore/quickstart#node.js_1
const database = firebaseAdmin.firestore();

// --- Users
const getUserDoc = id => database.collection("users").doc(id);
const getUserSnapshotById = id => getUserDoc(id).get();

const createUser = (userId, userData) => {
  const userDoc = getUserDoc(userId);
  return userDoc.set(userData);
};

const updateUser = async (userId, userData) => {
  const userDoc = getUserDoc(userId);
  await userDoc.update(userData);

  const userSnapshot = await getUserSnapshotById(userId);
  return userSnapshot.data();
};

const findAllUsers = async () => {
  const buildersSnapshot = await database.collection("users").get();
  return buildersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const findUserByAddress = async builderAddress => {
  const builderSnapshot = await getUserSnapshotById(builderAddress);
  if (!builderSnapshot.exists) {
    return { exists: false };
  }
  return { exists: true, data: { id: builderSnapshot.id, ...builderSnapshot.data() } };
};

// --- Events
const createEvent = event => {
  return database.collection("events").add(event);
};

const findAllEvents = async ({ limit } = {}) => {
  let queryChain = database.collection("events");

  if (limit) {
    queryChain = queryChain.limit(Number(limit));
  }

  // Seems like a good default for now.
  queryChain = queryChain.orderBy("timestamp", "desc");

  const eventsSnapshot = await queryChain.get();
  return eventsSnapshot.docs.map(doc => doc.data());
};

const findEventsWhere = async ({ conditions: conditionsArg, limit } = {}) => {
  let conditionChain = database.collection("events");
  Object.entries(conditionsArg).forEach(([prop, values]) => {
    const valuesArray = values.split(",");
    const propName = prop.replace("/", ".");

    if (valuesArray.length > 1) {
      conditionChain = conditionChain.where(propName, "in", valuesArray);
    } else {
      conditionChain = conditionChain.where(propName, "==", values);
    }
  });

  // Seems like a good default for now.
  conditionChain = conditionChain.orderBy("timestamp", "desc");

  if (limit) {
    conditionChain = conditionChain.limit(Number(limit));
  }

  const eventsSnapshot = await conditionChain.get();
  return eventsSnapshot.docs.map(doc => doc.data());
};

// --- Builds
const getBuildDoc = id => database.collection("builds").doc(id);
const getBuildSnapshotById = id => getBuildDoc(id).get();

const findBuildById = async buildId => {
  const build = await database.collection("builds").doc(buildId).get();
  return build.data();
};

const createBuild = async build => {
  // Save build.
  const newBuild = await database.collection("builds").add(build);

  // Save build reference on user.
  const builderId = build.builder;
  const builderData = (await getUserSnapshotById(builderId)).data();

  const buildsData = builderData.builds || [];

  buildsData.push({
    id: newBuild.id,
    submittedTimestamp: build.submittedTimestamp,
  });

  await updateUser(builderId, { builds: buildsData });

  return newBuild;
};

const updateBuild = async (buildId, buildData) => {
  const buildDoc = getBuildDoc(buildId);
  await buildDoc.update(buildData);

  const buildSnapshot = await getBuildSnapshotById(buildId);
  return { id: buildId, ...buildSnapshot.data() };
};

const deleteBuild = async buildId => {
  const build = (await getBuildSnapshotById(buildId)).data();
  const { id: builderId, ...existingUserData } = (await findUserByAddress(build.builder)).data;

  // Delete build reference on user.
  const newBuildsReferences = existingUserData.builds.filter(buildRef => buildRef.id !== buildId);
  await updateUser(builderId, { builds: newBuildsReferences });

  // Delete Build
  return database.collection("builds").doc(buildId).delete();
};

const findAllBuilds = async (featured = null) => {
  let buildsSnapshot;
  if (typeof featured === "boolean") {
    // Only featured / not featured
    buildsSnapshot = await database.collection("builds").where("featured", "==", featured).get();
  } else {
    // All builds
    buildsSnapshot = await database.collection("builds").get();
  }

  return buildsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const findBuilderBuilds = async builderAddress => {
  // ToDo. Use subcollections?
  const buildsSnapshot = await database.collection("builds").where("builder", "==", builderAddress).get();

  return buildsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const featureBuild = (buildId, featured) => {
  const buildRef = database.collection("builds").doc(buildId);
  return buildRef.update({ featured });
};

// --- Streams
const findUpdatableStreams = async ({ limit }) => {
  let queryChain = database.collection("users").where("stream.streamAddress", "!=", "");

  if (limit) {
    queryChain = queryChain.limit(Number(limit));
  }

  const updatableStreamsSnapshot = await queryChain.get();

  return updatableStreamsSnapshot.docs.map(doc => ({ builderAddress: doc.id, ...doc.data().stream }));
};

const updateStreamData = async (stream, streamUpdate) => {
  streamUpdate.events.map(createEvent);

  const { builderAddress, ...relevantStream } = stream;
  await updateUser(stream.builderAddress, {
    stream: {
      ...relevantStream,
      cap: streamUpdate.cap,
      frequency: streamUpdate.frequency,
      lastContract: streamUpdate.lastContract ?? 0,
      lastIndexedBlock: streamUpdate.lastBlock,
      balance: streamUpdate.balance,
    },
  });
  console.log(`Stream ${stream.streamAddress} updated to ${streamUpdate.lastBlock} balance ${streamUpdate.balance}`);
};

// --- General config data
const getConfigDoc = id => database.collection("config").doc(id);
const getUsConfigSnapshotById = id => getConfigDoc(id).get();

const getConfigData = async category => {
  const config = await database.collection("config").doc(category).get();
  return config.data();
};

const setConfigData = async (category, configData) => {
  const configDoc = getConfigDoc(category);
  await configDoc.update(configData);

  const configSnapshot = await getUsConfigSnapshotById(category);
  return configSnapshot.data();
};

module.exports = {
  createUser,
  updateUser,
  findAllUsers,
  findUserByAddress,

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
};
