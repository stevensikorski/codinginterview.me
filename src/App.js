// Other custom modules
import { express, app, server, io, generateRoom } from "./backend/user_sessions/session.js"; // For room creation
import { registerUserRoutes } from "./backend/user_accounts/account_registration.js"; // For Account registration

// Initialize backend
app.use(express.json());  

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use("/", express.urlencoded({ extended: true }));
const port = process.env.BACKEND_PORT;

// Initialize the routes for imported js files
// registration.js, for user account registration
registerUserRoutes(app)

// Listen for socket connection
io.on('connection', (socket) => {
  console.log("a user has connected")

  // Listen for specific event names (specified by socket-client)
  socket.on("createroom", (msg) => {
    const { uid, jwtToken } = msg
    const room = generateRoom(uid, jwtToken)

    // If roomPath is null, the current user is already associated with a room 
    if (!room) 
      socket.emit("messageResponse", "user is already in a room.")
    else
    // Otherwise, returns the unique room path to the emitting socket only in the frontend
      socket.emit("messageResponse", room)

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
