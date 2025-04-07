import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

let serviceAccount;

// If a base64‑encoded service account is provided in FIREBASE_SERVICE_KEY, use that.
if (process.env.FIREBASE_SERVICE_KEY) {
  try {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf-8");
    serviceAccount = JSON.parse(decoded);
    console.log("Service account loaded from base64 environment variable.");
  } catch (error) {
    console.error("Error decoding service account JSON from FIREBASE_SERVICE_KEY:", error);
    process.exit(1);
  }
} else {
  // Otherwise, try reading from a file via GOOGLE_APPLICATION_CREDENTIALS
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    console.error("Neither FIREBASE_SERVICE_KEY nor GOOGLE_APPLICATION_CREDENTIALS is defined.");
    process.exit(1);
  }

  let fileContent;
  try {
    fileContent = fs.readFileSync(keyPath, "utf8");
    console.log(`Service account file read; length: ${fileContent.length} characters`);
  } catch (error) {
    console.error("Error reading service account file:", error);
    process.exit(1);
  }

  // Fix the private_key: replace literal newline characters with the two-character sequence "\n"
  const fixedContent = fileContent.replace(/("private_key":\s*")([\s\S]*?)(")/, (match, prefix, keyValue, suffix) => {
    const fixedKey = keyValue.replace(/\n/g, "\\n");
    return prefix + fixedKey + suffix;
  });

  try {
    serviceAccount = JSON.parse(fixedContent);
  } catch (error) {
    console.error("Error parsing service account JSON:", error);
    process.exit(1);
  }
}

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codinginterview-me-default-rtdb.firebaseio.com",
});

const auth = getAuth(firebaseAdmin);
const rtdb = firebaseAdmin.database();

export { auth, rtdb };
