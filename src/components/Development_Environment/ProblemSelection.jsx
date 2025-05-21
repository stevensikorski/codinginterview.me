import React, { useState, useEffect } from "react";
import { X, Search, ShieldBan } from "lucide-react";
import Spinner from "../shared/Spinner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { getUser } from "../utilities/auth_context";
import Problems from "./Problems";

export default function ProblemSelection({ isClose, onClose, onSelectProblem, roomId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const [loading, setLoading] = useState(true);
  const [authorizedUser, setAuthorizedUser] = useState(false);

  //check if user is interviewer
  useEffect(() => {
    const checkAuthorization = async () => {
      const user = await getUser();
      if (user) {
        const reqData = {
          uid: user.uid,
          roomId: roomId,
        };

        const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}/rooms/${roomId}/problem_selection`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqData),
        });

        const data = await response.json();
        if (response.ok) {
          setAuthorizedUser(true);
        } else {
          console.log(data.message);
        }
        setLoading(false);
      }
    };
    checkAuthorization();
  }, [isClose, roomId]);

  if (loading) {
    return <Spinner />;
  }

  if (!authorizedUser) {
    return (
      <div className="bg-neutral-900 h-screen w-screen flex flex-col items-center justify-center">
        <ShieldBan className="size-14 text-neutral-700" />
        <h2 className="text-neutral-700 text-3xl font-semibold mt-2">Access Denied</h2>
        <p className="text-neutral-700 font-medium">The page is restricted to interviewers.</p>
      </div>
    );
  }
  //filter problems based on search term (matching title OR tags) and difficulty
  const filteredProblems = Object.values(Problems).filter((problem) => {
    const matchesTitle = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = problem.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSearch = searchTerm === "" || matchesTitle || matchesTags;

    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  //get difficulty color class
  const getDifficultyColor = (difficulty) => {
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
    <div className="w-full h-full flex flex-col p-4">
      {/*header with close button*/}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-bold">Problem Selection</h2>
        {onClose && (
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-400 p-1 rounded">
            <X size={20} />
          </button>
        )}
      </div>

      {/*search and filters*/}
      <div>
        <div className="relative">
          <input type="text" placeholder="Search by title or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-editor border border-neutral-800 rounded-lg py-2 pl-10 pr-3 text-neutral-400 placeholder-neutral-600 focus:outline-none" />
          <Search className="absolute left-3 top-3 text-neutral-600" size={18} />
        </div>

        <div className="flex my-2 space-x-2">
          {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
            <button key={difficulty} onClick={() => setSelectedDifficulty(difficulty)} className={`px-3 py-1 text-sm rounded-full border border-neutral-800 shadow ${selectedDifficulty === difficulty ? "bg-neutral-800 text-neutral-200" : "bg-editor text-neutral-400"}`}>
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/*problem list*/}
      <div className="flex-grow overflow-y-scroll [&::-webkit-scrollbar]:w-0 pr-1 -mr-1 pt-0.5 pb-16">
        {filteredProblems.length === 0 ? (
          <div className="text-center text-neutral-500 my-8">No problems match your search.</div>
        ) : (
          <div className="grid gap-3">
            {filteredProblems.map((problem) => (
              <div key={problem.problemID} className="bg-editor border border-neutral-800 rounded-lg p-3 cursor-pointer hover:bg-neutral-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" onClick={() => onSelectProblem && onSelectProblem(problem)}>
                <h3 className="text-white font-medium mb-2">{problem.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shadow ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</span>
                  {problem.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 text-xs font-medium rounded-full border shadow text-neutral-500 border-neutral-800">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-neutral-500 text-sm truncuate">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {problem.description.substring(0, 100) + "..."}
                  </ReactMarkdown>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-900 to-transparent z-50" />
    </div>
  );
}
