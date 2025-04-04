import { useParams } from 'react-router-dom';
import DevelopmentEnvironmentPage from '../Development_Environment/EditorPage';

function Room() {
  // Get the room ID from the URL
  const { roomId } = useParams(); 
  console.log(roomId)
  // You can fetch more data based on the ID here if necessary
//   useEffect(() => {
//     const fetchRoomData = async () => {
//       const response = await fetch(`/api/rooms/${id}`); // Fetch the room data using the ID
//       const roomData = await response.json();
//       console.log('Room data:', roomData);
//     };

//     fetchRoomData();
//   }, [id]);

  return <DevelopmentEnvironmentPage />;
}

export default Room;
