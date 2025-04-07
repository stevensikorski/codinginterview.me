import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Get the path to the service account file from the environment variable
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!serviceAccountPath) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (error) {
  console.error("Error reading or parsing service account file:", error);
  process.exit(1);
}

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://codinginterview-me-default-rtdb.firebaseio.com",
});

const auth = getAuth(firebaseAdmin);
const rtdb = firebaseAdmin.database();

export { auth, rtdb };
