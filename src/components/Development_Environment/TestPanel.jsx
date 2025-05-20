import React, { useState } from "react";
import { Check, X, Play, LoaderCircle, Send } from "lucide-react";

export default function UnitTestPanel() {
  //state to track test cases, 3 default cases with no status
  const [tests, setTests] = useState([
    { id: 1, name: "Test Case 1", status: null },
    { id: 2, name: "Test Case 2", status: null },
    { id: 3, name: "Test Case 3", status: null },
  ]);

  //state to track if tests are currently running
  const [runningTests, setRunningTests] = useState(false);

  //state to track test results summary
  const [testResults, setTestResults] = useState({ passed: 0, failed: 0, total: 3 });

  //function to simulate running tests (should be replaced with actual API call)
  const runTests = () => {
    //set loading state while tests are running
    setRunningTests(true);
    //simulate API call to backend, setTimeout is jusst MIMICING delay
    setTimeout(() => {
      //update each test with a random pass/fail
      //this would be based on actual test results from backend
      const updatedTests = tests.map((test) => ({
        ...test,
        status: Math.random() > 0.3 ? "passed" : "failed", //70% pass rate for demo
      }));

      //update the tests with their new status
      setTests(updatedTests);

      //calculate and update the results summary
      const passed = updatedTests.filter((t) => t.status === "passed").length;
      setTestResults({
        passed,
        failed: updatedTests.length - passed,
        total: updatedTests.length,
      });

      //tests finished running, update loading state
      setRunningTests(false);
    }, 1500); // 1.5 second delay to simulate test execution time
  };

  return (
    <div className="flex flex-col flex-grow h-full bg-editor text-neutral-300 overflow-hidden">
      {/*header section with run tests button and results*/}
      <div className="flex items-center justify-between p-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <button onClick={runTests} disabled={runningTests} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${runningTests ? "bg-neutral-800 text-neutral-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
            {runningTests ? <LoaderCircle size={14} className="animate-spin" /> : <Play size={14} />}
            {runningTests ? "Running..." : "Run Tests"}
          </button>
          <button className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${runningTests ? "bg-neutral-800 text-neutral-400 cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90"}`}>
            <Send size={14} />
            Submit
          </button>
        </div>

        {/*results summary display*/}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-500">{testResults.passed} passed</span>
          <span className="text-red-500">{testResults.failed} failed</span>
          <span className="text-neutral-500">of {testResults.total} tests</span>
        </div>
      </div>

      {/*list of test cases with their status*/}
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {tests.map((test) => (
          <div
            key={test.id}
            className={`border rounded-lg p-3 flex items-center justify-between ${
              test.status === "passed"
                ? "border-green-800/30 bg-green-900/10" //green for passed
                : test.status === "failed"
                ? "border-red-800/30 bg-red-900/10" //red for failed
                : "border-neutral-800 bg-neutral-900/50" //default for tests not yet run
            }`}>
            <div className="flex items-center gap-2">
              {/*icons for test status*/}
              {test.status === "passed" && <Check size={16} className="text-green-500" />}
              {test.status === "failed" && <X size={16} className="text-red-500" />}
              {test.status === null && <div className="w-4" />} {/*empty placeholder if no status*/}
              <span className="font-medium">{test.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
