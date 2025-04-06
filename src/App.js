// Other custom modules
import { express, app, server, io, generateRoom } from "./backend/user_sessions/session.js"; // For room creation
import { registerUserRoutes } from "./backend/user_accounts/account_registration.js"; // For Account registration
import { getSession } from "./backend/utils/firebase_utils/realtime_db_utils.js";
import { userHasRoom, getRoomForUser } from "./backend/utils/firebase_utils/room_utils.js";
import { verifyJWTToken } from "./backend/utils/firebase_utils/auth_utils.js";

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));
const port = process.env.BACKEND_PORT;

// Handles user account registration
registerUserRoutes(app)

// Listen for socket connection
io.on('connection', (socket) => {
  console.log("a user has connected")

  // Handles room creation
  socket.on("createroom", async (msg) => {
    const { uid, jwtToken } = msg
    
    // Perform some authorization checks 
    verifyJWTToken(jwtToken)
    if (userHasRoom(uid))
      socket.emit("createroom", `user is already associated with an existing room: ${await getRoomForUser(uid)}`)
    

    // Create a new room and respond back to frontend with the room path
    const room = await generateRoom(uid)
    console.log(room)
    socket.emit("createroom", `user is now bind to room: ${room}`)
  })

  // Listen for 'bind_room_user' event, which checks if current user 
  // can enter room. If so, bind current user to this room.
  socket.on("bind_room_user", async (msg) => {
    const { uid, roomId } = msg

    console.log("attempting to bind user to room")
    // Remove the socket from its own `socket.id` room (the default behavior in Socket.io)
    socket.leave(socket.id); // This leaves the automatic room created by `socket.id`

    // User is either an interviewer or not an interviewer but all users
    // must be authenticated already 
    const session = await getSession(roomId)
    if (session){
      if (session.sessionCreatorId === uid){
        // Interviewer 
        socket.join(roomId)
        console.log("interviewer joined room")
      }
      else{
        // Non-interviewer
        socket.join(roomId)
        console.log("non-interviewer joined room")
        console.log("joined room id: ", socket.rooms)
      }
    }
  })

  // Get all users in a room
  socket.on('get_room_users', (msg) => {
    const { roomId } = msg;
    const room = io.sockets.adapter.rooms.get(roomId); // Get the room object
    const usersInRoom = room ? Array.from(room) : []; // Get all socket IDs in the room
    console.log('Users in room', roomId, usersInRoom);
    
    // Emit the list of users to the requesting client
    socket.emit('get_room_users', usersInRoom);
  });

  // Sychronize editor codes for users in same room
  socket.on('synchronize_code', (msg) => {
    const { roomId, newCode } = msg;
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit('synchronize_code', newCode);
  })

  // Synchronizes problem selection for users in same room
  socket.on('problem_panel_synchronization', (msg) => {
    const { roomId, problem } = msg;
    console.log("NEW PROBLEM: ", problem)
    // Broadcast the updated code to all other users in the same room
    socket.broadcast.to(roomId).emit('problem_panel_synchronization', problem);
  })

  // Handle disconnections: A user is disconnected whenever a React component is unmounted
  socket.on('disconnect', () => {
    console.log("a user has disconnected")
  })
})

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
