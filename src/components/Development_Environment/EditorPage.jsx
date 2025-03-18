import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
import NoteEditor from "./NoteEditor";
import TerminalRuntime from "./TerminalRuntime";
import { MicOff, VideoOff, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DevelopmentEnvironmentPage() {
  const [activeTab, setActiveTab] = useState("editor");
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const markdownContent = `# Test
  ## Test2
  ### Test4`;

  return (
    <main className="flex flex-row h-screen w-screen bg-neutral-900">
      {/* Sidebar */}
      <div className="w-16 text-neutral-300 p-4 gap-4 flex flex-col">
        <p className="text-center">Nav</p>
        <p className="text-center">Bar</p>
      </div>

      {/* Left Section */}
      <section className="flex flex-col w-[35%] my-2 gap-2">
        {/* Problem */}
        <div className="flex flex-col flex-grow rounded-xl border bg-[#1E1E1E] border-neutral-800 overflow-hidden">
          <div className="flex flex-row px-2 gap-2 border-b bg-neutral-900 border-neutral-800">
            <p className="p-1 font-semibold text-neutral-500">Problem</p>
          </div>

          <div className="px-4 text-neutral-300 markdown">
            <ReactMarkdown remarkPlugins={remarkGfm}>{markdownContent}</ReactMarkdown>
          </div>
        </div>

        {/* Participants */}
        <div className="rounded-xl border bg-[#1E1E1E] border-neutral-800 overflow-hidden">
          <div className="flex flex-row justify-between items-center px-2 gap-2 bg-neutral-900">
            <p className="p-1 font-semibold text-neutral-500">Participants</p>
            <div className="flex items-center gap-2">
              <button className="p-1 transition duration-200" disabled>
                <MicOff className={`size-6 p-0.5 text-neutral-800 transition duration-200 `} />
              </button>
              <button className="p-1 transition duration-200" disabled>
                <VideoOff className={`size-6 p-0.5 text-neutral-800 transition duration-200 `} />
              </button>
              <button className="p-1" onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}>
                <ChevronDown className={`size-6 p-0.5 text-neutral-500 transition-transform duration-200 ${isParticipantsOpen ? "rotate-0" : "rotate-180 text-neutral-800"}`} />
              </button>
            </div>
          </div>

          {isParticipantsOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 text-neutral-300 border-t border-neutral-800">
              <div className="relative aspect-video bg-neutral-950 flex items-center justify-center">
                <span className="text-lg font-semibold">Steven</span>
              </div>
              <div className="relative aspect-video bg-neutral-950 flex items-center justify-center">
                <span className="text-lg font-semibold">Narinder</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Resizing */}
      <div className="w-[10px] flex justify-center items-center my-5 cursor-col-resize">
        <div className="w-[1px] h-[5%] bg-neutral-800"></div>
      </div>

      {/* Right Section */}
      <section className="flex flex-col flex-grow my-2 mr-2 rounded-xl border bg-[#1E1E1E] border-neutral-800 overflow-hidden">
        <div className="flex flex-row px-2 gap-2 items-center border-b bg-neutral-900 border-neutral-800">
          <button className={`p-1 font-semibold hover:text-neutral-500 transition duration-200 ${activeTab === "editor" ? "text-neutral-500" : "text-neutral-800"}`} onClick={() => setActiveTab("editor")}>
            Editor
          </button>
          <button className={`p-1 font-semibold hover:text-neutral-500 transition duration-200 ${activeTab === "notepad" ? "text-neutral-500" : "text-neutral-800"}`} onClick={() => setActiveTab("notepad")}>
            Notepad
          </button>
          <button className={`p-1 font-semibold hover:text-neutral-500 transition duration-200 ${activeTab === "terminal" ? "text-neutral-500" : "text-neutral-800"}`} onClick={() => setActiveTab("terminal")}>
            Terminal
          </button>
        </div>

        <div className="flex flex-col flex-grow">
          <div className={activeTab === "editor" ? "flex-grow flex" : "hidden"}>
            <CodeEditor />
          </div>
          <div className={activeTab === "notepad" ? "flex-grow flex" : "hidden"}>
            <NoteEditor />
          </div>
          <div className={activeTab === "terminal" ? "flex-grow flex" : "hidden"}>
            <TerminalRuntime />
          </div>
        </div>
      </section>
    </main>
  );
}
