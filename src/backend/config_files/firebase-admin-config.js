import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!keyPath) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS is not defined");
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

const fixedContent = fileContent.replace(/("private_key":\s*")([\s\S]*?)(")/, (match, prefix, keyValue, suffix) => {
  const fixedKey = keyValue.replace(/\n/g, "\\n");
  return prefix + fixedKey + suffix;
});

let serviceAccount;
try {
  serviceAccount = JSON.parse(fixedContent);
} catch (error) {
  console.error("Error parsing service account JSON:", error);
  process.exit(1);
}

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codinginterview-me-default-rtdb.firebaseio.com",
});

const auth = getAuth(firebaseAdmin);
const rtdb = firebaseAdmin.database();

export { auth, rtdb };
