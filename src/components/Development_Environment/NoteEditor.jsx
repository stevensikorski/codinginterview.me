import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function MarkdownEditor() {
  const [position, setPosition] = useState({ line: 1, column: 1 });

  const handleEditorMount = (editor) => {
    editor.onDidChangeCursorPosition((event) => {
      setPosition({ line: event.position.lineNumber, column: event.position.column });
    });
  };

  return (
    <div className="flex flex-col flex-grow rounded-b-xl">
      {/* Header */}
      <div className="flex px-2 border-b text-neutral-700 border-neutral-800">
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 1</button>
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 2</button>
        <button className="p-1 text-sm font-semibold hover:text-neutral-600 transition duration-200">Option 3</button>
      </div>

      {/* Editor */}
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme="vs-dark"
        loading={""}
        onMount={handleEditorMount}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          padding: { top: 10, bottom: 10, left: 10, right: 10 },
          scrollbar: { useShadows: false, vertical: "auto", horizontal: "auto" },
          stickyScroll: { enabled: false },
          insertSpaces: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "none",
          overviewRulerBorder: false,
          folding: false,
          guides: { indentation: false },
          suggest: { snippetsPreventQuickSuggestions: false },
          quickSuggestions: false,
          parameterHints: { enabled: false },
        }}
      />

      {/* Footer */}
      <div className="px-2 border-t text-neutral-600 border-neutral-800">
        <p className="p-1 text-sm font-semibold">
          Ln {position.line}, Col {position.column}
        </p>
      </div>
    </div>
  );
}
