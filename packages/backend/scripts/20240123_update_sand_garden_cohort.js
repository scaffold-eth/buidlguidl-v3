/**
 * Update Sand Garden contract.
 *
 * The old contract from Sand Garden (0x2eA63c9C9C114ae85b1027697A906420a23e8572) on OP was
 * deprecated (fat finger renounced ownership, my fault :D) and replaced with a new one
 * (0x964d0C9a421953F95dAF3A5c5406093a3014A5D8).
 *
 * This scripts aims to update all references to the old one, so all the calculations (withdraws, etc)
 * are still valid.
 */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");

const oldContract = "0x2eA63c9C9C114ae85b1027697A906420a23e8572";
const newContract = "0x964d0C9a421953F95dAF3A5c5406093a3014A5D8";

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
const db = firebaseAdmin.firestore();

const main = async () => {
  // 1. Get the cohort (from cohorts collection) with the ID = oldContract
  const cohortRef = db.collection("cohorts").doc(oldContract);
  const oldCohortSnapshot = await cohortRef.get();

  // 2. Create a new document with the ID = newContract and copy the data from the old document
  const newCohortRef = db.collection("cohorts").doc(newContract);
  await newCohortRef.set(oldCohortSnapshot.data());

  // 3. Delete: will do it manually.

  // 4. Update all the events with type = cohort.withdraw and payload.streamAddress = oldContract
  const eventsRef = db.collection("events");
  const eventsSnapshot = await eventsRef
    .where("type", "==", "cohort.withdraw")
    .where("payload.streamAddress", "==", oldContract)
    .get();

  const batch = db.batch();
  eventsSnapshot.forEach(doc => {
    batch.update(doc.ref, {
      "payload.streamAddress": newContract,
    });
  });
  await batch.commit();
  console.log(`Updated ${eventsSnapshot.size} events.`);
};

main();
