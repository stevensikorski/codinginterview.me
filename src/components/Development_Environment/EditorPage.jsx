import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
import NoteEditor from "./NoteEditor";
import TerminalRuntime from "./TerminalRuntime";
import ParticipantsPanel from "./ParticipantsPanel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DevelopmentEnvironmentPage() {
  const [activeTab, setActiveTab] = useState("editor");
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(35);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);
  const handleResizing = (e) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    const clampedWidth = Math.max(0, Math.min(newWidth, 100));
    setLeftWidth(clampedWidth);
  };

  React.useEffect(() => {
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

  const markdownContent = `# Header
  ## Text
  ### Text
  Text`;

  return (
    <main className="flex flex-row h-screen w-screen bg-neutral-900 overflow-hidden whitespace-nowrap">
      {/* Sidebar */}
      <nav className="w-16 text-neutral-300 p-4 gap-4 flex flex-col shrink-0">
        <p className="text-center">Nav</p>
        <p className="text-center">Bar</p>
      </nav>

      {/* Left Section */}
      <section className="flex flex-col my-2 gap-2 shrink-0 min-w-[400px] max-w-[65%]" style={{ width: `${leftWidth}%` }}>
        {/* Problem */}
        <div className="flex flex-col flex-grow rounded-lg border shadow bg-editor border-neutral-800 shadow-neutral-950/75 overflow-hidden">
          <div className="flex flex-row px-1 gap-1 border-b bg-neutral-900 border-neutral-800">
            <p className="p-1 font-semibold text-neutral-600">Problem</p>
          </div>

          <div className="px-4 text-neutral-300 markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
          </div>
        </div>

        {/* Participants */}
        <ParticipantsPanel isOpen={isParticipantsOpen} toggleOpen={() => setIsParticipantsOpen((prev) => !prev)} />
      </section>

      {/* Resizing */}
      <div className="w-2 flex justify-center items-center cursor-col-resize my-2 shrink-0" onMouseDown={startResizing}>
        <div className="w-0.5 h-[5%] rounded bg-neutral-800" />
      </div>

      {/* Right Section */}
      <section className="flex flex-col flex-grow my-2 mr-2 rounded-lg border shadow bg-editor border-neutral-800 shadow-neutral-950/75 min-w-[500px] overflow-hidden">
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
        </div>

        <div className="flex flex-col flex-grow">
          <div className={activeTab === "editor" ? "flex-grow flex" : "hidden"}>
            <CodeEditor setActiveTab={setActiveTab} />
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
