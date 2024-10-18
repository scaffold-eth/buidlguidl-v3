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

// Missing telegram links up to batch 7 - link to dummy tg group
const batches = [
  {
    number: 0,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1702377580000,
    contractAddress: "0x0A7d97d392e7400D15460ae0C9799951a3719393",
  },
  {
    number: 1,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1705315180000,
    contractAddress: "0x0A7d97d392e7400D15460ae0C9799951a3719393",
  },
  {
    number: 2,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1707820780000,
    contractAddress: "0x5D9E8Ce6164Bb23F94Fe85e09Ef480B803A10A07",
  },
  {
    number: 3,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1709635180000,
    contractAddress: "0x9386d925B1e18D231565222Bc14277f8B7f7FcF5",
  },
  {
    number: 4,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1712572780000,
    contractAddress: "0x8C71260fD3eC957faFf9F36Ef9d8C2B988c48E16",
  },
  {
    number: 5,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1714991980000,
    contractAddress: "0xbca09b5c1Fc2bF789Dd74c2fF57443CE90221501",
  },
  {
    number: 6,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1717411180000,
    contractAddress: "0x94255172df94530E24cBbcbD3B981C69430431aa",
  },
  {
    number: 7,
    status: "closed",
    telegramLink: "https://t.me/+RdnBKIvVnDw5MTky",
    startDate: 1720435180000,
    contractAddress: "0x216E6213DE1740a3f02dd24B1A08DCe95C82dE84",
  },
  {
    number: 8,
    status: "closed",
    telegramLink: "https://t.me/+VgYXzXgmLBQxZTIx",
    startDate: 1722998380000,
    contractAddress: "0xE00E8969f990233669a2C47E288beC5A299218bD",
  },
  {
    number: 9,
    status: "closed",
    telegramLink: "https://t.me/+ZkPlgmq1Jb0xNmMy",
    startDate: 1725935980000,
    contractAddress: "0x107d6F280a05f07B59039143CA21e3f917AAFA30",
  },
  {
    number: 10,
    status: "closed",
    telegramLink: "https://t.me/+7MtWL2ZlRjhlZGUx",
    startDate: 1728959980000,
    contractAddress: "0x107d6F280a05f07B59039143CA21e3f917AAFA30",
  },
  {
    number: 11,
    status: "open",
    telegramLink: "https://t.me/+uqfwR0bnF8ZhZDcy",
    startDate: 1731983980000,
    contractAddress: "0x107d6F280a05f07B59039143CA21e3f917AAFA30",
  },
];

const main = async () => {
  try {
    console.log("Creating batches...");
    const batchPromises = batches.map(async (batch, index) => {
      await db.collection("batches").doc(index.toString()).set(batch);
      console.log(`Created batch ${batch.number} with index ${index}`);
    });

    await Promise.all(batchPromises);
    console.log("All batches created successfully");
  } catch (error) {
    console.error("Error creating batches:", error);
  }
};

main();
