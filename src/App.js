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
const port = process.env.PORT || 3002;
const host = process.env.IP || "0.0.0.0";

// Handles user account registration
registerUserRoutes(app);

app.get("/rooms/:id/validate", async (req, res) => {
  const roomId = req.params.id;
  const session = await getSession(roomId);

  // Invalid session
  if (!session) {
    res.status(400).json({
      success: false,
      message: "Bad Request: Invalid room identifier.",
    });
    return;
  }

  // Check room capacity using Socket.io
  const room = io.sockets.adapter.rooms.get(roomId);
  const participantCount = room ? room.size : 0;

  if (participantCount >= 2) {
    // Room is full
    res.status(403).json({
      success: false,
      message: "Room is full (maximum 2 participants).",
    });
    return;
  }

  // Valid session with space
  res.status(200).json({
    success: true,
    message: "Valid Room.",
  });
});

// Listen for socket connection
io.on("connection", (socket) => {
  // Handles room creation
  socket.on("createroom", async (msg) => {
    const { uid, jwtToken } = msg;

    // Perform some authorization checks
    await verifyJWTToken(jwtToken);
    if (await userHasRoom(uid)) {
      socket.emit("createroom", await getRoomForUser(uid));
    } else {
      // Create a new room and respond back to frontend with the room path
      const room = await generateRoom(uid);
      socket.emit("createroom", room);
    }
  });

  // Listen for 'bind_room_user' event, which checks if current user
  // can enter room. If so, bind current user to this room.
  socket.on("bind_room_user", async (msg) => {
    const uid = msg.uid;
    const roomId = msg.roomId;

    // Check if room exists
    const session = await getSession(roomId);
    if (session) {
      // Check if room is full (has 2 participants already)
      const room = io.sockets.adapter.rooms.get(roomId);
      const participantCount = room ? room.size : 0;

      if (participantCount >= 2 && !room.has(socket.id)) {
        // Room is full, reject join request
        socket.emit("bind_room_user", { status: "Failed", reason: "Room is full (maximum 2 participants)" });
        return;
      }

      // Room has space or user is already in the room
      if (session.sessionCreatorId === uid) {
        // Interviewer
        await socket.join(roomId);
      } else {
        // Non-interviewer
        await socket.join(roomId);
      }
      socket.emit("bind_room_user", { status: "Success" });
    } else {
      console.log("Invalid session.");
      socket.emit("bind_room_user", { status: "Failed" });
    }
  });

  // Get all users in a room
  socket.on("get_room_users", (msg) => {
    const { roomId } = msg;
    const room = io.sockets.adapter.rooms.get(roomId); // Get the room object
    const usersInRoom = room ? Array.from(room) : []; // Get all socket IDs in the room

    socket.emit("get_room_users", usersInRoom);
  });

  // Sychronize editor codes for users in same room
  socket.on("synchronize_code", (msg) => {
    const { roomId, newCode } = msg;
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit("synchronize_code", newCode);
  });

  socket.on("synchronize_language", (msg) => {
    const { roomId, language } = msg;
    // Broadcast the selected language to all other users in the same room
    socket.broadcast.to(roomId).emit("synchronize_language", language);
  });

  // Sychronize editor notes for users in same room
  socket.on("synchronize_notepad", (msg) => {
    const { roomId, newNotes } = msg;
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit("synchronize_notepad", newNotes);
  });

  // Sychronize editor terminal for users in same room
  socket.on("synchronize_terminal", (msg) => {
    const { roomId, terminalOutput } = msg;
    // Broadcast the terminal output to all other users in the same room
    socket.broadcast.to(roomId).emit("synchronize_terminal", terminalOutput);
  });

  // Synchronizes problem selection for users in same room
  socket.on("problem_panel_synchronization", (msg) => {
    const { roomId, problem } = msg;
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit("problem_panel_synchronization", problem);
  });

  // WebRTC: Send offer to a peer
  // WebRTC signaling for offer/answer/candidate
  socket.on("webrtc_offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc_offer", { offer, from: socket.id });
  });

  socket.on("webrtc_answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc_answer", { answer, from: socket.id });
  });

  socket.on("webrtc_ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc_ice_candidate", { candidate, from: socket.id });
  });

  // User joins a room
  socket.on("room_participant", (data) => {
    const { roomId, userName } = data;

    // Default user data for each newly joined participant
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

    // Get all **other** participants in the room
    const participantsList = getParticipantsInRoom(roomId);

    // Send the current participant list of all **other** users to the newly joined user
    socket.emit("participants_list", participantsList);
  });

  // Checks if remote peer is ready for peer connection
  socket.on("peer_ready", (data) => {
    const { roomId, ready } = data;
    socket.to(roomId).emit("peer_ready", { ready });
  });

  socket.on("panel_join_notif", (data) => {
    const roomId = data.roomId;
    socket.to(roomId).emit("panel_join_notif", data);
  });

  socket.on("panel_join_ack", (data) => {
    const roomId = data.roomId;
    socket.to(roomId).emit("panel_join_ack", data);
  });

  // User leaves a room
  socket.on("leave_room", async (data) => {
    const { roomId } = data;
    if (socket.userData) {
      // Notify **other** users that current user has left
      socket.to(roomId).emit("participant_left", {
        userId: socket.id,
        userName: socket.userData.userName,
      });
    }

    // Leave the room
    await socket.leave(roomId);
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

  socket.on("peer_ack", (data) => {
    socket.to(data.roomId).emit("peer_ack", data);
  });

  socket.on("update_video", (data) => {
    socket.to(data.roomId).emit("update_video", data);
  });

  socket.on("peer_connection_prepared", (data) => {
    console.log("peer connection prepared request");
    socket.to(data.roomId).emit("peer_connection_prepared", data);
  });

  // Handles WebRTC sending metadata to other party require for P2P connection (for video/audio streaming)
  socket.on("signal", (data) => {
    // The metadata will be one of three things: offer from caller, ice candidates, or answer to offer by receiver
    // For offer, send to other users in room
    if (data.offer) {
      socket.to(data.roomId).emit("incoming-offer", { offer: data.offer });
    }
    // For answer to offer
    else if (data.answer) {
      socket.to(data.roomId).emit("incoming-answer", { answer: data.answer });
    }
    // For ice candidates
    else if (data.candidates) {
      socket.to(data.roomId).emit("incoming-candidates", { candidates: data.candidates, currentUserRole: data.currentUserRole });
    }
    // For closing peer connection
    else if (data.closePeerConn) {
      socket.to(data.roomId).emit("close-peer", { closePeerConn: true });
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
server.listen(port, host, () => {
  console.log(port, host);
  const address = server.address();
  console.log(address);
  console.log(`Server is running on ${process.env.REACT_APP_BACKEND_HOST}`);
});
