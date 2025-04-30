import React, { useState, useEffect, useRef } from "react";

//React router allows routing to different paths (eg: for redirects)
// import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom"; // commented out for deployment to work
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../src/components/utilities/auth_context.js";

//import compononets
import FindPartner from "./components/Home/FindPartner";
import Hero from "./components/Home/Hero";
import HowItWorks from "./components/Home/HowItWorks";
import LoginModal from "./components/Home/LoginPopup";
import RegisterPopup from "./components/Home/RegisterPopup";
import Register from "./components/Account_Registration/AccountRegistration";
import SolveProblem from "./components/Home/SolveProblem";
import Footer from "./components/shared/Footer";
import Header from "./components/shared/Header";
import DevelopmentEnvironmentPage from "./components/Development_Environment/EditorPage";
import AuthenticatedPage from "./components/AuthenticatedPage/AuthenticatedPage";
import Session from "./components/Session/Session.jsx";
import Room from "./components/Room/Room.jsx";
import ForgotPasswordPopup from "./components/Home/ForgotPasswordPopup";

// import utility functions and components
import { ProtectedRoute } from "./components/utilities/ProtectedRoutes.jsx";
import { io } from "socket.io-client";
function App() {
  useEffect(() => {
    const sock = io(`${process.env.REACT_APP_BACKEND_HOST}`, { 
      path: '/createsession'
    })
    
    sock.on("bind_room_user", () => console.log("DO NOT LOG THIS"))
    sock.on("connect", () => {
      sock.emit("bind_room_user", {'roomId': "tester1234"})
    })
    return () => {
      sock.off("bind_room_user");
      sock.disconnect();
    }
  }, [])


  //routing capabilities
  const navigate = useNavigate(); // commented out for deployment to work

  //login popup show/hide control
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //register popup show/hide control
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  
  console.log(isLoginModalOpen);
  useEffect(() => {
    if (isLoginModalOpen === true) {
      const authState = async () => {
        const status = await isAuthenticated();
        if (status) navigate("/authenticated");
      };
      authState();
    }
  }, [isLoginModalOpen, navigate]);

  //opens login popup when "sign in" button is clicked
  function handleOpenLoginButtonClick() {
    console.log("User clicked to open login");
    // Set to current state to force authentication check in useEffect
    setIsLoginModalOpen(true);
  }

  //closes login popup when X button is clicked
  function handleCloseLoginModal() {
    console.log("User closed login");
    setIsLoginModalOpen(false);
  }

  //opens register popup when "Give it a try" button is clicked
  function handleOpenRegisterButtonClick() {
    console.log("User clicked to register");
    setIsRegisterModalOpen(true);
  }

  //closes register popup when X button is clicked
  function handleCloseRegisterModal() {
    setIsRegisterModalOpen(false);
  }

  function handleOpenForgotPasswordModal() {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  }
  
  function handleCloseForgotPasswordModal() {
    setIsForgotPasswordModalOpen(false);
  }

  return (
    <div className="min-w-[1024px]">
      <Header openModal={handleOpenLoginButtonClick} />
      <main>
        {/*sections of home*/}
        <Hero openRegisterModal={handleOpenRegisterButtonClick} />
        <HowItWorks />
        <FindPartner />
        <SolveProblem />
        {/*popups, only show when their state is true*/}
        <LoginModal 
          isOpen={isLoginModalOpen} 
          closeModal={handleCloseLoginModal} 
          openForgotPasswordModal={handleOpenForgotPasswordModal}
        />
        <RegisterPopup isOpen={isRegisterModalOpen} closeModal={handleCloseRegisterModal} />
        <ForgotPasswordPopup 
          isOpen={isForgotPasswordModalOpen} 
          closeModal={handleCloseForgotPasswordModal}
          openLoginModal={handleOpenLoginButtonClick} 
        />
      </main>
      {/*bot section*/}
      <Footer />
    </div>
  );
}

export default function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/editor" element={<DevelopmentEnvironmentPage />} />
        <Route path="/session" element={<Session />} />
        {/* The Route component does not allow chained redirects, so if nested component 
        redirects once, there won't be a further redirect to the 'path' specified in Router */}
        <Route path="/authenticated" element={<ProtectedRoute element={<AuthenticatedPage />} />} />
        <Route path="/rooms/:roomId/ide" element={<ProtectedRoute element={<Room />} />} />
      </Routes>
    </Router>
  );
}
