import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../utilities/auth_context";
import { io } from "socket.io-client";

// Components
import DevelopmentEnvironmentPage from "../Development_Environment/EditorPage";

function Room() {
  // Get the room ID from the URL
  const { roomId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isValidRoom, setIsValidRoom] = useState(false);

  const socket = io('http://localhost:3002/', { 
    path: '/createsession' 
  });
  console.log(socket)
  useEffect(() => {
    // SocketIO client object
    const socket = io("http://localhost:3002/", {
      path: "/createsession",
    });

    const validateCurrentRoom = async () => {
      const response = await fetch(`http://localhost:3002/rooms/${roomId}/validate`); // Fetch the room data using the ID;
      // const data = await response.json()

      // HTTP Code 200 (OK)
      if (response.ok) {
        // Room is valid
        setIsValidRoom(true);
      } else {
        // Room is valid
      }
      setIsLoading(false);
    };

    // For user validation in room, use socket
    const bindRoomUser = async () => {
      const user = await getUser();
      const uid = user.uid;

      socket.emit("bind_room_user", { uid, roomId });
    };

    // Get all users in room
    const getRoomUsers = () => {
      socket.on("get_room_users", (response) => {
        console.log(`Users in room ${roomId}: ${response}`);
      });
      socket.emit("get_room_users", { roomId });
    };

    // Force sequence of function calls since we have asynchronous events
    const runSequence = async () => {
        await validateCurrentRoom();
        await bindRoomUser();
        getRoomUsers()
    }
    runSequence()

    return () => {
      socket.disconnect()
    }
  }, [socket]);

  if (isLoading) return <div>Loading...</div>;

  if (!isValidRoom)
    return <div>Unauthorized</div>;
  else
    return <DevelopmentEnvironmentPage roomId={roomId} socket={socket} />;
}

export default Room;
