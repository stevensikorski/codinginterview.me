import React, { useEffect, useRef, useState } from "react";

export default function TerminalRuntime({ output }) {
  const terminalRef = useRef(null);
  const [terminalLog, setTerminalLog] = useState([]);
  const lastOutputRef = useRef(null);

  useEffect(() => {
    if (output !== undefined && output.trim() !== "" && output !== lastOutputRef.current) {
      setTerminalLog((prevLog) => {
        const newLog = [...prevLog];
        output.split("\n").forEach((line) => {
          newLog.push(line);
        });
        return newLog;
      });
      lastOutputRef.current = output;
    }
  }, [output]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLog]);

  return (
    <div className="flex flex-col flex-grow rounded-b-xl bg-neutral-950">
      {/* Header */}
      <div className="flex w-full flex-wrap justify-between items-center border-b border-neutral-800 overflow-hidden">
        {/* Left Buttons */}
        <div className="flex flex-wrap px-1 gap-1 max-w-full">
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 1</button>
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 2</button>
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 3</button>
        </div>

        {/* Right Buttons */}
        <div className="flex flex-wrap px-1 gap-1 justify-end max-w-full">
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 1</button>
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 2</button>
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Option 3</button>
        </div>
      </div>

      {/* Shell */}
      <div ref={terminalRef} className="px-2 py-2 font-mono text-xs text-neutral-300 whitespace-pre-wrap overflow-y-auto h-full">
        {terminalLog.map((line, index) => (
          <p key={index} className="select-none">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
