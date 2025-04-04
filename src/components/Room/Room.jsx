import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DevelopmentEnvironmentPage from '../Development_Environment/EditorPage';

function Room() {
  // Get the room ID from the URL
  const { roomId } = useParams();
  
  const [isLoading, setIsLoading] = useState(true)
  const [isValidRoom, setIsValidRoom] = useState(false)
  console.log(roomId)

  useEffect(() => {
    console.log("Current room id: ", roomId)
    const fetchRoomData = async () => {
      const response = await fetch(`http://localhost:3002/rooms/${roomId}/validate`); // Fetch the room data using the ID;
      const data = await response.json()

      console.log(data)
      // HTTP Code 200 (OK)
      if (response.ok){
        // Room is valid 
        setIsValidRoom(true)
      }
      else{
        // Room is valid
      }
      setIsLoading(false)
    };

    fetchRoomData();
  }, [isValidRoom]);

  if (isLoading)
    return <div>Loading...</div>

  if (!isValidRoom)
    return <div>Unauthorized</div>;
  else
    return <DevelopmentEnvironmentPage />;
}

export default Room;
