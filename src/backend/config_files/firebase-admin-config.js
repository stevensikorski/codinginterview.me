import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

// Get service account
const service_account = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Initialize Firebase
const firebase_admin = admin.initializeApp({
  credential: admin.credential.cert(service_account),
  databaseURL: "https://codinginterview-me-default-rtdb.firebaseio.com",
});

const auth = getAuth(firebase_admin);
const rtdb = firebase_admin.database();
export { auth, rtdb };
