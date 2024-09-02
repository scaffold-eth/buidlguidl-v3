require("dotenv").config();
const fs = require("fs");
const { parse } = require("csv-parse/sync");
const firebaseAdmin = require("firebase-admin");
const { encryptData } = require("../utils/encrypt");

const CSV_FILE_PATH = "./devcon_vouchers.csv";

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    storageBucket: "buidlguidl-v3.appspot.com",
  });
} else {
  console.log("Using Firestore emulator");
  firebaseAdmin.initializeApp({
    projectId: "buidlguidl-v3",
    storageBucket: "buidlguidl-v3.appspot.com",
  });
}

const db = firebaseAdmin.firestore();

async function importDevconVouchers() {
  // Read and parse the CSV file
  const fileContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");
  const records = parse(fileContent, { columns: true });

  const vouchers = records.map(row => ({
    voucher: encryptData(row["voucher"]),
    type: row["type"],
    builderAddress: "",
  }));

  console.log(`Parsed ${vouchers.length} vouchers from CSV.`);

  // Import vouchers to the database
  const batch = db.batch();
  for (const voucher of vouchers) {
    const docRef = db.collection("devconVouchers").doc();
    batch.set(docRef, voucher);
  }

  try {
    await batch.commit();
    console.log("Voucher import completed successfully.");
  } catch (error) {
    console.error("Error importing vouchers:", error);
  }
}

importDevconVouchers()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error("Script encountered an error:", error);
    process.exit(1);
  });
