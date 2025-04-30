// ExpressJS Middleware
import express from "express";

// Custom firebase utility functions
import { verifyJWTToken } from "../utils/firebase_utils/auth_utils.js";
import { getUser, updateSession, updateUser, getSession } from "../utils/firebase_utils/realtime_db_utils.js";

// Custom date utility functions
import { getCurrDateTime } from "../utils/date_utils/datetime.js";

// Socket.IO
import { Server } from "socket.io";
import { createServer } from "node:http";

// Unique id generator
import { v4 as uuidv4 } from "uuid";

// Cors policy
import cors from "cors";

// Initialize app object
const app = express();

// Initialize backend
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: true, // Allow only this specific origin
  methods: ["GET", "POST"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));
const server = createServer(app);

// Reconfigure CORS as needed in order for frontend socket to successfully connect to backend socket listener
const io = new Server(server, {
  path: "/createsession",
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

// Room validation to check for valid room
app.get("/rooms/:id/validate", async (req, res) => {
  const roomId = req.params.id;
  const session = await getSession(roomId);
  // Invalid session
  if (!session) {
    res.status(400).json({
      success: false,
      message: "Bad Request: Invalid room identifier.",
    });
  } else {
    // Valid session
    res.status(200).json({
      success: true,
      message: "Valid Room.",
    });
  }
});

// Problem selection validation 
app.post('/rooms/:id/problem_selection', async (req, res) => {
    const { uid, roomId } = req.body
    const session = await getSession(roomId)

    if (session){
        if (session.sessionCreatorId === uid){
            res.status(200).json({
                success: true, 
                message: "Success."
            })
        }
        else{
            res.status(400).json({
                success: false,
                message: "You do not have sufficient privilege to perform this action."
            })
        }
    }
})

// Makes a room for given user, then returns url to unique room
const generateRoom = async (uid) => {
  // Updates user's 'session' field in Firebase realtime database
  const sid = uuidv4();
  const updateUserInfo = {
    "session/sessionId": sid,
    updatedAt: Date.now(),
  };
  await updateUser(uid, updateUserInfo);

  // Unique room path to be returned to frontend
  const domainRoot = process.env.REACT_APP_FRONTEND_HOST;
  const roomPath = `/rooms/${sid}/ide`;

  // Create a new session and insert into Session entity
  const setSessionInfo = {
    sessionId: sid,
    sessionDuration: 5,
    sessionCreatorId: uid,
    sessionTTL: 5,
    sessionCreationTime: Date.now(),
    sessionURL: domainRoot + roomPath,
  };
  await updateSession(sid, setSessionInfo);
  return domainRoot + roomPath;
};

export { express, app, server, io, generateRoom };
