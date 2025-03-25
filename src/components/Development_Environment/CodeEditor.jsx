import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { ChevronDown, Check, Pencil, PencilOff } from "lucide-react";
import StarterCode from "./StarterCode";

export default function CodeEditor() {
  const editorRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(StarterCode[language]);
  const [position, setPosition] = useState({ line: 1, column: 1 });

  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [autoComplete, setAutoComplete] = useState(true);

  const fontSizes = [10, 12, 14, 16, 18, 20];
  const tabSizes = [2, 4];

  const rotateFontSize = () => {
    const nextIndex = (fontSizes.indexOf(fontSize) + 1) % fontSizes.length;
    const nextSize = fontSizes[nextIndex];
    setFontSize(nextSize);
    editorRef.current?.updateOptions({ fontSize: nextSize });
  };

  const rotateTabSize = () => {
    const nextIndex = (tabSizes.indexOf(tabSize) + 1) % tabSizes.length;
    const nextSize = tabSizes[nextIndex];
    setTabSize(nextSize);

    const model = editorRef.current?.getModel();
    if (model) {
      model.updateOptions({ tabSize: nextSize });

      editorRef.current
        .getAction("editor.action.selectAll")
        ?.run()
        .then(() => {
          editorRef.current.getAction("editor.action.reindentselectedlines")?.run();
        });
    }
  };

  const toggleAutoComplete = () => {
    const next = !autoComplete;
    setAutoComplete(next);
    editorRef.current?.updateOptions({
      suggestOnTriggerCharacters: next,
      quickSuggestions: next,
    });
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((event) => {
      setPosition({ line: event.position.lineNumber, column: event.position.column });
    });
    editor.getModel()?.updateOptions({ tabSize });
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(StarterCode[lang]);
    setIsOpen(false);
    setTabSize(4);

    setTimeout(() => {
      editorRef.current?.getModel()?.updateOptions({ tabSize });
    }, 0);
  };

  const languageNames = {
    python: "Python",
    cpp: "C++",
    javascript: "JavaScript",
  };

  return (
    <div className="flex flex-grow flex-col rounded-b-lg overflow-hidden">
      {/* Header */}
      <div className="flex w-full flex-wrap justify-between items-center border-b border-neutral-800 relative z-10">
        <div className="relative px-1">
          <button onClick={() => setIsOpen(!isOpen)} className="my-1 pl-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm flex items-center">
            {languageNames[language]}
            <ChevronDown className={`size-5 p-0.5 text-neutral-600 ${isOpen ? "rotate-180" : "rotate-0"}`} />
          </button>
          {isOpen && (
            <div className="absolute flex flex-col left-0 top-full bg-editor border shadow border-neutral-800 rounded-lg shadow-neutral-950/75 z-20 p-1 space-y-1">
              {Object.entries(languageNames).map(([lang, name]) => (
                <button key={lang} onClick={() => handleLanguageChange(lang)} className="w-full flex items-center gap-x-1 px-1 py-1 text-sm font-semibold text-neutral-600 rounded-md hover:bg-neutral-600/50 transition duration-200">
                  {lang === language ? <Check className="size-5 p-0.5 text-neutral-600 shrink-0" /> : <span className="size-5 p-0.5" />}
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap px-1 gap-1 justify-end max-w-full">
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Run</button>
          <button className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">Save</button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-col flex-grow">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          loading=""
          onMount={handleEditorMount}
          onChange={(value) => {
            setCode(value || "");
            if (isOpen) setIsOpen(false);
          }}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 10, bottom: 10, right: 8 },
            scrollbar: { useShadows: false, horizontal: "auto" },
            stickyScroll: { enabled: false },
            insertSpaces: true,
            scrollBeyondLastLine: false,
            wordWrap: "off",
            fontSize: fontSize,
            tabSize: tabSize,
            suggestOnTriggerCharacters: autoComplete,
            quickSuggestions: autoComplete,
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-row justify-between border-t text-neutral-600 border-neutral-800">
        <p className="p-1 px-2 text-sm font-semibold">
          Ln {position.line}, Col {position.column}
        </p>
        <div className="flex flex-wrap px-1 gap-1">
          <button onClick={rotateFontSize} className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">
            Font {fontSize}
          </button>
          <button onClick={rotateTabSize} className="my-1 px-1 font-semibold text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm">
            Spaces {tabSize}
          </button>
          <button onClick={toggleAutoComplete} className="my-1 px-1 text-neutral-600 rounded-md bg-transparent hover:bg-neutral-600/50 transition duration-200 text-sm flex items-center">
            {autoComplete ? <Pencil className="size-4" /> : <PencilOff className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
