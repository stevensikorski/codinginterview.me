import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
  return (
    <div className="h-screen w-screen">
      <Editor
        height="100vh"
        defaultLanguage="python"
        defaultValue="# Write code here..."
        theme="vs-dark"
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  );
}
