import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function ProblemPanel({ selectedProblem, setSelectedProblem, roomId, socket }) {
  //default content if no problem is selected
  const defaultProblem = {
    title: "Select a Problem",
    difficulty: "Medium",
    tags: ["Example", "Tags"],
    description: "Please select a problem from the problem selection panel to start your coding interview practice.",
  };

  //use selected problem or default
  const problem = selectedProblem || defaultProblem;
  useEffect(() => {
    const handleProblemPanelSync = (newProblem) => {
      // Since React uses shallow comparison, compare contents of objects
      if (JSON.stringify(selectedProblem) !== JSON.stringify(newProblem)) {
        console.log("OBJECTS ARE DIFFERENT");
        console.log(selectedProblem);
        console.log(JSON.stringify(newProblem));
        setSelectedProblem(newProblem);
      }
    };

    const syncProblemPanel = () => {
      socket.on("problem_panel_synchronization", handleProblemPanelSync);
      socket.emit("problem_panel_synchronization", { roomId, problem: selectedProblem });
    };
    syncProblemPanel();

    // Cleanup the listener when the component is unmounted or the dependencies change
    return () => {
      socket.off("problem_panel_synchronization", handleProblemPanelSync);
    };
  }, [roomId, selectedProblem, setSelectedProblem, socket]);

  //function to determine difficulty class
  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-500 border-green-500/25 bg-green-700/10";
      case "Medium":
        return "text-[#EB5528] border-[#EB5528]/25 bg-[#EB5528]/10";
      case "Hard":
        return "text-red-500 border-red-500/25 bg-red-700/10";
      default:
        return "text-neutral-600 border-neutral-800";
    }
  };

  return (
    <div className="flex flex-col flex-grow rounded-lg border shadow bg-editor border-neutral-800 overflow-y-hidden">
      <div className="flex flex-row px-1 gap-1 border-b bg-neutral-900 border-neutral-800">
        <p className="p-1 font-semibold text-neutral-600">Problem</p>
      </div>

      {/*problem header section*/}
      <div className="flex flex-col gap-2 p-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white">{problem.title}</h1>
        {selectedProblem && (
          <div className="flex flex-wrap gap-1">
            <p className={`flex items-center px-2 py-0.5 text-sm font-medium rounded-full border shadow ${getDifficultyClass(problem.difficulty)}`}>{problem.difficulty}</p>
            {selectedProblem &&
              problem.tags.map((tag, index) => (
                <p key={index} className="flex items-center px-2 text-sm font-medium rounded-full border shadow text-neutral-600 border-neutral-800">
                  {tag}
                </p>
              ))}
          </div>
        )}
      </div>

      {/*markdown content*/}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 overflow-y-scroll p-4 break-words text-wrap markdown [&::-webkit-scrollbar]:w-0 text-neutral-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {problem.description}
          </ReactMarkdown>
          {selectedProblem && <p className="mt-4 pb-16 opacity-25 select-none italic">This problem was generated with the use of large language models.</p>}
        </div>
        <span className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-editor to-transparent z-50 rounded-b-lg" />
      </div>
    </div>
  );
}
