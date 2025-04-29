import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown, User } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen, userName, socket, roomId }) {
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const videoStreamRef = useRef(null);
  const audioStreamRef = useRef(null);

  const toggleMic = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    // Emit mic status change to other participants
    socket.emit("media_state_change", {
      roomId,
      userId: socket.id,
      mediaType: "audio",
      isOn: newMicState,
    });
  };

  const toggleVideo = () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);
    // Emit video status change to other participants
    socket.emit("media_state_change", {
      roomId,
      userId: socket.id,
      mediaType: "video",
      isOn: newVideoState,
    });
  };

  // Initialize socket connection and handle user presence
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join the room
    socket.emit("join_room", { roomId, userName });

    // Listen for new participants
    socket.on("participant_joined", (data) => {
      setParticipants((prevParticipants) => {
        // Check if this participant already exists
        if (prevParticipants.some((p) => p.userId === data.userId)) {
          return prevParticipants;
        }

        // Add new participant
        return [
          ...prevParticipants,
          {
            userId: data.userId,
            userName: data.userName,
            isVideoOn: false,
            isMicOn: false,
          },
        ];
      });
    });

    // Listen for participant list updates
    socket.on("participants_list", (participantsList) => {
      // Make sure we don't have duplicates by using userId as unique identifier
      const uniqueParticipants = [];
      const seenUserIds = new Set();

      participantsList.forEach((participant) => {
        if (!seenUserIds.has(participant.userId)) {
          seenUserIds.add(participant.userId);
          uniqueParticipants.push(participant);
        }
      });

      setParticipants(uniqueParticipants);
    });

    // Listen for participant disconnection
    socket.on("participant_left", (data) => {
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p.userId !== data.userId));
    });

    // Listen for media state changes from other participants
    socket.on("media_state_update", (data) => {
      setParticipants((prevParticipants) => {
        return prevParticipants.map((participant) => {
          if (participant.userId === data.userId) {
            if (data.mediaType === "audio") {
              return { ...participant, isMicOn: data.isOn };
            } else if (data.mediaType === "video") {
              return { ...participant, isVideoOn: data.isOn };
            }
          }
          return participant;
        });
      });
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("participant_joined");
      socket.off("participants_list");
      socket.off("participant_left");
      socket.off("media_state_update");
    };
  }, [socket, roomId, userName]);

  // Local video stream
  useEffect(() => {
    if (isVideoOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing video:", err);
        });
    } else {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
        videoStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [isVideoOn]);

  // Local audio stream
  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioStreamRef.current = stream;
          if (audioRef.current) {
            audioRef.current.srcObject = stream;
            audioRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing audio:", err);
        });
    } else {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    }
  }, [isMicOn]);

  // Get the remote user (if any)
  const remoteUser = participants.length > 0 ? participants[0] : null;

  return (
    <div className="flex flex-none flex-col rounded-lg border shadow bg-editor border-neutral-800 overflow-hidden">
      <div className="flex flex-row justify-between items-center bg-neutral-900">
        <p className="p-1 px-2 font-semibold text-neutral-600">Participants {remoteUser ? "(2)" : "(1)"}</p>

        {/* Media Control Buttons */}
        <div className="flex items-center px-1 gap-1">
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleMic}>
            {isMicOn ? <Mic className="p-1 text-neutral-600" /> : <MicOff className="p-1 text-red-500" />}
          </button>
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleVideo}>
            {isVideoOn ? <Video className="p-1 text-neutral-600" /> : <VideoOff className="p-1 text-red-500" />}
          </button>
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleOpen}>
            <ChevronDown className={`p-1 text-neutral-600 transition-transform duration-200 ${isOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Participants Camera */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-800 text-neutral-600 border-t border-neutral-800 transition-opacity duration-300 ${isOpen ? "" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
        {/* Audio Elements for local and remote audio */}
        <audio ref={audioRef} autoPlay muted className="hidden" />

        {/* Local User */}
        <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center">
          {isVideoOn ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <VideoOff className="size-8 text-neutral-900" />
            </div>
          )}

          {/* Local user info overlay */}
          <div className="absolute bottom-2 left-2 text-neutral-500 bg-black/50 shadow px-2 py-1 rounded text-sm flex items-center gap-1 select-none">
            <span>{userName || "You"}</span>
            {!isMicOn && <MicOff className="size-3 ml-1 text-red-500" />}
          </div>
        </div>

        {/* Remote User */}
        <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center">
          {remoteUser ? (
            remoteUser.isVideoOn ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <VideoOff className="size-8 text-neutral-900" />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <User className="size-8 text-neutral-900" />
            </div>
          )}

          {/* Remote user info overlay */}
          {remoteUser && (
            <div className="absolute bottom-2 left-2 text-neutral-500 bg-black/50 shadow px-2 py-1 rounded text-sm flex items-center gap-1 select-none">
              <span>{remoteUser.userName || "Guest"}</span>
              {!remoteUser.isMicOn && <MicOff className="size-3 ml-1 text-red-500" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
