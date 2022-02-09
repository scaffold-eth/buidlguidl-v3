require("dotenv").config();

const STORAGE_SERVICES = {
  firebase: "./storageFirebase",
  local: "./storageLocal",
};

const selectedService = process.env.DATABASE_SERVICE ?? "local";
const storageService = STORAGE_SERVICES[selectedService] ?? STORAGE_SERVICES.local;
// eslint-disable-next-line import/no-dynamic-require
const storage = require(storageService);

const uploadFile = storage.uploadFile;

module.exports = {
  uploadFile,
};
