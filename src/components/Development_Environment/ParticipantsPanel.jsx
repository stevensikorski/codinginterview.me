import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown, User } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen, userName, socket, roomId }) {
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  

  const remoteVidRef = useRef(null);
  const peerConnectionLocalRef = useRef(null);
  const peerConnectionRemoteRef = useRef(null);

  const configuration = {
    iceServers: [
      {
        urls: ["stun:stun.l.google.com:19302"],
      },
      {
        urls: ["turn:turn.bistri.com:80"],
        credential: "homeo",
        username: "homeo",
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
      isOn: newVideoState
    });
  };

  // Listen for ICE candidates on a RTCPeerConnection (can be used by both peers)
  const sendIceCandidates = (event, currentUserRole) => {
    console.log("preparing to send ICE candidates");
    if (event.candidate) {
      socket.emit("signal", {
        candidates: event.candidate,
        roomId: roomId,
        currentUserRole: currentUserRole,
      });
    }
  };

  // Remote peer sends its own ice candidates to the other peer
  const handleIceRemotePeer = (event) => {
    sendIceCandidates(event, "remotePeer");
  };

  // Used by a local or remote peer
  const handleIncomingCandidates = async (message) => {
    console.log("received incoming candidates in frontend");
    console.log(message.candidates);
    if (message.candidates) {
      const role = message.currentUserRole;

      if (role == "localPeer" && peerConnectionRemoteRef.current) await peerConnectionRemoteRef.current.addIceCandidate(message.candidates);
      else if (role == "remotePeer" && peerConnectionLocalRef.current) await peerConnectionLocalRef.current.addIceCandidate(message.candidates);
      console.log("Finished receiving ice candidates from " + message.currentUserRole);
    }
  };

  // Keeps track of remote streams
  const trackHandler = async (event) => {
    // NOTE: Make sure to hanlde both AUDIO and VIDEO
    console.log("INSIDE TRACK HANDLER FUNCTION TO LISTEN FOR REMOTE STREAM")
    console.log(event.track)
    console.log(event.streams)
    const remoteStream = event.streams[0];

    if (!remoteStream) {
      console.error("No stream in track event!");
      return;
    }
    if (event.track.kind === 'audio'){
      console.log("RECEIVED AUDIO STREAM!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
        console.log("Track state:", event.track.readyState); // Must be "live"
      audioRef.current.srcObject = remoteStream;
      // Force play with fallback
      audioRef.current.play().catch((err) => {
        console.warn("Audio play blocked by browser:", err);
      });
    }
    else{
      remoteVidRef.current.srcObject = remoteStream;
    } 
  };

  // Resets peer connection based on role
  const resetPeer = (role) => {
    if (role === "local") {
      if (peerConnectionLocalRef.current) {
        peerConnectionLocalRef.current.removeEventListener("icecandidate", handleIceLocalPeer);
        peerConnectionLocalRef.current.removeEventListener("connectionstatechange", connectionHandler);
        peerConnectionLocalRef.current.close();
        peerConnectionLocalRef.current = null;
      }
    } else {
      if (peerConnectionRemoteRef.current) {
        peerConnectionRemoteRef.current.removeEventListener("icecandidate", handleIceRemotePeer);
        peerConnectionRemoteRef.current.removeEventListener("track", trackHandler);
        peerConnectionRemoteRef.current.close();
        peerConnectionRemoteRef.current = null;
      }
    }
  };

  // Named event handler to handle forwarding local ICE candidates to signaling server
  const handleIceLocalPeer = (event) => {
    sendIceCandidates(event, "localPeer");
  };
  // Named event handler to detect connection state of local peer to remote peer
  const connectionHandler = (event) => {
    console.log("current peer connection status: ", peerConnectionLocalRef.current.connectionState);
    if (peerConnectionLocalRef.current.connectionState == "connected") {
      // Peers are now connected
      console.log("peers connected!");
    }
  };

  // Handle user presence
  useEffect(() => {
    if (!socket || !roomId || !userName) return;

    // Listen for a new participant excluding itself that joined the room
    socket.on("participant_joined", (data) => {
      console.log("new participant: ", data);
      console.log(data.userName);

      setParticipants((prevParticipants) => {
        // Check if this participant already exists
        if (prevParticipants.some((p) => p.userId === data.userId)) {
          console.log("OTHER PARTICIPANT ALREADY EXISTS");
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

      console.log("PARTICIPANTS LIST: ", uniqueParticipants);
      setParticipants(uniqueParticipants);
    });

    // Listen for participant disconnection
    // Removes the object associated with the participant that has disconnected
    socket.on("participant_left", (data) => {
      console.log("participant has left");
      console.log(data);

      resetPeer("local");
      resetPeer("remote");
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p.userId !== data.userId));
    });

    // Listen for media state changes from other participants
    socket.on("media_state_update", (data) => {
      console.log("FRONTEND MEDIA STATE UPDATE");

      // React Strict Mode calls invokes updater function twice
      setParticipants((prevParticipants) => {
        return prevParticipants.map((participant) => {
          if (participant.userId === data.userId) {
            console.log("MEDIA STATE INVOKEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
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

    // If user's tab is closed, React cannot guarantee to re-render child components
    // So, let the browser notify the backend about the disconnection and let it notify other users
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
    const handleUnload = () => {
      if (peerConnectionLocalRef.current) {
        peerConnectionLocalRef.current.close();
        peerConnectionLocalRef.current = null;
      }

      if (peerConnectionRemoteRef.current) {
        peerConnectionRemoteRef.current.close();
        peerConnectionLocalRef.current = null;
      }
      socket.emit("leave_room", { roomId });
    };
    window.addEventListener("beforeunload", handleUnload);
    socket.emit("room_participant", { roomId, userName });

    // Cleanup on unmount
    return () => {
      console.log("USEEFFECT IS RUN");
      window.removeEventListener("beforeunload", handleUnload);
      socket.off("participant_joined");
      socket.off("participants_list");
      socket.off("participant_left");
      socket.off("media_state_update");
    };
  }, [userName, socket, roomId]);

  // Local peer connection handshake
  // This runs whenever the local user toggles their own video
  useEffect(() => {
    if (isVideoOn) {
      console.log("video is on");
      let shallowRef = videoRef.current;

      // Enable local video if it is not enabled.
      // If local video is already enabled, do nothing.
      const handleVideo = async () => {
        console.log(videoRef.current, videoRef.current?.srcObject);

        if (videoRef.current && !videoRef.current.srcObject) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (shallowRef && Object.is(shallowRef, videoRef.current)) {
            videoRef.current.srcObject = stream;

            // Add to existing peer connection if it has one 
            if (peerConnectionLocalRef.current){
              // Find the video transceiver's sender and replace the track with the new one
              // console.log(peerConnectionLocalRef.current.getTransceivers())
              // const transceivers = peerConnectionLocalRef.current.getTransceivers()
              // // transceivers.forEach(transceiver => {
              // //   if (transceiver.mid === "0")
              // // })

              // const videoTransceiver = transceivers[0].sender 
              // console.log(videoTransceiver);
              // await videoTransceiver.replaceTrack(videoTrack)
              // console.log("Replaced local video track in existing peer connection.")
              // console.log(peerConnectionLocalRef.current.getTransceivers())
              stream.getTracks().forEach((track) => {
                peerConnectionLocalRef.current.addTrack(track, stream);
              });

              // Renogotiation
              const offer = await peerConnectionLocalRef.current.createOffer();
              await peerConnectionLocalRef.current.setLocalDescription(offer);
              socket.emit("signal", { offer, roomId });
              
            }
            console.log("Video stream attached successfully.");
          }
        }
      };

      // Enables local camera 
      const initializeCall = async () => {
        // Ensure local video is enabled
        await handleVideo();
      }
      initializeCall();
    } else {
      console.log("video is off");

      //video stream cleanup
      if (videoRef.current) {
        videoRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      console.log("NONEMPTY USEEFFECT CLEANUP");
    };
  }, [isVideoOn]);

  // Both peers' sockets can call this
  useEffect(() => {
    if (!socket) return;
    // Listen for incoming ICE candidates and add them to the peer connection
    socket.on("incoming-candidates", handleIncomingCandidates);

    return () => {
      socket.off("incoming-candidates");
    };
  }, [socket]);

  // Local audio stream
  useEffect(() => {
    console.log("INSIDE AUDIO USEEFFECT")
    if (isMicOn) {
      let shallowRef = audioRef.current;
      const handleAudio = async () => {
        console.log(audioRef.current, audioRef.current?.srcObject);
        // If there's no existing audio stream
        if (audioRef.current && !audioRef.current.srcObject) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });      
            if (shallowRef && Object.is(shallowRef, audioRef.current)) {      
              // Add audio track to existing peer connection if available
              if (peerConnectionLocalRef.current) {
                stream.getTracks().forEach((track) => {
                  peerConnectionLocalRef.current.addTrack(track, stream);
                });
      
                // Renegotiate
                const offer = await peerConnectionLocalRef.current.createOffer();
                await peerConnectionLocalRef.current.setLocalDescription(offer);
                socket.emit("signal", { offer, roomId });
              }
      
              console.log("Audio stream attached successfully.");
            }
          } catch (err) {
            console.error("Error accessing microphone:", err);
          }
        }
      };
      
      const initializeAudio = async () => {
        await handleAudio();
      };
      initializeAudio();      
    } else {
      // Stop playing local audio
      if (audioRef.current && audioRef.current.srcObject) {
        audioRef.current.srcObject.getTracks().forEach((track) => track.stop());
        audioRef.current.srcObject = null;
      }

      // Stop sending local audio to remote peer
      if (peerConnectionLocalRef.current){
        const senders = peerConnectionLocalRef.current?.getSenders() || [];
        const audioSender = senders.find(sender => sender.track?.kind === 'audio');
        if (audioSender) {
          audioSender.replaceTrack(null); // Or use removeTrack(sender)
        }
      }
    }
  }, [isMicOn]);

  // Create peer connection before video/audio is/are enabled
  // Idea is that when video/audio is enabled, simply add tracks to the existing connection.
  useEffect(() => {
    // Do not establish peer connection if no other participants are in the room
    if (!participants.length) return; 

    // Remote peers listens for offer from other peer
    const handleIncomingOffer = (message) => {
      console.log("offer received in frontend");
      console.log(message);
      console.log(message.offer);
      if (message.offer) {
        // Send offer answer to the other peer
        peerConnectionRemoteRef.current
          .setRemoteDescription(new RTCSessionDescription(message.offer))
          .then(() => peerConnectionRemoteRef.current.createAnswer())
          .then((answer) => {
            console.log("answer = ", answer);
            peerConnectionRemoteRef.current.setLocalDescription(answer);
            return answer;
          })
          .then((answer) => socket.emit("signal", { answer, roomId }));
      }
    };

    const preparePeerConnection = async () => {
      // Make itself the remote peer role 
      if (!peerConnectionRemoteRef.current){
        peerConnectionRemoteRef.current = new RTCPeerConnection(configuration); 
        peerConnectionRemoteRef.current.addEventListener("icecandidate", handleIceRemotePeer);
        peerConnectionRemoteRef.current.ontrack = trackHandler;
        peerConnectionRemoteRef.current.addTransceiver("video", { direction: "recvonly" });
        peerConnectionRemoteRef.current.addTransceiver("audio", { direction: "recvonly" });
        socket.on("incoming-offer", handleIncomingOffer);

        peerConnectionRemoteRef.current.addEventListener("connectionstatechange", () => {
          console.log("current peer connection status: ", peerConnectionRemoteRef.current.connectionState);
        });
      }
              
      // Make itself the local peer role
      if (!peerConnectionLocalRef.current) {
        console.log("Discovered new participant, initializing peer connection...");

        //  Make itself the local peer role
        peerConnectionLocalRef.current = new RTCPeerConnection(configuration);
        peerConnectionLocalRef.current.ontrack = trackHandler;

        // Wait for WebRTC to retrieve local ICE candidates and send them to other peer
        peerConnectionLocalRef.current.addEventListener("icecandidate", handleIceLocalPeer);

        // This ensures we get a fully established peer connection
        peerConnectionLocalRef.current.addTransceiver("video", { direction: "sendonly" });
        peerConnectionLocalRef.current.addTransceiver("audio", { direction: "sendonly" });

        // Listen for answer to offer by the other peer
        socket.on("incoming-answer", (message) => {
          console.log("incoming answer received in frontend");
          console.log(message.answer);
          if (message.answer) {
            let remoteDesc = new RTCSessionDescription(message.answer);
            peerConnectionLocalRef.current.setRemoteDescription(remoteDesc).then(() => {
              console.log("answer received IN FRONTEND");
            });
          }

          console.log(peerConnectionLocalRef.current.iceConnectionState);
          console.log(peerConnectionLocalRef.current.connectionState);
        });

        // Create an offer and send it to the other peer
        peerConnectionLocalRef.current.createOffer().then((offer) => {
          peerConnectionLocalRef.current.setLocalDescription(offer).then(() => {
            socket.emit("signal", { offer, roomId });
          });
        });

        // Check if connection between peers is established
        peerConnectionLocalRef.current.addEventListener("connectionstatechange", connectionHandler);
      }
    }

    const initializeCall = async () => {
      // Prepare the peer connection (if not already prepared)
      await preparePeerConnection();
    };
    initializeCall();

    return () => {
      socket.off("incoming-answer");
      socket.off("incoming-offer");
      socket.off("peer_ready");
      resetPeer("local");
      resetPeer("remote")
    }
    }, [participants.length])

  // Get the remote user (if any)
  const remoteUser = participants.length > 0 ? participants[0] : null;
  console.log("REMOTE USER: ", remoteUser);
  console.log("participant list (of all **other** users): ", participants);

  return (
    <div className="flex flex-none flex-col rounded-lg border shadow bg-editor border-neutral-800 overflow-hidden">
      <div className="flex flex-row justify-between items-center bg-neutral-900">
        <p className="p-1 px-2 font-semibold text-neutral-600">Participants</p>

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
        <audio ref={audioRef} autoPlay className="hidden" />

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
              <video id={`video-${remoteUser.userId}`} ref={remoteVidRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
