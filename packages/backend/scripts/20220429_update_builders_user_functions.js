/**
 * Update builders functions
 */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");
const { database } = require("firebase-admin");

const functionMigration = {
  pikemen: "fullstack",
  archer: "frontend",
  knight: "damageDealer",
  cleric: "advisor",
  warlock: "artist",
  monk: "support",
};

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
  db.collection("users")
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(user => {
        const currentFunction = user.data().function;
        const newFunction = functionMigration[currentFunction];

        if (!newFunction) return;
        console.log(currentFunction, " => ", newFunction);

        user.ref.update({
          function: newFunction,
        });
      });
    });
};

main();
