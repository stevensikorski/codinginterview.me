import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getUser } from "../utilities/auth_context";
import { io } from "socket.io-client";

// Components
import DevelopmentEnvironmentPage from "../Development_Environment/EditorPage";
import Spinner from "../shared/Spinner";

// This component represents a room in which participants join
// All sockets are initialized here and disconnected here
function Room() {
  // Get the room ID from the URL
  const { roomId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidRoom, setIsValidRoom] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef(null);
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_BACKEND_HOST}`, {
        path: "/createsession",
      });
    }

    // Event handlers
    const validateCurrentRoom = async () => {
      // Fetch the room data using the ID;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/rooms/${roomId}/validate`);
      // HTTP Code 200 (OK)
      if (response.ok) {
        // Room is valid
        setIsValidRoom(true);
      } else {
        // Room is valid
      }
    };

    // For user validation in room, use socket
    const handleBindRoomUsers = (message) => {
      if (message.status === "Success") {
        socketRef.current.emit("get_room_users", { roomId: roomId });
      } else {
        console.log("Room failed to bound to user");
      }
    };

    const handleGetRoomUsers = (response) => {
      setIsLoading(false);
    };

    const bindRoomUser = async () => {
      const user = await getUser();
      const uid = user.uid;

      // Make sure binding comes before fetching room users
      socketRef.current.emit("bind_room_user", { uid: uid, roomId: roomId });
    };

    // Event listeners
    socketRef.current.on("bind_room_user", handleBindRoomUsers);
    socketRef.current.on("get_room_users", handleGetRoomUsers);
    socketRef.current.on("connect", async () => {
      setIsSocketConnected(true);
      await validateCurrentRoom();
      await bindRoomUser();
    });
    socketRef.current.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    return () => {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, []);

  if (isLoading) return <Spinner />;

  if (!isValidRoom)
    return (
      <div className="bg-neutral-900 h-screen w-screen flex items-center justify-center">
        <h1>Unauthorized.</h1>
      </div>
    );
  else return <DevelopmentEnvironmentPage roomId={roomId} socket={socketRef.current} socketState={isSocketConnected} />;
}

export default Room;
