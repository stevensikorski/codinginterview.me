// src/components/AuthenticatedPage/AuthenticatedPage.jsx
import React from "react";

// import { useNavigate } from 'react-router-dom'; // commented out for deployment to work
import Header from "../shared/Header";
import Footer from "../shared/Footer";

import { getUser, isAuthenticated } from "../utilities/auth_context";

const startAsInterviewer = async () => {
  //navigate to problem selection
  try {
    const user = await getUser()
    const endpoint = "http://localhost:3002/createsession"

    //send request to make a room in backend
    if (user){
      const jwtToken = await user.getIdToken();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid: user.uid,
          jwtToken: jwtToken
        })
      })

      // handle response
      // placeholder here
    }
  } catch (error) {
    console.log(error)
  }
};

const startAsInterviewee = () => {
  //navigate to waiting room
};

export default function AuthenticatedPage() {
  return (
    <div className="min-h-screen flex flex-col min-w-[1024px]">
      <Header />

      <main className="flex-grow bg-light py-10 px-4">
        <div className="container mx-auto">
          <div className="max-w-[800px] mx-auto">
            <h1 className="text-3xl font-bold text-primary mb-6">Welcome to codinginterview.me</h1>

            <p className="text-lg text-dark-100 mb-8">Choose your role to begin a coding interview session</p>

            <div className="flex gap-6">
              {/*interviewer card*/}
              <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 w-1/2 flex flex-col">
                <h2 className="text-xl font-bold text-dark mb-3">Start as Interviewer</h2>
                <p className="text-dark-100 mb-4 flex-grow">Create a session. You'll be able to select problems</p>
                <button onClick={startAsInterviewer} className="w-full py-3 rounded-md bg-primary text-light font-bold">
                  Start as Interviewer
                </button>
              </div>

              {/*interviewee card*/}
              <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 w-1/2 flex flex-col">
                <h2 className="text-xl font-bold text-dark mb-3">Start as Interviewee</h2>
                <p className="text-dark-100 mb-4 flex-grow">Join a session and solve coding problems. You'll wait for an interviewer to select a problem for you.</p>
                <button onClick={startAsInterviewee} className="w-full py-3 rounded-md bg-primary text-light font-bold">
                  Start as Interviewee
                </button>
              </div>
            </div>

            {/*session link input*/}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-neutral-200">
              <h2 className="text-xl font-bold text-dark mb-3">Join with Invitation Link</h2>
              <div className="flex gap-2">
                <input type="text" placeholder="Paste invitation link here" className="flex-grow px-4 py-2 border rounded-md" />
                <button className="px-6 py-2 bg-primary text-light font-bold rounded-md">Join</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
