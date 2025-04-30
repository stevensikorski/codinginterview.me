import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown, User } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen, userName, socket, roomId }) {
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const peerConnectionLocalRef = useRef(null);
  const peerConnectionRemoteRef = useRef(null);

  const configuration = 
  {
    iceServers: [
      {
        url: 'stun:stun.l.google.com:19302'
      },
      {
        url: 'turn:turn.bistri.com:80',
        credential: 'homeo',
        username: 'homeo'
      },
    ],
  };
  
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
    console.log("VIDEO IS TOGGLED");
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

  // Listen for ICE candidates on a RTCPeerConnection (can be used by both peers)
  const sendIceCandidates = (event, currentUserRole) => {
    console.log("preparing to send ICE candidates")
    if (event.candidate) {
      socket.emit("signal", { 
        'candidates': event.candidate, 
        'roomId': roomId, 
        'currentUserRole': currentUserRole
      });
    }
  }

  // Remote peer sends its own ice candidates to the other peer
  const handleIceRemotePeer = (event) => {
    sendIceCandidates(event, "remotePeer")
  }

  // Used by a local or remote peer
  const handleIncomingCandidates = async (message) => {
    console.log("received incoming candidates in frontend")
    console.log(message.candidates)
    if (message.candidates){
      const role = message.currentUserRole; 

      if (role == 'localPeer' && peerConnectionRemoteRef.current)
        await peerConnectionRemoteRef.current.addIceCandidate(message.candidates)
      else if (role == 'remotePeer' && peerConnectionLocalRef.current)
        await peerConnectionLocalRef.current.addIceCandidate(message.candidates)
      console.log("Finished receiving ice candidates from " + message.currentUserRole)
    }
  }

  const trackHandler = async (event) => {
    const remoteStream = event.streams[0];
    const remoteVideoElement = document.getElementById(`video-${remoteUser.userId}`);

    console.log(remoteStream);
    if (remoteVideoElement){
      remoteVideoElement.srcObject = remoteStream;
      remoteVideoElement.play();
    }
  }

  // Handle user presence
  useEffect(() => {
    if (!socket || !roomId || !userName) return;

    // Listen for a new participant (excluding itself) that joined the room
    socket.on("participant_joined", (data) => {
      console.log("new participant: ", data)
      console.log(data.userName)
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
    // Retrieves all participants in current room (excluding itself and no duplicates allowed)
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

      console.log("PARTICIPANTS LIST: ", uniqueParticipants)
      setParticipants(uniqueParticipants);
    });

    // Listen for participant disconnection
    // Removes the object associated with the participant that has disconnected 
    socket.on("participant_left", (data) => {
      console.log("participant has left")
      console.log(data)
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p.userId !== data.userId));
    });

    console.log("Registering media_state_update listener");
    // Listen for media state changes from other participants
    socket.on("media_state_update", (data) => {
      console.log("FRONTEND MEDIA STATE UPDATE")

      // React Strict Mode calls invokes updater function twice, so be careful
      setParticipants((prevParticipants) => {
        return prevParticipants.map((participant) => {
          if (participant.userId === data.userId) {
            console.log("MEDIA STATE INVOKEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")
            if (data.mediaType === "audio") {
              return { ...participant, isMicOn: data.isOn };
            } else if (data.mediaType === "video") {
              console.log(data);
              // If enabled, current participant will serve as the 'remote peer' and get ready for peer connection
              if (data.isOn){
                if (!peerConnectionRemoteRef.current)
                  peerConnectionRemoteRef.current = new RTCPeerConnection(configuration);
              }
              // If disabled, reset peer connection
              else{
                console.log(peerConnectionRemoteRef.current)
                if (peerConnectionRemoteRef.current){
                  peerConnectionRemoteRef.current.removeEventListener("icecandidate", handleIceRemotePeer)
                  peerConnectionRemoteRef.current.removeEventListener('track', trackHandler)
                  peerConnectionRemoteRef.current = null;
                }
              }
              return { ...participant, isVideoOn: data.isOn };
            }
          }
          return participant;
        });
      });
    });

    // If user's tab is closed, React cannot guarantee to re-render child components
    // So, let the browser notify the backend about the disconnection and let it notify other users
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
    const handleUnload = () => {
      socket.emit("leave_room", { roomId })
    }
    window.addEventListener("beforeunload", handleUnload)
    socket.emit("room_participant", { roomId, userName })
    
    // Cleanup on unmount
    return () => {
      console.log("USEEFFECT IS RUN")
      window.removeEventListener("beforeunload", handleUnload)
      socket.off("participant_joined");
      socket.off("participants_list");
      socket.off("participant_left");
      socket.off("media_state_update");
    };
  }, [userName, socket, roomId]);

  // Remote peer connection handshake 
  useEffect(() => {
    if (!peerConnectionRemoteRef.current) return; 
    peerConnectionRemoteRef.current.addEventListener("icecandidate", handleIceRemotePeer)

    // Remote peers listens for offer from other peer
    const handleIncomingOffer = (message) => {
      console.log("offer received in frontend")
      console.log(message)
      console.log(message.offer)
      if (message.offer) {
        console.log("Received an offer: ", 2);
  
        // Send offer answer to the other peer
        peerConnectionRemoteRef.current.setRemoteDescription(new RTCSessionDescription(message.offer))
          .then(() => peerConnectionRemoteRef.current.createAnswer())
          .then((answer) => {
            console.log("answer = ", answer)
            peerConnectionRemoteRef.current.setLocalDescription(answer)
            return answer
          })
          .then((answer) => socket.emit("signal", { answer, roomId}));
      }
    }

    // Listen for video tracks by other peer
    peerConnectionRemoteRef.current.addEventListener('track', trackHandler)
  
    // Remote Peer Reference
    const remotePeerAction = () => {
      // Upon receiving offer, send back an answer to calling party
      console.log("offer received, giving answer back to sender")
      socket.on("incoming-offer", handleIncomingOffer)
    }
    remotePeerAction(); 

    return () => {
      socket.off("incoming-offer");
    }
  }, [peerConnectionRemoteRef.current])

   // Local peer connection handshake
   useEffect(() => {
    console.log("NONEMPTY USEEFFECT")
    if (!isVideoOn) return;
    peerConnectionLocalRef.current = new RTCPeerConnection(configuration);

    // Local Peer Reference
    const handleIceLocalPeer = (event) => {
      sendIceCandidates(event, "localPeer")
    }

    const connectionHandler = (event) => {
      console.log("current peer connection status: ", peerConnectionLocalRef.current.connectionState)
      if (peerConnectionLocalRef.current.connectionState == 'connected'){
        // Peers are now connected 
        console.log("peers connected!")
      }
    }
    const localPeerAction = () => {
      // Add media tracks
      videoRef.current.srcObject.getTracks().forEach(track => {
        console.log("track: ")
        console.log(track)
        peerConnectionLocalRef.current.addTrack(track, videoRef.current.srcObject)
      })
      
      // Wait for WebRTC to retrieve ICE candidates and send them to other peer
      peerConnectionLocalRef.current.addEventListener("icecandidate", handleIceLocalPeer)

      // Listen for answer to offer by receiving party
      socket.on("incoming-answer", message => {
        console.log("incoming answer received in frontend")
        console.log(message.answer)
        if (message.answer){
          let remoteDesc = new RTCSessionDescription(message.answer)
          peerConnectionLocalRef.current.setRemoteDescription(remoteDesc)
            .then(() => {
              console.log("answer received IN FRONTEND")
            })
        }
      })

      // Create an offer and send it 
      peerConnectionLocalRef.current.createOffer()
        .then((offer) => {
          peerConnectionLocalRef.current.setLocalDescription(offer)
            .then(() => {
              socket.emit("signal", { offer, roomId})
            })
        })
      // // Check if connection between peers is established 
      peerConnectionLocalRef.current.addEventListener('connectionstatechange', connectionHandler);
    }

    if (isVideoOn) {
      console.log("video is on")
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            localPeerAction()
          }
        })
    } else {
      if (videoRef.current) {
        videoRef.current.getTracks().forEach((track) => track.stop());
        videoRef.current = null;
      }
    }

    return () => {
      console.log("NONEMPTY USEEFFECT CLEANUP")
      peerConnectionLocalRef.current.removeEventListener("icecandidate", handleIceLocalPeer)
      peerConnectionLocalRef.current.addEventListener("connectionstatechange", connectionHandler)
      socket.off('incoming-answer', handleIncomingCandidates)
    }
  }, [isVideoOn]);

  // Both peers can call this
  useEffect(() => {
    // Listen for incoming ICE candidates and add them to the peer connection
    socket.on("incoming-candidates", handleIncomingCandidates)

    return () => {
      socket.off("incoming-candidates")
    }
  }, [])

  // Local audio stream
  useEffect(() => {
    if (isMicOn) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = stream;
            audioRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing audio:", err);
        });
    } else {
      if (audioRef.current) {
        audioRef.current.getTracks().forEach((track) => track.stop());
        audioRef.current = null;
      }
    }
  }, [isMicOn]);

  // Get the remote user (if any)
  const remoteUser = participants.length > 0 ? participants[0] : null;
  console.log("REMOTE USER: ", remoteUser)
  console.log("participant list (of all **other** users): ", participants)

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
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                <video id={`video-${remoteUser.userId}`} autoPlay muted className="w-full h-full object-cover" />
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
