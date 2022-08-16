/**
 * Remove inactive builders.
 *
 * Since 2022-08-16, SRE builders need to explicitly join the BG. Before that
 * the joined automatically.
 */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");

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
let count = 0;
const main = async () => {
  db.collection("users")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(async user => {
        const userData = user.data();
        const currentBuilds = userData.builds;
        const creationTimestamp = userData.creationTimestamp;

        const builderForMoreThanAMonth = Math.abs(Date.now() - creationTimestamp) / 1000 / 60 / 60 / 24 > 30;

        if (!currentBuilds && builderForMoreThanAMonth) {
          await user.ref.delete();
          count += 1;
        }
      });

      console.log("Removed", count, "builders from BG");
    });
};

main();
