// ExpressJS Middleware
import express from "express";

// Allowing network requests from frontend to backend
import cors from 'cors';

// Other custom modules
import { registerUserRoutes } from "./backend/user_accounts/account_registration.js"; // For Account registration
// import { registerSessionRoutes } from "./backend/user_sessions/session.js"; // For real-time video sessions

// Initialize backend
const app = express();
const port = process.env.BACKEND_PORT;

// Configure backend policies
app.use(express.json());  
app.use(cors());


// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));

// Initialize the routes for imported js files
// registration.js, for user account registration
registerUserRoutes(app)

// session.js, for real-time video chats
// registerSessionRoutes(app)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
