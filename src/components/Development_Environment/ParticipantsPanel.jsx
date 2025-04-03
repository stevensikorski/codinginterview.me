import React from "react";
import { MicOff, VideoOff, ChevronDown } from "lucide-react";

export default function ParticipantsPanel({ isOpen, toggleOpen }) {
  return (
    <div className="flex flex-none flex-col rounded-lg border shadow bg-editor border-neutral-800 overflow-hidden">
      <div className="flex flex-row justify-between items-center bg-neutral-900">
        <p className="p-1 px-2 font-semibold text-neutral-600">Participants</p>

        {/* Participants Button */}
        <div className="flex items-center px-1 gap-1">
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" disabled>
            <MicOff className="p-1 text-neutral-600" />
          </button>
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" disabled>
            <VideoOff className="p-1 text-neutral-600" />
          </button>
          <button className="my-1 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={toggleOpen}>
            <ChevronDown className={`p-1 text-neutral-600 transition-transform duration-200 ${isOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>
      </div>

      {/* Participants Camera */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-neutral-800 text-neutral-600 border-t border-neutral-800">
          <div className="relative aspect-video bg-neutral-950 flex items-center justify-center">
            <p className="text-lg font-semibold select-none">Steven</p>
          </div>
          <div className="relative aspect-video bg-neutral-950 flex items-center justify-center">
            <p className="text-lg font-semibold select-none">Narinder</p>
          </div>
        </div>
      )}
    </div>
  );
}
