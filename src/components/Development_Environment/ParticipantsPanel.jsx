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
  const remoteVideoTrackRef = useRef(null);

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
    console.log("preparing to send ICE candidates as " + currentUserRole);
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
          console.log(newVideoTrack);
          await sender.replaceTrack(newVideoTrack);
          console.log(videoRef.current);
          console.log("✅ Replaced video track via transceiver sender");
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
    console.log("received incoming candidates in frontend");
    console.log(message.candidates);
    if (message.candidates) {
      const role = message.currentUserRole;

      if (role == "localPeer" && peerConnectionRemoteRef.current) {
        console.log("adding ice candidates as role Remote Peer");
        await peerConnectionRemoteRef.current.addIceCandidate(message.candidates);
      } else if (role == "remotePeer" && peerConnectionLocalRef.current) {
        console.log("adding ice candidates as role Local Peer");
        await peerConnectionLocalRef.current.addIceCandidate(message.candidates);
      }
    }
  };

  // Keeps track of remote streams
  const trackHandler = async (event) => {
    console.log("📡 ontrack fired!", event.track.kind, event.track.id);
    let remoteStream = event.streams[0];
    if (!remoteStream) {
      remoteStream = new MediaStream();
    }

    if (event.track.kind === "audio") {
      remoteStream.addTrack(event.track);
      audioRef.current.srcObject = remoteStream;

      // Force play with fallback
      audioRef.current.play().catch((err) => {
        console.warn("Audio play blocked by browser:", err);
      });
      console.log(audioRef.current);
      console.log("AUDIO PLAYED BY RECEIVER");
    } else if (event.track.kind === "video") {
      remoteVideoTrackRef.current = event.track;
    }
  };

  const startMic = async () => {
    try {
      console.log(peersConnectedRef.current);
      if (!peersConnectedRef.current) {
        console.log("❌ Peer connection is not yet established");
        return;
      }

      if (peerConnectionLocalRef.current) {
        let audioTransceiver = peerConnectionLocalRef.current.getTransceivers().find((t) => t.sender && t.receiver.track?.kind === "audio");
        let sender = audioTransceiver.sender;
        console.log(peerConnectionLocalRef.current.getTransceivers());
        console.log(audioTransceiver);

        if (sender) {
          const newAudioTrack = micStream.current.getAudioTracks()[0];
          // Replace the track if needed
          if (sender.track !== newAudioTrack) {
            await sender.replaceTrack(newAudioTrack);
            console.log("✅ Replaced audio track via transceiver sender");
            console.log(audioTransceiver);
          }
        } else {
          console.warn("⚠️ No available audio transceiver/sender found");
        }

        // if (
        //   peerConnectionLocalRef.current &&
        //   peerConnectionLocalRef.current.connectionState === "connected" &&
        //   peerConnectionLocalRef.current.iceConnectionState === "connected" &&
        //   peerConnectionLocalRef.current.signalingState === "stable" &&
        //   peerConnectionReady.current
        // ) {
        //   console.log("✅ Fully connected. Preparing renegotiation...");
        // const offer = await peerConnectionLocalRef.current.createOffer();
        // await peerConnectionLocalRef.current.setLocalDescription(offer);
        // socket.emit("signal", { offer, roomId });
        // } else {
        //   console.warn("⛔ Cannot renegotiate. State snapshot:", {
        //     connectionState: peerConnectionLocalRef.current?.connectionState,
        //     iceConnectionState: peerConnectionLocalRef.current?.iceConnectionState,
        //     signalingState: peerConnectionLocalRef.current?.signalingState,
        //   });
        // }
      }
    } catch (error) {
      console.error("Error in startMic:", error);
    }
  };

  const initializePeerConnection = () => {
    if (peerConnectionLocalRef.current) {
      console.log("PEER CONNECTION GETTING INITIALIZED...");
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
    console.log("offer received in frontend");
    console.log(message);
    console.log(message.offer);
    if (message.offer) {
      await peerConnectionRemoteRef.current.setRemoteDescription(message.offer);

      // Create an answer
      const answer = await peerConnectionRemoteRef.current.createAnswer();
      console.log("answer = ", answer);

      // // Set the local description (answer)
      await peerConnectionRemoteRef.current.setLocalDescription(answer);

      // // Emit the answer to the signaling server
      socket.emit("signal", { answer, roomId });
    }
  };

  // Resets peer connection
  const resetPeer = () => {
    console.log("RESET PEER IS INVOKEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
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
      peersConnectedRef.current = true;
      console.log(peersConnectedRef.current);

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
      console.log("video is on");

      stopVideo();
      handleVideo();
    } else {
      console.log("video is off");
      stopVideo();
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

  useEffect(() => {
    console.log("INSIDE AUDIO USEEFFECT, MIC sttus: " + isMicOn);
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

  useEffect(() => {
    console.log(remoteVidRef.current);
    console.log(videoRef.current);
  }, [participants]);
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
        // peerConnectionRemoteRef.current.addTransceiver("video", { direction: "recvonly" });
        // peerConnectionRemoteRef.current.addTransceiver("audio", { direction: "recvonly" });

        peerConnectionRemoteRef.current.addEventListener("connectionstatechange", () => {
          console.log("For Local : ", peerConnectionLocalRef.current);
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
      console.log("Local Ready: ", localReady);
      console.log("Remote Ready: ", remoteReady);
      initializePeerConnection();
    }
  }, [participants.length, localReady, remoteReady]);

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

    // socket.on("peer_ready", (data) => {
    //   console.log("PEER IS READY: ", data.isReady)
    //   // If peer connection is not established, create it
    //   if (!peerConnectionLocalRef.current && !peerConnectionRemoteRef.current){
    //     initializePeerConnection();
    //   }

    //   // Add tracks

    // })

    // socket.on("reset_peer", (data) => {
    //   console.log(peerConnectionLocalRef.current, peerConnectionRemoteRef.current)
    //   console.log("RECEIVED REQUEST TO RESET PEERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR")
    //   resetPeer();
    //   console.log(peerConnectionLocalRef.current, peerConnectionRemoteRef.current)
    // })

    // Listen for answer to offer by the other peer
    socket.on("incoming-answer", (message) => {
      console.log("incoming answer received in frontend");
      console.log(message.answer);
      if (message.answer) {
        let remoteDesc = message.answer;
        peerConnectionLocalRef.current.setRemoteDescription(remoteDesc).then(() => {
          console.log("answer received IN FRONTEND");
        });
      }

      console.log(peerConnectionLocalRef.current.iceConnectionState);
      console.log(peerConnectionLocalRef.current.connectionState);
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
        console.log(remoteVidRef.current);
        handleVideo();
      }
    });

    socket.on("peer_connection_prepared", (data) => {
      console.log("IS REMOTE PEER READY? " + data.ready);
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

      resetPeer();
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

    // If user's tab is closed, React cannot guarantee to re-render child components
    // So, let the browser notify the backend about the disconnection and let it notify other users
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
    const handleUnload = () => {
      resetPeer();
      socket.emit("reset_peer", { roomId });
      socket.emit("leave_room", { roomId });
    };
    window.addEventListener("beforeunload", handleUnload);
    socket.emit("room_participant", { roomId, userName });
    allowMic();
    allowVid();

    return () => {
      socket.off("reset_peer");
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
  }, [userName, socket, roomId]);

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
            <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur flex items-center justify-center rounded-b outline-1 outline-neutral-800 -mb-0.5 z-50">
              <button onClick={() => setHasJoined(true)} className="px-4 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium hover:bg-editor transition">
                Join Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
