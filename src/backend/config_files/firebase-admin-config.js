import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_KEY) {
  try {
    const decoded = Buffer.from(process.env.FIREBASE_SERVICE_KEY, "base64").toString("utf-8");
    serviceAccount = JSON.parse(decoded);
    console.log("Service account loaded from FIREBASE_SERVICE_KEY.");
  } catch (error) {
    console.error("Error decoding or parsing service account JSON from FIREBASE_SERVICE_KEY:", error);
    process.exit(1);
  }
} else {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    console.error("No service account provided. Set FIREBASE_SERVICE_KEY or GOOGLE_APPLICATION_CREDENTIALS.");
    process.exit(1);
  }
  try {
    let fileContent = fs.readFileSync(keyPath, "utf8");
    console.log(`Service account file read from ${keyPath}; length: ${fileContent.length} characters`);
    const fixedContent = fileContent.replace(/("private_key":\s*")([\s\S]*?)(")/, (match, prefix, keyValue, suffix) => {
      const fixedKey = keyValue.replace(/\n/g, "\\n");
      return prefix + fixedKey + suffix;
    });
    serviceAccount = JSON.parse(fixedContent);
  } catch (error) {
    console.error("Error reading or parsing service account file:", error);
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
