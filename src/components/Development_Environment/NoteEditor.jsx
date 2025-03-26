import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";

export default function MarkdownEditor() {
  const editorRef = useRef(null);

  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);

  const [fontSize, setFontSize] = useState(14);
  const fontSizes = [10, 12, 14, 16, 18, 20];

  const rotateFontSize = () => {
    const nextIndex = (fontSizes.indexOf(fontSize) + 1) % fontSizes.length;
    const nextSize = fontSizes[nextIndex];
    setFontSize(nextSize);
    editorRef.current?.updateOptions({ fontSize: nextSize });
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;

    const model = editor.getModel();
    setCharCount(model.getValueLength());

    editor.onDidChangeModelContent(() => {
      const updatedModel = editor.getModel();
      setCharCount(updatedModel.getValueLength());
    });

    editor.onDidChangeCursorPosition((event) => {
      setPosition({
        line: event.position.lineNumber,
        column: event.position.column,
      });
    });

    editor.updateOptions({ fontSize });
  };

  return (
    <div className="flex flex-grow flex-col rounded-b-lg overflow-hidden">
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

      {/* Editor */}
      <div className="flex flex-col flex-grow">
        <Editor
          height="100%"
          theme="vs-dark"
          loading=""
          onMount={handleEditorMount}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 10, bottom: 10, left: 10, right: 10 },
            scrollbar: { useShadows: false, vertical: "auto", horizontal: "auto" },
            stickyScroll: { enabled: false },
            insertSpaces: true,
            scrollBeyondLastLine: false,
            wordWrap: "off",
            fontSize: fontSize,
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
      </div>

      {/* Footer */}
      <div className="flex flex-row justify-between border-t text-neutral-600 border-neutral-800">
        <div className="flex items-center px-1 gap-1">
          <p className="p-1 text-sm font-semibold">
            Ln {position.line}, Col {position.column}
          </p>
          <span className="w-[1px] h-[50%] mx-1 bg-neutral-800"></span>
          <p className="p-1 text-sm font-semibold">{charCount} characters</p>
        </div>

        <div className="flex flex-wrap px-1 gap-1">
          <button onClick={rotateFontSize} className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">
            Font {fontSize}
          </button>
        </div>
      </div>
    </div>
  );
}
