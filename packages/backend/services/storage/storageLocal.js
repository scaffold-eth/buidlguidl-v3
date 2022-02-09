require("dotenv").config();
const fs = require("fs");
const mime = require("mime-types");
const os = require("os");

console.log("using local storage");

const uploadFile = async (file, req) => {
  const newFileName = `${file.newFilename}.${mime.extension(file.mimetype)}`;
  const newPath = `public/${newFileName}`;

  fs.copyFileSync(file.filepath, newPath);
  console.log("Storage local -> File copied:", newPath);

  // Full Frontend URL.
  return `${req.protocol}://${req.get("host")}/${newFileName}`;
};

module.exports = {
  uploadFile,
};
