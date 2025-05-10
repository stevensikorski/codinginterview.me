import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown, User } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen, userName, socket, roomId }) {
  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const lastVideoStateRef = useRef(false); // store the last known state

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const remoteVidRef = useRef(null);
  const audioStreamRef = useRef(null);

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

    lastVideoStateRef.current = isVideoOn;
    // Emit video status change to other participants
    // socket.emit("media_state_change", {
    //   roomId,
    //   userId: socket.id,
    //   mediaType: "video",
    //   isOn: newVideoState
    // });
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
    const remoteStream = event.streams[0];
    if (!remoteStream) {
      console.error("No stream in track event!");
      return;
    }

    remoteVidRef.current.srcObject = remoteStream;
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
  // Procedures of the local peer to initialize a peer connection with remote peer
  const localPeerAction = () => {
    // Add local media tracks (video in this case)
    videoRef.current.srcObject.getTracks().forEach((track) => {
      console.log("track: ");
      console.log(track);
      peerConnectionLocalRef.current.addTrack(track, videoRef.current.srcObject);
    });

    // Wait for WebRTC to retrieve local ICE candidates and send them to other peer
    peerConnectionLocalRef.current.addEventListener("icecandidate", handleIceLocalPeer);

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
    });

    // Create an offer and send it to the other peer
    peerConnectionLocalRef.current.createOffer().then((offer) => {
      peerConnectionLocalRef.current.setLocalDescription(offer).then(() => {
        socket.emit("signal", { offer, roomId });
      });
    });

    // Check if connection between peers is established
    peerConnectionLocalRef.current.addEventListener("connectionstatechange", connectionHandler);
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
              console.log(data);
              // If enabled, current participant will serve as the 'remote peer' and get ready for peer connection
              if (data.isOn) {
                if (!peerConnectionRemoteRef.current) {
                  peerConnectionRemoteRef.current = new RTCPeerConnection(configuration);
                  socket.emit("peer_ready", { ready: true, roomId: roomId });
                }
              }
              // If disabled, reset peer connection
              else {
                if (peerConnectionRemoteRef.current) {
                  resetPeer("remote");
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

  // Remote peer connection handshake
  // This runs when peerConnectionRemoteRef changes (based on media state change of the other peer)
  useEffect(() => {
    if (!peerConnectionRemoteRef.current || !socket) return;
    peerConnectionRemoteRef.current.addEventListener("icecandidate", handleIceRemotePeer);
    peerConnectionRemoteRef.current.ontrack = trackHandler;

    // Remote peers listens for offer from other peer
    const handleIncomingOffer = (message) => {
      console.log("offer received in frontend");
      console.log(message);
      console.log(message.offer);
      if (message.offer) {
        console.log("Received an offer: ", 2);

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

    // Remote Peer Reference
    const remotePeerAction = () => {
      // Upon receiving offer, send back an answer to calling party
      console.log("offer received, giving answer back to sender");
      socket.on("incoming-offer", handleIncomingOffer);
    };
    remotePeerAction();

    return () => {
      socket.off("incoming-offer");
    };
  }, [peerConnectionRemoteRef.current, socket]);

  // Local peer connection handshake
  // This runs whenever the local user toggles their own video
  useEffect(() => {
    console.log("NONEMPTY USEEFFECT");
    if (!socket) return;
    if (isVideoOn) {
      console.log("video is on");
      let shallowRef = videoRef.current;

      // Enable local video if it is not enabled.
      // If local video is already enabled, do nothing.
      const handleVideo = async () => {
        console.log(videoRef.current, videoRef.current?.srcObject);

        if (videoRef.current && !videoRef.current.srcObject) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            if (shallowRef && Object.is(shallowRef, videoRef.current)) {
              videoRef.current.srcObject = stream;
              console.log("Video stream attached successfully.");
            }
          } catch (error) {
            console.error("Error accessing camera:", error);
          }
        }
      };

      // Prepares the local peer connection object by intializing it
      const preparePeerConnection = async () => {
        // If there are other participants, prepare the peer connection if not yet exist
        if (participants.length > 0 && !peerConnectionLocalRef.current) {
          console.log("Discovered new participant, initializing peer connection...");
          peerConnectionLocalRef.current = new RTCPeerConnection(configuration);
          peerConnectionLocalRef.current.ontrack = trackHandler;

          // Local peer needs sees if remote peer is ready
          socket.on("peer_ready", (message) => {
            // If remote peer is also ready, the local peer will begin the handshake process
            // to establish the peer connection
            console.log("PEER MESSAGE RECEIVED, STATUS: ", message);
            if (message.ready) {
              console.log("invoked local peer action");
              localPeerAction();
            }
          });

          // Let other participant know current participant's status so they
          // can prepare a remote peer connection
          socket.emit("media_state_change", {
            roomId,
            userId: socket.id,
            mediaType: "video",
            isOn: isVideoOn,
            userName,
            loc: 0,
          });

          // Current issue (observation): Peer connection is not properly terminated on local side
          // if peer connection was already established.
          // Reproduce: One user joins room, open video, another user joins. This creates peer connection.
          // Second user then closes tab, opens the tab again, and then the peer connection is not reset again.
        }
      };

      // Enables local camera and then conditionally establish the peer connection
      const initializeCall = async () => {
        // First, ensure local video is enabled
        await handleVideo();

        // Now, prepare the peer connection (if not already prepared)
        await preparePeerConnection();
      };
      initializeCall();
    } else {
      console.log("video is off");

      // If last video state is on, then emit the change
      if (lastVideoStateRef.current) {
        console.log("LAST VIDEO STATE IS ONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN");
        socket.emit("media_state_change", {
          roomId,
          userId: socket.id,
          mediaType: "video",
          isOn: isVideoOn,
          userName,
          loc: 1,
        });
      }

      //video stream cleanup
      if (videoRef.current) {
        videoRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        videoRef.current.srcObject = null;
        console.log("local video tracks terminated");
      }

      // Terminate local peer-to-peer connection if it had one
      if (peerConnectionLocalRef.current) {
        console.log("local peer connection terminated");
        peerConnectionLocalRef.current.close();
        peerConnectionLocalRef.current = null;
      }
    }

    return () => {
      console.log("NONEMPTY USEEFFECT CLEANUP");
      resetPeer("local");
      socket.off("incoming-answer");
      socket.off("peer_ready");
    };
  }, [isVideoOn, participants.length, socket]);

  // Both peers' sockets can call this
  useEffect(() => {
    if (!socket) return;
    // Listen for incoming ICE candidates and add them to the peer connection
    socket.on("incoming-candidates", handleIncomingCandidates);

    return () => {
      socket.off("incoming-candidates");
    };
  }, [socket]);

  // Local audio stream, using audioStreamRef
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
      //check audioStreamRef instead of audioRef for getTracks()
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
