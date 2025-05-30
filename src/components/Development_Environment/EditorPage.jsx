import React, { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import NoteEditor from "./NoteEditor";
import TerminalRuntime from "./TerminalRuntime";
import ParticipantsPanel from "./ParticipantsPanel";
import { AlignJustify, Columns2, ClipboardCheck, Settings } from "lucide-react";
import ProblemSelection from "./ProblemSelection";
import ProblemPanel from "./ProblemPanel";
import { getUser } from "../utilities/auth_context";
import TestPanel from "./TestPanel";

export default function DevelopmentEnvironmentPage({ roomId, socket, socketState }) {
  const [activeTab, setActiveTab] = useState("editor");
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isResizing, setIsResizing] = useState(false);
  const [codeOutput, setCodeOutput] = useState("");
  const [showProblemSelection, setShowProblemSelection] = useState(false);
  //state for selected problem
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [userName, setUserName] = useState("");

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);

  const handleResizing = (e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    const clampedWidth = Math.max(0, Math.min(newWidth, 100));
    setLeftWidth(clampedWidth);
  };

  //handler for problem selection
  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setShowProblemSelection(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("mousemove", handleResizing);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.userSelect = "";
    };
  });

  useEffect(() => {
    async function fetchUser() {
      const user = await getUser();
      if (user) {
        setUserName(user.displayName);
      }
    }
    fetchUser();
  }, []);

  return (
    <main className="flex h-screen w-screen bg-neutral-900 overflow-hidden whitespace-nowrap">
      {/*sidebar*/}
      <nav className="w-16 text-neutral-300 p-2 gap-2 flex flex-col shrink-0 bg-neutral-900">
        <a href="/" className="flex justify-center items-center aspect-square text-neutral-600 rounded-lg border shadow border-neutral-800 hover:bg-editor transition duration-200" onClick={() => setShowProblemSelection(false)}>
          <img src="/favicon.webp" alt="logo" className="size-8 object-contain grayscale opacity-50" />
        </a>
        <button className="flex justify-center items-center aspect-square text-neutral-600 rounded-lg border shadow border-neutral-800 hover:bg-editor transition duration-200" onClick={() => setShowProblemSelection(false)}>
          <Columns2 />
        </button>
        <button className="flex justify-center items-center aspect-square text-neutral-600 rounded-lg border shadow border-neutral-800 hover:bg-editor transition duration-200" onClick={() => setShowProblemSelection(true)}>
          <AlignJustify />
        </button>
        {/* <button className="flex justify-center items-center aspect-square text-neutral-600 rounded-lg border shadow border-neutral-800 hover:bg-editor transition duration-200">
          <ClipboardCheck />
        </button>
        <button className="flex justify-center items-center aspect-square text-neutral-600 rounded-lg border shadow border-neutral-800 hover:bg-editor transition duration-200">
          <Settings />
        </button> */}
      </nav>

      {/*workspace container*/}
      <div className="relative flex flex-row flex-1 overflow-hidden">
        {/*left section*/}
        <section className="flex flex-col justify-between my-2 gap-2 shrink-0 min-w-[500px] max-w-[65%]" style={{ width: `${leftWidth}%` }}>
          {/*pass selected problem to problem panel*/}
          <ProblemPanel selectedProblem={selectedProblem} setSelectedProblem={setSelectedProblem} roomId={roomId} socket={socket} />

          {/*participants*/}
          <ParticipantsPanel isOpen={isParticipantsOpen} toggleOpen={() => setIsParticipantsOpen((prev) => !prev)} userName={userName} socket={socket} socketState={socketState} roomId={roomId} />
        </section>

        {/*resizing*/}
        <div className="w-2 flex justify-center items-center cursor-col-resize my-2 shrink-0" onMouseDown={startResizing}>
          <div className="w-0.5 h-[5%] rounded bg-neutral-800" />
        </div>

        {/*right section*/}
        <section className="flex flex-col flex-grow my-2 mr-2 rounded-lg border shadow bg-editor border-neutral-800 min-w-[500px] overflow-hidden">
          <div className="flex flex-row px-1 gap-1 items-center border-b bg-neutral-900 border-neutral-800">
            <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={() => setActiveTab("editor")}>
              Editor
            </button>
            <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={() => setActiveTab("notepad")}>
              Notepad
            </button>
            <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={() => setActiveTab("terminal")}>
              Terminal
            </button>
            {/* <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200" onClick={() => setActiveTab("tests")}>
              Testing
            </button> */}
          </div>

          <div className="flex flex-col flex-grow">
            <div className={activeTab === "editor" ? "flex-grow flex" : "hidden"}>
              <CodeEditor setActiveTab={setActiveTab} setCodeOutput={setCodeOutput} roomId={roomId} socket={socket} selectedProblem={selectedProblem} />
            </div>
            <div className={activeTab === "notepad" ? "flex-grow flex" : "hidden"}>
              <NoteEditor roomId={roomId} socket={socket} />
            </div>
            <div className={activeTab === "terminal" ? "flex-grow flex" : "hidden"}>
              <TerminalRuntime output={codeOutput} roomId={roomId} socket={socket} />
            </div>
            <div className={activeTab === "tests" ? "flex-grow flex" : "hidden"}>
              <TestPanel />
            </div>
          </div>
        </section>

        {/*problem selection overlay - pass new props*/}
        <div
          className={`
            absolute top-0 left-0 w-full h-full bg-neutral-900 transition-transform duration-300
            ${showProblemSelection ? "translate-x-0" : "translate-x-full"}
            z-50
          `}
          style={{
            pointerEvents: showProblemSelection ? "auto" : "none",
          }}>
          <ProblemSelection isClose={showProblemSelection} onClose={() => setShowProblemSelection(false)} onSelectProblem={handleSelectProblem} roomId={roomId} />
        </div>
      </div>
    </main>
  );
}
