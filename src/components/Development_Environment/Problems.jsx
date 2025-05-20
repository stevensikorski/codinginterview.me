const Problems = {
  prob001: {
    problemID: "prob001",
    title: "Two Sum",
    tags: ["List", "Dictionary"],
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return an array with two indices such that the values at those indices add up exactly to \`target\`. There is exactly one valid pair, and you may not use the same element twice.

Example 1:
\`\`\`text
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
\`\`\`

Example 2:
\`\`\`text
Input: nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var twoSum = function(nums, target) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    },
  },

  prob002: {
    problemID: "prob002",
    title: "Valid Parentheses",
    tags: ["String", "List"],
    difficulty: "Easy",
    description: `Given a string \`s\` containing only the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine whether the string is valid. A valid string meets these conditions:

- Every opening bracket has a corresponding closing bracket of the same type.
- Brackets are closed in the correct (last-in, first-out) order.
- An empty string is considered valid.

Example 1:
\`\`\`text
Input: s = "{[()]}"
Output: true
\`\`\`

Example 2:
\`\`\`text
Input: s = "([)]"
Output: false
\`\`\`

Example 3:
\`\`\`text
Input: s = "()[]{}"
Output: true
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def isValid(self, s: str) -> bool:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var isValid = function(s) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    },
  },

  prob003: {
    problemID: "prob003",
    title: "First Unique Character",
    tags: ["String", "Dictionary", "Counting"],
    difficulty: "Easy",
    description: `Given a string \`s\` of lowercase English letters, return the index of its first non-repeating character. If every character repeats or the string is empty, return \`-1\`.

Example 1:
\`\`\`text
Input: s = "swiss"
Output: 1
\`\`\`

Example 2:
\`\`\`text
Input: s = "aabb"
Output: -1
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def firstUniqChar(self, s: str) -> int:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var firstUniqChar = function(s) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int firstUniqChar(string s) {
        
    }
};`,
    },
  },

  prob004: {
    problemID: "prob004",
    title: "Group Anagrams",
    tags: ["Dictionary", "String", "Sorting"],
    difficulty: "Medium",
    description: `Given an array of strings \`strs\`, group the anagrams together and return a list of these groups. Anagrams are words that contain the same characters in any order. You may return the groups in any order.

Example 1:
\`\`\`text
Input: ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"],["tan","nat"],["bat"]]
\`\`\`

Example 2:
\`\`\`text
Input: ["abc", "bca", "cab", "xyz"]
Output: [["abc","bca","cab"],["xyz"]]
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var groupAnagrams = function(strs) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        
    }
};`,
    },
  },

  prob005: {
    problemID: "prob005",
    title: "Matrix Island Count",
    tags: ["Matrix", "Depth-First Search", "Recursion"],
    difficulty: "Medium",
    description: `You are given a 2D grid of characters \`grid\` where \`'1'\` represents land and \`'0'\` represents water. Count how many islands there are in \`grid\`. An island is a group of \`'1'\`s connected horizontally or vertically (not diagonally). The grid may contain multiple disconnected islands.

Example 1:
\`\`\`text
Input:
[
  ['1','1','0','0','0'],
  ['1','1','0','0','0'],
  ['0','0','1','0','0'],
  ['0','0','0','1','1']
]
Output: 3
\`\`\`

Example 2:
\`\`\`text
Input:
[
  ['1','0','1','0'],
  ['0','1','0','1'],
  ['1','0','1','0']
]
Output: 6
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var numIslands = function(grid) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        
    }
};`,
    },
  },

  prob006: {
    problemID: "prob006",
    title: "Maximum Subarray Sum",
    tags: ["List", "Dynamic Programming"],
    difficulty: "Medium",
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one element) which has the largest sum, and return that sum.

Example 1:
\`\`\`text
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
\`\`\`

Example 2:
\`\`\`text
Input: [1]
Output: 1
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var maxSubArray = function(nums) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
    },
  },

  prob007: {
    problemID: "prob007",
    title: "Word Search",
    tags: ["Matrix", "Backtracking", "Depth-First Search"],
    difficulty: "Hard",
    description: `Given a 2D board of letters \`board\` and a target word \`word\`, determine if \`word\` exists in \`board\`. You can form the word by starting from any cell and moving to adjacent cells horizontally or vertically. Each cell may be used only once per search.

Example 1:
\`\`\`text
Input:
board = [
  ['A','B','C','E'],
  ['S','F','C','S'],
  ['A','D','E','E']
]
word = "ABCCED"
Output: true
\`\`\`

Example 2:
\`\`\`text
Input:
word = "SEE"
Output: true
\`\`\`

Example 3:
\`\`\`text
Input:
word = "ABCB"
Output: false
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var exist = function(board, word) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        
    }
};`,
    },
  },

  prob008: {
    problemID: "prob008",
    title: "Longest Palindromic Substring",
    tags: ["String", "Dynamic Programming"],
    difficulty: "Hard",
    description: `Given a string \`s\`, return the longest substring that reads the same forwards and backwards. If there are multiple substrings with the same maximum length, you may return any one of them.

Example 1:
\`\`\`text
Input: "cbbd"
Output: "bb"
\`\`\`

Example 2:
\`\`\`text
Input: "racecar"
Output: "racecar"
\`\`\`

Example 2:
\`\`\`text
Input: "abacdfgdcabbaabcdedcba"
Output: "abcdedcba"
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def longestPalindrome(self, s: str) -> str:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var longestPalindrome = function(s) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        
    }
};`,
    },
  },

  prob009: {
    problemID: "prob009",
    title: "Meeting Rooms II",
    tags: ["List", "Sorting", "Priority Queue", "Greedy"],
    difficulty: "Hard",
    description: `Given an array of meeting time intervals \`intervals\` where each interval is a two-element array \`[start, end]\`, determine the minimum number of conference rooms required so that all meetings can take place without overlapping.

Example 1:
\`\`\`text
Input: [[0,30],[5,10],[15,20]]
Output: 2
\`\`\`

Example 2:
\`\`\`text
Input: [[7,10],[2,4]]
Output: 1
\`\`\``,
    code: {
      python: `# Time Complexity:
# Space Complexity:

from typing import List

class Solution:
    def minMeetingRooms(self, intervals: List[List[int]]) -> int:
        `,
      javascript: `// Time Complexity:
// Space Complexity:

var minMeetingRooms = function(intervals) {
    
};`,
      cpp: `// Time Complexity:
// Space Complexity:

#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int minMeetingRooms(vector<vector<int>>& intervals) {
        
    }
};`,
    },
  },
};

export default Problems;
