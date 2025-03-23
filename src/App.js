// ExpressJS Middleware
import express from "express";

// Firebase settings & SDK
import { firebase_admin } from "./backend/config_files/firebase-admin-config.js"; // Firebase API object and initialized firebase object
import { getAuth } from "firebase-admin/auth"
// import { getDatabase } from "firebase/database";

// Allowing network requests from frontend to backend
import cors from 'cors';

// Other custom modules
import { registerUserRoutes } from "./backend/account_registration/account_registration.js"; // For Account registration

// Initialize backend
const app = express();
const port = process.env.BACKEND_PORT;

// Configure backend policies
app.use(express.json());  
app.use(cors());


// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));

// Initialize the firebase services
const firebase_auth = getAuth(firebase_admin);
// const firebase_db = getDatabase(firebase);

// Initialize the routes for imported js files
// registration.js
registerUserRoutes(app)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
