/** Add NFT contract address to each batch
 *  {
    ...batch,
    contractAddress: "0x0A7d97d392e7400D15460ae0C9799951a3719393",
  }
 * */

require("dotenv").config();
const firebaseAdmin = require("firebase-admin");
const { getNFTContractAddress } = require("../utils/contracts");

if (process.env.FIRESTORE_EMULATOR_HOST) {
  firebaseAdmin.initializeApp({
    projectId: "buidlguidl-v3",
    storageBucket: "buidlguidl-v3.appspot.com",
  });
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

const db = firebaseAdmin.firestore();

const main = async () => {
  try {
    console.log("add nft contract address to each batch...");

    const batchesSnapshot = await db.collection("batches").get();
    const batchPromises = batchesSnapshot.docs.map(async doc => {
      const batch = doc.data();
      if (batch.contractAddress) {
        const nftContractAddress = await getNFTContractAddress(batch.contractAddress);
        if (!nftContractAddress) {
          console.log("Skipping batch", batch.name);
          return;
        }

        await db.collection("batches").doc(doc.id).update({
          nftContractAddress,
        });

        console.log(`Updated batch ${batch.name} with NFT contract address: ${nftContractAddress}`);
      }
    });

    await Promise.all(batchPromises);
    console.log("All batches updated successfully!");
  } catch (error) {
    console.error("Error updating batches:", error);
  }
};

main();
