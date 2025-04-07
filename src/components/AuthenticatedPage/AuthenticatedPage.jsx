// src/components/AuthenticatedPage/AuthenticatedPage.jsx
import React, { useEffect, useState, useRef } from "react";

// import { useNavigate } from 'react-router-dom'; // commented out for deployment to work
import Header from "../shared/Header";
import Footer from "../shared/Footer";

// utility functions
import { getUser, isEmailVerified } from "../utilities/auth_context";

// socket client
import io from "socket.io-client";

const startAsInterviewer = async (socket, setShowLinkBox, setRoomLink, linkShownRef) => {
  // Navigate to problem selection
  try {
    const handleRoomCreation = (roomPath) => {
      console.log('called')
      console.log("Room path from backend: ", roomPath);
      setRoomLink(roomPath);
      setShowLinkBox(true);
      linkShownRef.current = true;
      socket.off("createroom");
    }

    // Send request to make a room in backend
    const user = await getUser();
    if (user) {
      const jwtToken = await user.getIdToken();
      const uid = user.uid;
      
      socket.on("createroom", handleRoomCreation);
      socket.connect();
      socket.emit("createroom", { uid, jwtToken });
    }
  } catch (error) {
    console.log(error);
  }
};

export default function AuthenticatedPage() {
  const [showLinkBox, setShowLinkBox] = useState(false);
  const [roomLink, setRoomLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const linkShownRef = useRef(false);

  // SocketIO client object
  const socket = io(process.env.REACT_APP_BACKEND_HOST || "http://localhost:3002/", {
    path: "/createsession",
    autoConnect: false // Prevents auto connection
  });

  useEffect(() => {
    const checkEmailVerification = async () => {
      const status = await isEmailVerified();
      console.log(status);
    };
    checkEmailVerification();
    
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleLink = (e) => {
    e.preventDefault();
    const form = new FormData(e.target)
    const link = form.get("redirect_link")
    console.log(link)
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('Please paste a valid invitation link.');
    }
  };

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
              <p className="text-dark-100 mb-4">As an interviewer, you can create a new session and share the invitation link with your interviewee.</p>
              {!showLinkBox ? (
                <button
                  onClick={() => {
                    linkShownRef.current = false;
                    startAsInterviewer(socket, setShowLinkBox, setRoomLink, linkShownRef);
                  }}
                  className="py-3 px-6 rounded-md bg-primary text-light font-bold"
                >
                  Create Session
                </button>
              ) : (
                <div className="mt-4">
                  <p className="font-medium text-dark mb-2">Share this link with your interviewee:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={roomLink}
                      readOnly
                      className="flex-grow px-4 py-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-primary text-light font-bold rounded-md"
                    >
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  {copySuccess && (
                    <p className="text-sm text-green-600 mt-1">Link copied to clipboard!</p>
                  )}
                </div>
              )}
            </div>
            
            {/*interviewee section - join with invitation link */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
              <h2 className="text-xl font-bold text-dark mb-3">Join an Interview Session</h2>
              <p className="text-dark-100 mb-4">Paste the invitation link shared by your interviewer to join their session as an interviewee.</p>
              <form onSubmit={handleLink}>
                <div className="flex gap-2">
                  <input type="text" name="redirect_link" placeholder="Paste invitation link here" className="flex-grow px-4 py-2 border rounded-md" />
                  <button type="submit" className="px-6 py-2 bg-primary text-light font-bold rounded-md">Join Session</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
