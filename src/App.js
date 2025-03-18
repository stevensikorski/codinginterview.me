// ExpressJS Middleware
import express from "express";

// Firebase settings & SDK
import { firebase } from "./backend/config_files/firebase-config.js"; // Firebase API object and initialized firebase object
import { getAuth } from "firebase/auth"; // Firebase authentication service object
import { getDatabase } from "firebase/database";

// Other custom modules
import { registerUserRoutes } from "./backend/account_registration/account_registration.js"; // For Account registration

// Initialize backend
const app = express();
const port = process.env.BACKEND_PORT;

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));

// Initialize the firebase services the app uses
const firebase_auth = getAuth();
const firebase_db = getDatabase(firebase);

// Initialize the routes for imported js files
// registration.js
registerUserRoutes(app, firebase_auth);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
