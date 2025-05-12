import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";

export default function MarkdownEditor({ roomId, socket }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [charCount, setCharCount] = useState(0);
  const [notes, setNotes] = useState("");

  const [fontSize, setFontSize] = useState(14);
  const fontSizes = [10, 12, 14, 16, 18, 20];

  // Timeout function to automatically save and synchronize notes
  const debounceTimeout = useRef(null);

  // Check if notes are being pushed
  const pushNotesStatus = useRef(null);

  const pushNotesUpdate = () => {
    // Clear any previous timeout
    clearTimeout(debounceTimeout.current);
    if (!pushNotesStatus.current && socket) {
      // Save copy of notes and synchronize it with other users in room
      // whenever user starts typing and then stops typing for 300ms
      if (editorRef.current) {
        const value = editorRef.current.getValue() || "";
        debounceTimeout.current = setTimeout(() => {
          // SocketIO client object
          socket.emit("synchronize_notepad", { roomId, newNotes: value });
        }, 200);
      }
    }
  };

  // Reflect incoming notes changes to synchronize notes
  useEffect(() => {
    if (!socket) {
      return; // Prevent running the effect if socket is not available
    }

    const handleSynchronizedNotes = (newNotes) => {
      // Notes are being received, so do not trigger outgoing notes changes until push is done
      pushNotesStatus.current = true;

      // During this time, only accept incoming notes changes
      let cursorPosition = null;
      if (editorRef.current) {
        cursorPosition = editorRef.current.getPosition(); // Get the current cursor position
        editorRef.current.setValue(newNotes); // Set the new notes in the editor
      }

      // After the content is updated, restore the cursor position
      if (editorRef.current && cursorPosition) {
        editorRef.current.setPosition(cursorPosition); // Restore the cursor position
      }

      // Done
      pushNotesStatus.current = false;
    };

    // Listen for incoming notes updates
    socket.on("synchronize_notepad", handleSynchronizedNotes);
    return () => {
      if (socket) {
        socket.off("synchronize_notepad", handleSynchronizedNotes);
      }
    };
  }, [socket, roomId]);

  const rotateFontSize = () => {
    const nextIndex = (fontSizes.indexOf(fontSize) + 1) % fontSizes.length;
    const nextSize = fontSizes[nextIndex];
    setFontSize(nextSize);
    editorRef.current?.updateOptions({ fontSize: nextSize });
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const model = editor.getModel();
    setCharCount(model.getValueLength());

    editor.onDidChangeModelContent(() => {
      const updatedModel = editor.getModel();
      const value = updatedModel.getValue();
      setCharCount(value.length);
      setNotes(value);
      pushNotesUpdate();
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
      {/* Editor */}
      <div className="flex flex-col flex-grow">
        <Editor
          height="100%"
          theme="vs-dark"
          loading=""
          onMount={handleEditorMount}
          value={notes}
          onChange={(value) => {
            setNotes(value || "");
          }}
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
            lineNumbers: "off",
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
