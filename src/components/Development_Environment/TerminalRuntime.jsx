import React, { useEffect, useRef, useState } from "react";

export default function TerminalRuntime({ output, roomId, socket }) {
  const terminalRef = useRef(null);
  const [terminalLog, setTerminalLog] = useState([]);
  const lastOutputRef = useRef(null);

  // Synchronize terminal output
  const pushTerminalOutput = (newOutput) => {
    // Ensure newOutput is a non-null string before synchronizing
    if (socket && roomId && newOutput && typeof newOutput === "string") {
      socket.emit("synchronize_terminal", {
        roomId,
        terminalOutput: newOutput.toString(),
      });
    }
  };

  // Handle local output changes
  useEffect(() => {
    // Add additional checks to ensure output is a valid string
    if (output !== undefined && output !== null && output.toString().trim() !== "" && output !== lastOutputRef.current) {
      setTerminalLog((prevLog) => {
        const newLog = [...prevLog];
        output
          .toString()
          .split("\n")
          .forEach((line) => {
            newLog.push(line);
          });
        return newLog;
      });

      // Push output to other users
      pushTerminalOutput(output);

      lastOutputRef.current = output;
    }
  }, [output, socket, roomId]);

  // Listen for synchronized terminal output from other users
  useEffect(() => {
    if (!socket) return;

    const handleSynchronizedTerminal = (terminalOutput) => {
      // Add robust checks for terminalOutput
      if (terminalOutput !== undefined && terminalOutput !== null && typeof terminalOutput === "string" && terminalOutput.trim() !== "" && terminalOutput !== lastOutputRef.current) {
        setTerminalLog((prevLog) => {
          const newLog = [...prevLog];
          terminalOutput.split("\n").forEach((line) => {
            newLog.push(line);
          });
          return newLog;
        });
        lastOutputRef.current = terminalOutput;
      }
    };

    // Add socket listener
    socket.on("synchronize_terminal", handleSynchronizedTerminal);

    // Cleanup listener
    return () => {
      socket.off("synchronize_terminal", handleSynchronizedTerminal);
    };
  }, [socket, roomId]);

  // Scroll to bottom when terminal log changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLog]);

  return (
    <div className="flex flex-col flex-grow rounded-b-lg bg-neutral-950">
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
