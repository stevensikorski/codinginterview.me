// ExpressJS Middleware
import express from "express";

// Custom firebase utility functions
import { verifyJWTToken } from "../utils/firebase_utils/auth_utils.js"
import { getUser, updateSession, updateUser, getSession } from "../utils/firebase_utils/realtime_db_utils.js"

// Custom date utility functions
import { getCurrDateTime } from "../utils/date_utils/datetime.js";

// Socket.IO
import { Server } from "socket.io"
import { createServer } from 'node:http';

// Unique id generator 
import { v4 as uuidv4 } from "uuid"

// Cors policy 
import cors from "cors"


// Initialize app object
const app = express()

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000', // Allow only this specific origin
    methods: ['GET', 'POST'],       // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true,               // Allow cookies and credentials
  };
app.use(cors(corsOptions))
const server = createServer(app)  

// Reconfigure CORS as needed in order for frontend socket to successfully connect to backend socket listener
const io = new Server(server, {
    path: "/createsession",
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
});

// Room validation to check for valid room 
app.get('/rooms/:id/validate', async (req, res) => {
    const roomId = req.params.id; 
    console.log("Room ID received from frontend: ", roomId)

    const session = await getSession(roomId)
    console.log("session = ", session)
    // Invalid session
    if (!session){
        res.status(400).json({
            success: false, 
            message: "Bad Request: Invalid room identifier."
        })
    }
    else{
        // Valid session
        res.status(200).json({
            success: true, 
        })
    }
});

// Makes a room for given user, then returns url to unique room
const generateRoom = async (uid, jwtToken) => {
    verifyJWTToken(jwtToken)

    // Checks if user has existing room 
    const dbUser = await getUser(uid) 
    console.log('dbUser = ' + dbUser)
    if (dbUser && dbUser.session && dbUser.session.sessionId){
        console.log("USER ALREADY ASSOCIATED WITH ROOM_ID: ", dbUser.session.sessionId)
        return null
    }

    // Updates user's 'session' field in Firebase realtime database
    const sid = uuidv4()
    const updateUserInfo = {
        'session/sessionId': sid, 
        'updatedAt': getCurrDateTime()
    }
    await updateUser(uid, updateUserInfo)

    // Unique room path to be returned to frontend
    const domainRoot = "http://localhost:3000/"
    const roomPath = `rooms/${sid}/ide`

    // Create a new session and insert into Session entity
    const setSessionInfo = {
        'sessionId': sid, 
        'sessionDuration': 5,
        'sessionCreatorId': uid, 
        'sessionTTL': 5, 
        'sessionCreationTime': getCurrDateTime(),
        'sessionURL': domainRoot + roomPath
    }
    await updateSession(sid, setSessionInfo)
    return (domainRoot + roomPath)
}

export { express, app, server, io, generateRoom }