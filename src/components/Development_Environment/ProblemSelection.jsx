import React, { useState } from "react";
import { X, Search } from "lucide-react";

//mock problems data
const problems = {
  "prob001": {
    "problemID": "prob001",
    "title": "Two Sum",
    "tags": ["List", "Dictionary"],
    "difficulty": "Easy",
    "description": "Write a function that takes a list of integers and a target sum, and returns the indices of two numbers that add up to the target. You may assume each input has exactly one solution, and you cannot use the same element twice."
  },
  "prob002": {
    "problemID": "prob002",
    "title": "Valid Parentheses",
    "tags": ["String", "List"],
    "difficulty": "Easy",
    "description": "Write a function that takes a string containing only the characters '(', ')', '{', '}', '[', and ']', and determines if the input string is valid. A string is valid if all brackets are closed in the correct order."
  },
  "prob003": {
    "problemID": "prob003",
    "title": "First Unique Character",
    "tags": ["String", "Dictionary", "Counting"],
    "difficulty": "Easy",
    "description": "Write a function that finds the first non-repeating character in a string and returns its index. If it doesn't exist, return -1."
  },
  "prob004": {
    "problemID": "prob004",
    "title": "Group Anagrams",
    "tags": ["Dictionary", "String", "Sorting"],
    "difficulty": "Medium",
    "description": "Write a function that groups anagrams together from a list of strings. Two strings are anagrams if they contain the same characters but in a different order."
  },
  "prob005": {
    "problemID": "prob005",
    "title": "Matrix Island Count",
    "tags": ["Matrix", "Depth-First Search", "Recursion"],
    "difficulty": "Medium",
    "description": "Write a function that counts the number of islands in a 2D grid. An island is a group of connected 1's (representing land) surrounded by 0's (representing water). The grid cells are connected horizontally and vertically."
  },
  "prob006": {
    "problemID": "prob006",
    "title": "Maximum Subarray Sum",
    "tags": ["List", "Dynamic Programming"],
    "difficulty": "Medium",
    "description": "Write a function that finds a contiguous subarray with the largest sum and returns that sum. The array may contain both positive and negative integers."
  },
  "prob007": {
    "problemID": "prob007",
    "title": "Word Search",
    "tags": ["Matrix", "Backtracking", "Depth-First Search"],
    "difficulty": "Hard",
    "description": "Write a function that determines if a word exists in a 2D board of characters. The word can be constructed from adjacent cells (horizontally or vertically), and each cell can be used only once."
  },
  "prob008": {
    "problemID": "prob008",
    "title": "Longest Palindromic Substring",
    "tags": ["String", "Dynamic Programming"],
    "difficulty": "Hard",
    "description": "Write a function that finds the longest palindromic substring in a given string. A palindrome reads the same forwards and backwards."
  },
  "prob009": {
    "problemID": "prob009",
    "title": "Meeting Rooms II",
    "tags": ["List", "Sorting", "Priority Queue", "Greedy"],
    "difficulty": "Hard",
    "description": "Given a list of meeting time intervals (start, end), write a function to find the minimum number of meeting rooms required to hold all meetings."
  }
};

export default function ProblemSelection({ onClose, onSelectProblem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  
  //filter problems based on search term (matching title OR tags) and difficulty
  const filteredProblems = Object.values(problems).filter(problem => {
    const matchesTitle = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
    <div className="w-full h-full flex flex-col bg-neutral-900 p-4">
      {/*header with close button*/}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-white font-bold">Problem Selection</h2>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-neutral-600 hover:text-neutral-400 p-1 rounded"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/*search and filters*/}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-editor border border-neutral-800 rounded-lg py-2 pl-10 pr-3 text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-700"
          />
          <Search className="absolute left-3 top-2.5 text-neutral-600" size={18} />
        </div>
        
        <div className="flex mt-2 space-x-2">
          {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 py-1 text-sm rounded-full border shadow ${
                selectedDifficulty === difficulty 
                ? "bg-neutral-700 text-white" 
                : "bg-editor text-neutral-400"
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>
      
      {/*problem list*/}
      <div className="flex-grow overflow-y-auto pr-1 -mr-1">
        {filteredProblems.length === 0 ? (
          <div className="text-center text-neutral-500 my-4">
            No problems match your search
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredProblems.map((problem) => (
              <div 
                key={problem.problemID} 
                className="bg-editor border border-neutral-800 rounded-lg p-3 cursor-pointer hover:border-neutral-700 hover:bg-neutral-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => onSelectProblem && onSelectProblem(problem)}
              >
                <h3 className="text-white font-medium mb-2">{problem.title}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shadow ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-0.5 text-xs font-medium rounded-full border shadow text-neutral-500 border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-neutral-500 text-sm truncate">
                  {problem.description.substring(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}