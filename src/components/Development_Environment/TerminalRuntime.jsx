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
