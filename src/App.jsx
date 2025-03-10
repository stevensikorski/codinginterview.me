import React, { useState } from "react";

//import compononets
import FindPartner from "./components/Home/FindPartner";
import Hero from "./components/Home/Hero";
import HowItWorks from "./components/Home/HowItWorks";
import LoginModal from "./components/Home/LoginPopup";
import RegisterPopup from "./components/Home/RegisterPopup";
import SolveProblem from "./components/Home/SolveProblem";
import Footer from "./components/shared/Footer";
import Header from "./components/shared/Header";

export default function App() {
  //login popup show/hide control
  var loginModalState = useState(false);
  var isLoginModalOpen = loginModalState[0];
  var setIsLoginModalOpen = loginModalState[1];
  
  //register popup show/hide control
  var registerModalState = useState(false);
  var isRegisterModalOpen = registerModalState[0];
  var setIsRegisterModalOpen = registerModalState[1];
  
  //opens login popup when "sign in" button is clicked
  function handleOpenLoginButtonClick() {
    console.log("User clicked to open login");
    setIsLoginModalOpen(true);
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
        <RegisterPopup 
          isOpen={isRegisterModalOpen} 
          closeModal={handleCloseRegisterModal}
        />
      </main>
      {/*bot section*/}
      <Footer />
    </div>
  );
}