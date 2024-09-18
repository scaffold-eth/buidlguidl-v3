/** Update data base schema fro batch
 *  from builderBatch: "number" to batch: { number: "number", status: "graduate" }
 * */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");
// const { importSeed } = require("../local_database/importSeed");

if (process.env.FIRESTORE_EMULATOR_HOST) {
  firebaseAdmin.initializeApp({
    projectId: "buidlguidl-v3",
    storageBucket: "buidlguidl-v3.appspot.com",
  });

  // importSeed(firebaseAdmin.firestore());
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log("using Firebase live DB");
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    storageBucket: "buidlguidl-v3.appspot.com",
  });
} else {
  firebaseAdmin.initializeApp({
    storageBucket: "buidlguidl-v3.appspot.com",
  });
}

// // Docs: https://firebase.google.com/docs/firestore/quickstart#node.js_1
const db = firebaseAdmin.firestore();

const main = async () => {
  try {
    console.log("Updating builders schema...");
    const usersSnapshot = await db.collection("users").where("builderBatch", ">=", "0").get();
    usersSnapshot.forEach(async doc => {
      const builder = doc.data();
      const batch = { number: builder.builderBatch, status: "graduate" };

      await db.collection("users").doc(doc.id).update({
        batch,
        builderBatch: firebaseAdmin.firestore.FieldValue.delete(),
      });
      console.log(`Updated builder ${doc.id} with new batch schema: ${JSON.stringify(batch)}`);
    });
  } catch (error) {
    console.error("Error updating builders:", error);
  }
};

main();
