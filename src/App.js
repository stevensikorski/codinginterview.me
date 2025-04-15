// Other custom modules
import { express, app, server, io, generateRoom } from "./backend/user_sessions/session.js"; // For room creation
import { registerUserRoutes } from "./backend/user_accounts/account_registration.js"; // For Account registration
import { getSession } from "./backend/utils/firebase_utils/realtime_db_utils.js";
import { userHasRoom, getRoomForUser } from "./backend/utils/firebase_utils/room_utils.js";
import { verifyJWTToken } from "./backend/utils/firebase_utils/auth_utils.js";
import dotenv from "dotenv";

dotenv.config();

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));
const port = process.env.BACKEND_PORT;

// Handles user account registration
registerUserRoutes(app);

// Listen for socket connection
io.on("connection", (socket) => {
  console.log("a user has connected");

  // Handles room creation
  socket.on("createroom", async (msg) => {
    const { uid, jwtToken } = msg;

    // Perform some authorization checks
    await verifyJWTToken(jwtToken);
    if (await userHasRoom(uid)) {
      console.log("user already has room");
      socket.emit("createroom", await getRoomForUser(uid));
    } else {
      // Create a new room and respond back to frontend with the room path
      const room = await generateRoom(uid);
      console.log("new room is created for user");
      socket.emit("createroom", room);
    }
  });

  // Listen for 'bind_room_user' event, which checks if current user
  // can enter room. If so, bind current user to this room.
  socket.on("bind_room_user", async (msg) => {
    const { uid, roomId } = msg;

    console.log("attempting to bind user to room");
    // Remove the socket from its own `socket.id` room (the default behavior in Socket.io)
    socket.leave(socket.id); // This leaves the automatic room created by `socket.id`

    // User is either an interviewer or not an interviewer but all users
    // must be authenticated already
    const session = await getSession(roomId);
    if (session) {
      if (session.sessionCreatorId === uid) {
        // Interviewer
        socket.join(roomId);
        console.log("interviewer joined room");
      } else {
        // Non-interviewer
        socket.join(roomId);
        console.log("non-interviewer joined room");
        console.log("joined room id: ", socket.rooms);
      }
    }
  });

  // Get all users in a room
  socket.on("get_room_users", (msg) => {
    const { roomId } = msg;
    const room = io.sockets.adapter.rooms.get(roomId); // Get the room object
    const usersInRoom = room ? Array.from(room) : []; // Get all socket IDs in the room
    console.log("Users in room", roomId, usersInRoom);

    // Emit the list of users to the requesting client
    socket.emit("get_room_users", usersInRoom);
  });

  // Sychronize editor codes for users in same room
  socket.on("synchronize_code", (msg) => {
    const { roomId, newCode } = msg;
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit("synchronize_code", newCode);
  });

  // Synchronizes problem selection for users in same room
  socket.on("problem_panel_synchronization", (msg) => {
    const { roomId, problem } = msg;
    console.log("NEW PROBLEM: ", problem);
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit("problem_panel_synchronization", problem);
  });

  // User joins a room
  socket.on("join_room", (data) => {
    const { roomId, userName } = data;

    // Join the socket to the specified room
    socket.join(roomId);

    // Store user data in socket for reference
    socket.userData = {
      userName: userName,
      isVideoOn: false,
      isMicOn: false,
      roomId,
    };

    // Notify other users in the room that someone joined
    socket.to(roomId).emit("participant_joined", {
      userId: socket.id,
      userName: socket.userData.userName,
    });

    // Get all participants in the room
    const participantsList = getParticipantsInRoom(roomId);

    // Send the current participant list to the newly joined user
    socket.emit("participants_list", participantsList);

    console.log(`User ${socket.userData.userName} joined room ${roomId}`);
  });

  // User leaves a room
  socket.on("leave_room", (data) => {
    const { roomId } = data;

    if (socket.userData) {
      // Notify others that user left
      socket.to(roomId).emit("participant_left", {
        userId: socket.id,
        userName: socket.userData.userName,
      });

      console.log(`User ${socket.userData.userName} left room ${roomId}`);
    }

    // Leave the room
    socket.leave(roomId);
  });

  // Media state change (video/audio toggle)
  socket.on("media_state_change", (data) => {
    const { roomId, mediaType, isOn } = data;

    // Update socket user data
    if (socket.userData) {
      if (mediaType === "video") {
        socket.userData.isVideoOn = isOn;
      } else if (mediaType === "audio") {
        socket.userData.isMicOn = isOn;
      }
    }

    // Broadcast the state change to all other users in the room
    socket.to(roomId).emit("media_state_update", {
      userId: socket.id,
      mediaType,
      isOn,
    });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    if (socket.userData && socket.userData.roomId) {
      // Notify users in room that this participant has left
      socket.to(socket.userData.roomId).emit("participant_left", {
        userId: socket.id,
        userName: socket.userData.userName,
      });

      console.log(`User ${socket.userData.userName} disconnected from room ${socket.userData.roomId}`);
    }
  });

  // Helper function to get all participants in a room
  function getParticipantsInRoom(roomId) {
    const participants = [];
    const room = io.sockets.adapter.rooms.get(roomId);
    const seenParticipants = new Set();

    if (room) {
      // Get all socket IDs in the room
      const sockets = Array.from(room);

      // Get user data for each socket
      sockets.forEach((socketId) => {
        const clientSocket = io.sockets.sockets.get(socketId);

        // Skip the current socket and ensure we haven't added this user already
        if (clientSocket && clientSocket.id !== socket.id && clientSocket.userData && !seenParticipants.has(clientSocket.id)) {
          seenParticipants.add(clientSocket.id);
          participants.push({
            userId: clientSocket.id,
            userName: clientSocket.userData.userName,
            isVideoOn: clientSocket.userData.isVideoOn,
            isMicOn: clientSocket.userData.isMicOn,
          });
        }
      });
    }

    return participants;
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
