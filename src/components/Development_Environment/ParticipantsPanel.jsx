import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, ChevronDown } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen }) {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const videoStreamRef = useRef(null);
  const audioStreamRef = useRef(null);

  const toggleMic = () => setIsMicOn((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);

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

  return (
    <div className="flex flex-none flex-col rounded-lg border shadow bg-editor border-neutral-800 overflow-hidden">
      <div className="flex flex-row justify-between items-center bg-neutral-900">
        <p className="p-1 px-2 font-semibold text-neutral-600">Participants</p>

        {/* Participants Button */}
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
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-800 text-neutral-600 border-t border-neutral-800">
          {/* Local User */}
          <div className="relative aspect-video bg-neutral-950 flex flex-col items-center justify-center">
            {isVideoOn ? <video ref={videoRef} autoPlay className="w-full h-full object-cover" /> : <p className="text-lg font-semibold select-none">Local User</p>}
            {isMicOn && <audio ref={audioRef} autoPlay className="hidden" />}
          </div>

          {/* Remote User */}
          <div className="relative aspect-video bg-neutral-950 flex items-center justify-center">
            <p className="text-lg font-semibold select-none">Remote User</p>
          </div>
        </div>
      )}
    </div>
  );
}
