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
    name: "Main Hacker House (Jessy's)",
    url: "https://hackerhouse.buidlguidl.com/",
    contractAddress: "0x2Be18e07C7be0a2CC408C9E02C90203B2052D7DE",
    chainId: 1,
  },
  {
    name: "Autonomous Worlds (Jessy's)",
    url: "https://autoworld-streams.buidlguidl.com/",
    contractAddress: "0xcb59f4bab420abdb3c6ae0997cc9ac7526d5e163",
    chainId: 1,
  },
  {
    name: "Security & Optimizooors (Jessy's)",
    url: "https://optimizooor-streams.buidlguidl.com/",
    contractAddress: "0xaF18f0f1F096FaC34E816C7409348D313ef7c84F",
    chainId: 1,
  },
  {
    name: "Infrastructure (Jessy's)",
    url: "https://infra-streams.buidlguidl.com/",
    contractAddress: "0x502730421b796baeeB9D907d88685234dDb44750",
    chainId: 1,
  },
  {
    name: "ZK & Cryptography (Jessy's)",
    url: "https://zkcrypto-streams.buidlguidl.com/",
    contractAddress: "0xfe2d6743d7180e07be769bF59D3c0f560B199434",
    chainId: 1,
  },
  {
    name: "Sand Garden",
    url: "https://sandgarden.buidlguidl.com/",
    contractAddress: "0x2eA63c9C9C114ae85b1027697A906420a23e8572",
    chainId: 10,
  },
  {
    name: "Play Full",
    url: "https://play-full.buidlguidl.com/",
    contractAddress: "0x3E920e4a1C26a9c6488c3E5c7CB1e91a179927F5",
    chainId: 10,
  },
  {
    name: "Not Just Notfellows",
    url: "https://not-just-notfellows.buidlguidl.com/",
    contractAddress: "0xaCc9Cc4983D57cea0748B8CD1Adb87Ada5b1a67c",
    chainId: 1,
  },
  {
    name: "BG Outreach",
    url: "https://outreach.buidlguidl.com/",
    contractAddress: "0xE54F8B7FDdf75257c7F248a197553Ac467296053",
    chainId: 1,
  },
  {
    name: "0xAfro",
    url: "https://0xafro.vercel.app/",
    contractAddress: "0x3DDb71FB2b6Fb530615FC1dEb9461d6489EDA1ff",
    chainId: 10,
  },
];

const cohortsCollection = db.collection("cohorts");

async function saveCohortsToFirebase() {
  for (const cohort of cohorts) {
    const { contractAddress, ...cohortData } = cohort;

    // Use the contractAddress as the document ID
    const cohortDocRef = cohortsCollection.doc(contractAddress);

    try {
      await cohortDocRef.set(cohortData); // Set will overwrite if it exists, you can also use .add() for new documents
      console.log(`Saved cohort "${cohortData.name}"`);
    } catch (error) {
      console.error(`Failed to save cohort "${cohortData.name}". Error: ${error}`);
    }
  }
}

saveCohortsToFirebase();
