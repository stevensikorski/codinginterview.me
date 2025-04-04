// ExpressJS Middleware
import express from "express";

// Custom firebase utility functions
import { verifyJWTToken } from "../utils/firebase_utils/auth_utils.js"
import { getUser, updateUser } from "../utils/firebase_utils/realtime_db_utils.js"

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


// Makes a room for given user, then returns unique room ID
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
    const room = `rooms/${sid}/ide`
    return room
}

export { express, app, server, io, generateRoom }