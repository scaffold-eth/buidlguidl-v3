require("dotenv").config();
const firebaseAdmin = require("firebase-admin");

const fs = require("fs");
const mime = require("mime-types");

console.log("using Firebase Storage");

const defaultStorage = firebaseAdmin.storage();
const bucket = defaultStorage.bucket();

const uploadFile = async (file, req) => {
  const newFileName = `${file.newFilename}.${mime.extension(file.mimetype)}`;
  const newPath = `builds/${newFileName}`;

  const [_, uploadedFileMetadata] = await bucket.upload(file.filepath, { destination: newPath });
  console.log("Storage Firebase -> File copied:", uploadedFileMetadata.mediaLink);

  // Full Frontend URL.
  return uploadedFileMetadata.mediaLink;
};

module.exports = {
  uploadFile,
};
