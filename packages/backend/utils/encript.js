const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "defaultdevkey".repeat(2);
const IV_LENGTH = 16;

export const encryptData = text => {
  let key = Buffer.from(ENCRYPTION_KEY, "utf8");

  // Ensure the key is exactly 32 bytes
  if (key.length < 32) {
    key = Buffer.concat([key, Buffer.alloc(32 - key.length)]);
  } else if (key.length > 32) {
    key = key.subarray(0, 32);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decryptData = text => {
  let key = Buffer.from(ENCRYPTION_KEY, "utf8");
  key = key.length < 32 ? Buffer.concat([key, Buffer.alloc(32 - key.length)]) : key.subarray(0, 32);
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
};
