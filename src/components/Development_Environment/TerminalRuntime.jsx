import React from "react";

export default function TerminalRuntime() {
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

      <div className="px-2">
        <p className="p-1 text-xs font-semibold text-neutral-300 font-mono">system@codinginterview.me ~ % </p>
      </div>
    </div>
  );
}
