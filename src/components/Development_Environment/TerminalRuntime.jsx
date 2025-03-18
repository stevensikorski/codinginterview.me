import React from "react";

export default function TerminalRuntime() {
  return (
    <div className="flex flex-col flex-grow rounded-b-xl bg-neutral-950">
      <div className="flex px-2 border-b text-neutral-700 border-neutral-800">
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 1</button>
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 2</button>
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 3</button>
      </div>

      <div className="px-2">
        <p className="p-1 text-xs font-semibold text-neutral-300 font-mono">system@codinginterview.me ~ % </p>
      </div>
    </div>
  );
}
