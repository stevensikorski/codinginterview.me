import admin from "firebase-admin";
import fs from "fs";

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!keyPath) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS is not defined");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-firebase-project.firebaseio.com",
});

export const auth = admin.auth();
export const db = admin.database();
