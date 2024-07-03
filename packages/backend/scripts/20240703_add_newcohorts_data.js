/**
 * Create cohorts data
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
    projectId: "buidlguidl-v3",
  });
}

// Docs: https://firebase.google.com/docs/firestore/quickstart#node.js_1
const db = firebaseAdmin.firestore();

const cohorts = [
  {
    name: "Media",
    url: "https://media.buidlguidl.com/",
    contractAddress: "0xa6EfA453c25658F725590A5821Cf408818f25FEf",
    chainId: 1,
  },
  {
    name: "Ship Yard",
    url: "https://shipyard.buidlguidl.com/",
    contractAddress: "0x55Cb9CB337CDb0A41cAc89Ffac4627744b50B566",
    chainId: 10,
  },
  {
    name: "Mercs",
    url: "https://mercs.buidlguidl.com/",
    contractAddress: "0x8d84f7E545F69746e4A1CAD0F7ac9A83CCDF2C65",
    chainId: 10,
  },
];

const cohortsCollection = db.collection("cohorts");

async function addCohortsToFirebase() {
  for (const cohort of cohorts) {
    const { contractAddress, ...cohortData } = cohort;

    // Use the contractAddress as the document ID
    const cohortDocRef = cohortsCollection.doc(contractAddress);

    try {
      await cohortDocRef.add(cohortData); // Set will overwrite if it exists, you can also use .add() for new documents
      console.log(`Added cohort "${cohortData.name}"`);
    } catch (error) {
      console.error(`Failed to add cohort "${cohortData.name}". Error: ${error}`);
    }
  }
}

addCohortsToFirebase();
