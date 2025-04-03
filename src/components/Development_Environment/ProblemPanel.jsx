import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ProblemPanel() {
  // temporary placeholder for the problem section
  const markdownContent = `Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.

Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
  `;

  return (
    <div className="flex flex-col flex-grow rounded-lg border shadow bg-editor border-neutral-800 overflow-y-hidden">
      <div className="flex flex-row px-1 gap-1 border-b bg-neutral-900 border-neutral-800">
        <p className="p-1 font-semibold text-neutral-600">Problem</p>
      </div>

      {/* Problem Header Section */}
      <div className="flex flex-col gap-2 p-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white">Problem Name Placeholder</h1>
        <div className="flex flex-wrap gap-1">
          {/* <p className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-green-700 border-green-700/25 bg-green-700/25">Easy</p> */}
          <p className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-yellow-500 border-yellow-500/25 bg-yellow-700/25">Medium</p>
          {/* <p className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-red-700 border-red-700/25 bg-red-700/25">Hard</p> */}
          <p className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-neutral-600 border-neutral-800">Label</p>
          <p className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-neutral-600 border-neutral-800">Label</p>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 overflow-y-scroll p-4 break-words text-wrap markdown [&::-webkit-scrollbar]:w-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
          <p className="pt-4 opacity-25">codinginterview.me</p>
        </div>
        <span className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-editor to-transparent z-50" />
      </div>
    </div>
  );
}
