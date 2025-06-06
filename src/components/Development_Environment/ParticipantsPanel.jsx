import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown, User } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen, userName, socket, roomId }) {
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [remoteMicEnabled, setRemoteMicEnabled] = useState(false);
  const [remoteVidEnabled, setRemoteVidEnabled] = useState(false);
  const [peerConnectionReady, setPeerConnectionReady] = useState(false); // Tracks if remote peer is ready
  const [hasJoined, setHasJoined] = useState(false);
  const [hasRemoteJoined, setHasRemoteJoined] = useState(false);
  const remoteVideoTrackRef = useRef(null);
  const hasJoinedRef = useRef(false);

  const [localReady, setLocalReady] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);

  // DOM elements
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // audio stream of audioRef
  const micStream = useRef(null);
  const vidStream = useRef(null);

  const remoteVidRef = useRef(null);

  const peerConnectionLocalRef = useRef(null);
  const peerConnectionRemoteRef = useRef(null);
  const peersConnectedRef = useRef(null);

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
    if (event.candidate) {
      socket.emit("signal", {
        candidates: event.candidate,
        roomId: roomId,
        currentUserRole: currentUserRole,
      });
    }
  };

  // Enable local video if it is not enabled.
  // If local video is already enabled, do nothing.
  const handleVideo = async () => {
    if (videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = vidStream.current;
    }

    if (peerConnectionLocalRef.current && videoRef.current && videoRef.current.srcObject) {
      const newVideoTrack = vidStream.current.getVideoTracks()[0];
      newVideoTrack.enabled = true;

      let videoTransceiver = peerConnectionLocalRef.current.getTransceivers().find((t) => t.sender && t.receiver.track?.kind === "video");
      let sender = videoTransceiver.sender;
      if (sender) {
        if (sender.track !== newVideoTrack) {
          await sender.replaceTrack(newVideoTrack);
        }

        socket.emit("update_video", { roomId: roomId });
      } else {
        console.warn("⚠️ No available video transceiver/sender found");
      }
    }
  };

  // Remote peer sends its own ice candidates to the other peer
  const handleIceRemotePeer = (event) => {
    sendIceCandidates(event, "remotePeer");
  };

  // Used by a local or remote peer
  const handleIncomingCandidates = async (message) => {
    if (message.candidates) {
      const role = message.currentUserRole;

      if (role == "localPeer" && peerConnectionRemoteRef.current) {
        await peerConnectionRemoteRef.current.addIceCandidate(message.candidates);
      } else if (role == "remotePeer" && peerConnectionLocalRef.current) {
        await peerConnectionLocalRef.current.addIceCandidate(message.candidates);
      }
    }
  };

  // Keeps track of remote streams
  const trackHandler = async (event) => {
    let remoteStream = event.streams[0];
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }

    if (event.track.kind === "audio") {
      remoteStream.addTrack(event.track);
      audioRef.current.srcObject = remoteStream;

      // Force play with fallback
    } else if (event.track.kind === "video") {
      remoteVideoTrackRef.current = event.track;
    }
  };

  const handleJoin = () => {
    setHasJoined(true); // Update state (for UI re-render)
    hasJoinedRef.current = true; // Update ref (for immediate access in handlers)
  };

  const startMic = async () => {
    try {
      if (!peersConnectedRef.current) {
        return;
      }

      if (peerConnectionLocalRef.current) {
        let audioTransceiver = peerConnectionLocalRef.current.getTransceivers().find((t) => t.sender && t.receiver.track?.kind === "audio");
        let sender = audioTransceiver.sender;

        if (sender) {
          const newAudioTrack = micStream.current.getAudioTracks()[0];
          // Replace the track if needed
          if (sender.track !== newAudioTrack) {
            await sender.replaceTrack(newAudioTrack);
          }
        } else {
          console.warn("⚠️ No available audio transceiver/sender found");
        }
      }
    } catch (error) {
      console.error("Error in startMic:", error);
    }
  };

  const initializePeerConnection = () => {
    if (peerConnectionLocalRef.current) {
      // Create an offer and send it to the other peer
      peerConnectionLocalRef.current.createOffer().then((offer) => {
        peerConnectionLocalRef.current.setLocalDescription(offer).then(() => {
          socket.emit("signal", { offer, roomId });
        });
      });
    }
  };

  // Remote peers listens for offer from other peer
  const handleIncomingOffer = async (message) => {
    if (message.offer) {
      await peerConnectionRemoteRef.current.setRemoteDescription(message.offer);

      // Create an answer
      const answer = await peerConnectionRemoteRef.current.createAnswer();

      // // Set the local description (answer)
      await peerConnectionRemoteRef.current.setLocalDescription(answer);

      // // Emit the answer to the signaling server
      socket.emit("signal", { answer, roomId });
    }
  };

  // Resets peer connection
  const resetPeer = () => {
    if (peerConnectionLocalRef.current) {
      peerConnectionLocalRef.current.removeEventListener("icecandidate", handleIceLocalPeer);
      peerConnectionLocalRef.current.removeEventListener("connectionstatechange", connectionHandler);
      peerConnectionLocalRef.current.onicecandidate = null;
      peerConnectionLocalRef.current.onconnectionstatechange = null;
      peerConnectionLocalRef.current.close();
      peerConnectionLocalRef.current = null;
      // micStream.current?.getTracks().forEach((track) => track.stop());
    }

    if (peerConnectionRemoteRef.current) {
      peerConnectionRemoteRef.current.removeEventListener("icecandidate", handleIceRemotePeer);
      peerConnectionRemoteRef.current.removeEventListener("track", trackHandler);
      peerConnectionRemoteRef.current.onicecandidate = null;
      peerConnectionRemoteRef.current.onconnectionstatechange = null;
      peerConnectionRemoteRef.current.close();
      peerConnectionRemoteRef.current = null;
    }
    peersConnectedRef.current = null;
    setPeerConnectionReady(false);
    setRemoteMicEnabled(false);
    setRemoteVidEnabled(false);

    setLocalReady(false);
    setRemoteReady(false);
    setHasRemoteJoined(false);
  };

  const playRemoteAudio = () => {
    console.log("AUDIO IS PLAYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYED");
    if (audioRef.current.srcObject) {
      audioRef.current.play().catch(console.warn);
    }
  };

  // Named event handler to handle forwarding local ICE candidates to signaling server
  const handleIceLocalPeer = (event) => {
    sendIceCandidates(event, "localPeer");
  };
  // Named event handler to detect connection state of local peer to remote peer
  const connectionHandler = (event) => {
    if (peerConnectionLocalRef.current.connectionState == "connected") {
      // Peers are now connected
      peersConnectedRef.current = true;

      // If local participant has video/audio enabled, send media update for peer connection
      // if (isMicOn){
      // Emit mic status change to other participants
      socket.emit("media_state_change", {
        roomId,
        userId: socket.id,
        mediaType: "audio",
        isOn: isMicOn,
      });
      // }

      // if (isVideoOn){
      // Emit mic status change to other participants
      socket.emit("media_state_change", {
        roomId,
        userId: socket.id,
        mediaType: "video",
        isOn: isVideoOn,
      });
      // }
    }
  };

  useEffect(() => {
    if (!peerConnectionReady) return;
    socket.emit("peer_ready", { roomId: roomId, isReady: true });
  }, [peerConnectionReady]);

  // Local peer connection handshake
  // This runs whenever the local user toggles their own video
  useEffect(() => {
    const stopVideo = () => {
      if (peerConnectionLocalRef.current) {
        const videoSender = peerConnectionLocalRef.current.getSenders().find((sender) => sender.track?.kind === "video");

        if (videoSender) {
          try {
            videoSender.replaceTrack(null); // stop sending video
          } catch (e) {
            console.warn("Failed to replace video track:", e);
          }
        }
      }
    };
    if (isVideoOn) {
      stopVideo();
      handleVideo();
    } else {
      stopVideo();
    }

    return;
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

  useEffect(() => {
    const stopMic = () => {
      let peerConnection = peerConnectionLocalRef.current;
      if (peerConnection) {
        const audioSender = peerConnection.getSenders().find((sender) => sender.track?.kind === "audio");

        if (audioSender) {
          try {
            audioSender.replaceTrack(null); // stop sending audio
          } catch (e) {
            console.warn("Failed to replace audio track:", e);
          }
        }
      }
    };

    if (isMicOn) {
      stopMic();
      startMic();
    } else {
      stopMic();
    }
  }, [isMicOn]);

  // Create peer connection before video/audio is/are enabled
  // Idea is that when video/audio is enabled, simply add tracks to the existing connection.
  useEffect(() => {
    // Do not establish peer connection if no other participants are in the room
    if (!participants.length) {
      return;
    }
    const preparePeerConnection = () => {
      // Make itself the remote peer role
      if (!peerConnectionRemoteRef.current) {
        peerConnectionRemoteRef.current = new RTCPeerConnection(configuration);
        peerConnectionRemoteRef.current.addEventListener("icecandidate", handleIceRemotePeer);
        peerConnectionRemoteRef.current.ontrack = trackHandler;
      }

      // Make itself the local peer role
      if (!peerConnectionLocalRef.current) {
        //  Make itself the local peer role
        peerConnectionLocalRef.current = new RTCPeerConnection(configuration);
        peerConnectionLocalRef.current.ontrack = trackHandler;

        // Wait for WebRTC to retrieve local ICE candidates and send them to other peer
        peerConnectionLocalRef.current.addEventListener("icecandidate", handleIceLocalPeer);

        // This ensures we get a fully established peer connection
        peerConnectionLocalRef.current.addTransceiver("audio", { direction: "sendonly" });
        peerConnectionLocalRef.current.addTransceiver("video", { direction: "sendonly" });

        // Check if connection between peers is established
        peerConnectionLocalRef.current.addEventListener("connectionstatechange", connectionHandler);
      }
      setLocalReady(true);
      socket.emit("peer_connection_prepared", { roomId: roomId, ready: true });
    };

    if (!peerConnectionLocalRef.current && !peerConnectionRemoteRef.current) {
      preparePeerConnection();
    }

    if (localReady && remoteReady) {
      initializePeerConnection();
    }
  }, [participants.length, localReady, remoteReady, hasJoined]);

  useEffect(() => {
    if (!remoteMicEnabled) return;
    socket.emit("peer_ack", { roomId: roomId, audioAck: true });
  }, [remoteMicEnabled]);

  useEffect(() => {
    if (!remoteVidEnabled) return;
    socket.emit("peer_ack", { roomId: roomId, videoAck: true });
  }, [remoteVidEnabled]);

  useEffect(() => {
    if (!socket || !roomId || !userName) return;
    // Listen for answer to offer by the other peer
    socket.on("incoming-answer", (message) => {
      if (message.answer) {
        let remoteDesc = message.answer;
        peerConnectionLocalRef.current.setRemoteDescription(remoteDesc);
      }
    });

    socket.on("update_video", (data) => {
      if (remoteVidRef.current) {
        // Create new MediaStream if needed
        if (!remoteVidRef.current.srcObject) {
          remoteVidRef.current.srcObject = new MediaStream();
        }

        // Clear existing tracks
        remoteVidRef.current.srcObject.getTracks().forEach((track) => {
          remoteVidRef.current.srcObject.removeTrack(track);
        });

        // Add new track
        if (remoteVideoTrackRef.current) {
          remoteVidRef.current.srcObject.addTrack(remoteVideoTrackRef.current);
          remoteVidRef.current.play().catch((err) => console.warn("Video play error:", err));
        }
      }
    });

    socket.on("peer_ack", (data) => {
      // On acknowledgement to audio, add tracks to existing, established peer connection
      if (data.audioAck) {
        startMic();
      }

      // On acknowledgement to video, add tracks to existing, established peer connection
      if (data.videoAck) {
        handleVideo();
      }
    });

    socket.on("peer_connection_prepared", (data) => {
      if (data.ready) setRemoteReady(true);
    });

    socket.on("incoming-offer", handleIncomingOffer);

    const allowMic = async () => {
      let stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      micStream.current = stream;
    };

    const allowVid = async () => {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      vidStream.current = stream;
    };

    // Listen for a new participant excluding itself that joined the room
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
      setParticipants(uniqueParticipants);
    });

    // Listen for participant disconnection
    // Removes the object associated with the participant that has disconnected
    socket.on("participant_left", (data) => {
      resetPeer();
      setParticipants((prevParticipants) => prevParticipants.filter((p) => p.userId !== data.userId));
    });

    // Listen for media state changes from other participants
    socket.on("media_state_update", (data) => {
      // React Strict Mode calls invokes updater function twice
      setParticipants((prevParticipants) => {
        return prevParticipants.map((participant) => {
          if (participant.userId === data.userId) {
            setPeerConnectionReady(true);
            if (data.mediaType === "audio") {
              if (data.isOn) setRemoteMicEnabled(true);
              else setRemoteMicEnabled(false);

              return { ...participant, isMicOn: data.isOn };
            } else if (data.mediaType === "video") {
              if (data.isOn) setRemoteVidEnabled(true);
              else setRemoteVidEnabled(false);

              return { ...participant, isVideoOn: data.isOn };
            }
          }
          return participant;
        });
      });
    });

    // Acknowlegement response to a user who has joined the panel
    socket.on("panel_join_ack", (data) => {
      console.log("panel_join_ack, acknowledgement received: ", data.joinAck);
      if (data.joinAck) {
        setHasRemoteJoined(true);
      }
    });

    // Notification that remote peer has joined the panel
    socket.on("panel_join_notif", (data) => {
      console.log("panel_join_notif, remote peer has joined: ", data.joined);
      console.log("current HasLocalJoined:", hasJoinedRef.current);
      console.log("current HasRemoteJoined: ", hasRemoteJoined);

      // If remote says it has joined and local has already joined, send back acknowledgement
      if (data.joined && hasJoinedRef.current) {
        console.log("setting hasremotejoined to true");
        setHasRemoteJoined(true);
        socket.emit("panel_join_ack", { roomId: roomId, joinAck: true });
      }
    });

    // If user's tab is closed, React cannot guarantee to re-render child components
    // So, let the browser notify the backend about the disconnection and let it notify other users
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
    const handleUnload = () => {
      // resetPeer();
      socket.emit("leave_room", { roomId });
    };
    window.addEventListener("beforeunload", handleUnload);
    socket.emit("room_participant", { roomId, userName });
    allowMic();
    allowVid();

    return () => {
      socket.off("panel_join_notif");
      socket.off("panel_join_ack");
      socket.off("incoming-answer");
      socket.off("peer_connection_prepared");
      socket.off("incoming-offer");
      socket.off("peer_ack");
      socket.off("peer_ready");
      socket.off("participant_joined");
      socket.off("participants_list");
      socket.off("participant_left");
      socket.off("media_state_update");
      socket.off("update_video");
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [socket, roomId, userName]);

  useEffect(() => {
    if (!participants.length) return;
    console.log("INSIDE SPECIAL USEEFFECT: ", hasJoined, hasRemoteJoined);
    // If local user and remote user have not joined, do not enable remote audio
    if (!hasJoined && !hasRemoteJoined) return;

    if (participants.length) {
      // If both users have joined, enable their respective remote audio
      if (hasJoined && hasRemoteJoined) {
        console.log("Remote has joined, local has joined, enabling remote audio");
        playRemoteAudio();
        return;
      }
      // If local user has joined but remote hasn't, notify the remote peer
      else if (hasJoined && !hasRemoteJoined) {
        socket.emit("panel_join_notif", { roomId: roomId, joined: true });
        return;
      }
    }
  }, [hasJoined, hasRemoteJoined, participants.length]);

  // Get the remote user (if any)
  const remoteUser = participants.length > 0 ? participants[0] : null;

  return (
    <div className="flex flex-none flex-col rounded-lg border shadow bg-editor border-neutral-800 overflow-hidden">
      <div className="flex flex-row justify-between items-center bg-neutral-900 border-b border-neutral-800">
        <p className="p-1 px-2 font-semibold text-neutral-600">Participants</p>

        {/* Media Control Buttons */}
        <div className="flex items-center px-1 gap-1">
          {hasJoined && (
            <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleMic}>
              {isMicOn ? <Mic className="p-1 text-neutral-600" /> : <MicOff className="p-1 text-red-500" />}
            </button>
          )}
          {hasJoined && (
            <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleVideo}>
              {isVideoOn ? <Video className="p-1 text-neutral-600" /> : <VideoOff className="p-1 text-red-500" />}
            </button>
          )}
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleOpen}>
            <ChevronDown className={`p-1 text-neutral-600 transition-transform duration-200 ${isOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Participants Camera */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-800 text-neutral-600 transition-opacity duration-300 ${isOpen ? "" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}>
          {/* Audio Elements for local and remote audio */}
          <audio ref={audioRef} className="hidden" />

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
            <div className="absolute bottom-2 left-2 text-neutral-500 font-medium bg-black/50 shadow px-2 py-1 rounded-md text-sm flex items-center gap-1 select-none z-40">
              <span>{userName || "You"}</span>
              {!isMicOn && <MicOff className="size-3 ml-1 text-red-500" />}
            </div>
            <span className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-neutral-950 to-transparent z-30 rounded-b-l" />
          </div>

          {/* Remote User */}
          <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center">
            {remoteUser ? (
              remoteUser.isVideoOn ? (
                <video id={`video-${remoteUser.userId}`} ref={remoteVidRef} autoPlay muted playsInline className="w-full h-full object-cover" />
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
              <div className="absolute bottom-2 left-2 text-neutral-500 font-medium bg-black/50 shadow px-2 py-1 rounded-md text-sm flex items-center gap-1 select-none z-40">
                <span>{remoteUser.userName || "Guest"}</span>
                {!remoteUser.isMicOn && <MicOff className="size-3 ml-1 text-red-500" />}
              </div>
            )}
            <span className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-neutral-950 to-transparent z-30" />
          </div>
          {!hasJoined && isOpen && (
            <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-md flex items-center justify-center rounded-b outline-1 outline-neutral-800 -mb-0.5 z-50">
              <button onClick={handleJoin} className="px-4 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium hover:bg-editor transition">
                Join Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
