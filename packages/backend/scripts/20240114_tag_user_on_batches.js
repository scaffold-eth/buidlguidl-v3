/**
 * Update builders functions
 */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");

const batch = "1";
const builders = [
  "0x5D70E3b540f58beCd10B74f6c0958b31e3190DA7",
  "0xC6e64eBeFaFaB3d646adadca5D93A7c44f62544f",
  "0x2b30efBA367D669c9cd7723587346a79b67A42DB",
  "0x2F142f9F52af0845B7b8b1353E349Ca1Cb8EFE92",
  "0xDE5c8eAFEBEC017D9d26F757B9d7F04A0C1eb177",
  "0x4d639cbbc15fE5DB467dbF158a78a5Fa3Ac20877",
  "0x3b529ac4F8dc0C40Fec0f1192029755275A0c3Cd",
  "0x2B602d2f559a0bADf4D5956D03f2b330fBC2e9F9",
  "0xbE7fD3889C01F032184544DC0005F0d47daCcf09",
  "0x4f099cFbC4043e60c52EF47EBC593ba0Bda5C85e",
  "0x1CeF0e6072810013487f7632350f9336AD6CADAD",
  "0x8757F328371E571308C1271BD82B91882253FDd1",
  "0x86f012BC12B986FcF58AD672f03817cD210528ed",
];

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
  for (let i = 0; i < builders.length; i++) {
    const builder = builders[i];
    const builderRef = db.collection("users").doc(builder);
    await builderRef.update({
      builderBatch: batch,
    });
    console.log(`Updated builder ${builder} with batch ${batch}`);
  }
};

main();
