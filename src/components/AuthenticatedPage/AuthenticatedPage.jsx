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

            <p className="text-lg text-dark-100 mb-8">Begin or join a coding interview session</p>

            {/*main interviewer card*/}
            <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 mb-6">
              <h2 className="text-xl font-bold text-dark mb-3">Create an Interview Session</h2>
              <p className="text-dark-100 mb-4">
                As an interviewer, you can create a new session and share the invitation link with your interviewee.
              </p>
              <button onClick={startAsInterviewer} className="py-3 px-6 rounded-md bg-primary text-light font-bold">
                Create Session
              </button>
            </div>

            {/*interviewee section - join with invitation link */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
              <h2 className="text-xl font-bold text-dark mb-3">Join an Interview Session</h2>
              <p className="text-dark-100 mb-4">
                Paste the invitation link shared by your interviewer to join their session as an interviewee.
              </p>
              <div className="flex gap-2">
                <input type="text" placeholder="Paste invitation link here" className="flex-grow px-4 py-2 border rounded-md" />
                <button className="px-6 py-2 bg-primary text-light font-bold rounded-md">Join Session</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}