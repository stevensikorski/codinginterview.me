import React, { useState } from "react";

//React router allows routing to different paths (eg: for redirects)
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

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

function App() {
  //routing capabilities
  const navigate = useNavigate();

  //login popup show/hide control
  var [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  //register popup show/hide control
  var [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  //opens login popup when "sign in" button is clicked
  function handleOpenLoginButtonClick() {
    console.log("User clicked to open login");
    setIsLoginModalOpen(true);
    navigate("/register");
  }

  //closes login popup when X button is clicked
  function handleCloseLoginModal() {
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

  return (
    <div className="min-w-[1024px]">
      <Header openModal={handleOpenLoginButtonClick} /> {/*nav bar*/}
      <main>
        {/*sections of home*/}
        <Hero openRegisterModal={handleOpenRegisterButtonClick} />
        <HowItWorks />
        <FindPartner />
        <SolveProblem />
        {/*popups, only show when their state is true*/}
        <LoginModal isOpen={isLoginModalOpen} closeModal={handleCloseLoginModal} />
        <RegisterPopup isOpen={isRegisterModalOpen} closeModal={handleCloseRegisterModal} />
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
      </Routes>
    </Router>
  );
}
