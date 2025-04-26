import React, { useEffect, useState, useRef } from "react";
import { isAuthenticated as isUserAuthenticated} from "../utilities/auth_context.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Header({ openModal }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkAuthState = async () => {
      //check for token first (faster than waiting for Firebase)
      const getUserAuthState = await isUserAuthenticated()
      if (getUserAuthState) {
        setIsAuthenticated(true);
      }

      //also check Firebase auth state for email
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
          if (user.email) {
            setUserEmail(user.email);
          }
        }
      });
      unsubscribe(); // Cleanup listener on unmount
    }
    checkAuthState()
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    //clear the token from localStorage
    localStorage.removeItem("jwtToken");
    
    //sign out from Firebase
    const auth = getAuth();
    auth.signOut();
    
    setIsAuthenticated(false);
    setUserEmail("");

    //redirect to home page
    window.location.href = "/";
  };

  //logo destination changes based on authentication state
  const homeLink = isAuthenticated ? "/authenticated" : "/";

  return (
    <header className="bg-light py-3 px-4">
      <div className="container mx-auto">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex justify-between items-center">
            {/*logo - links to dashboard if authenticated, home if not */}
            <a href={homeLink} className="text-2xl font-semibold text-dark hover:opacity-80 transition-opacity">
              <img className="size-40 object-contain" src="/logo.webp" alt="logo" />
            </a>
            {/*navigation */}
            <div className="flex items-center gap-6">
              {/*only show HOME button when not authenticated */}
              {!isAuthenticated && (
                <a
                  href={homeLink}
                  className="text-[16px] text-dark-100 leading-tight font-bold transition-all hover:text-primary"
                >
                  HOME
                </a>
              )}
              
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center gap-2 cursor-pointer" 
                    onMouseEnter={() => setDropdownOpen(true)}
                  >
                    {/*user icon*/}
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/*dropdown menu*/}
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button 
                        className="block w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => console.log("Settings clicked")}
                      >
                        Settings
                      </button>
                      <button 
                        className="block w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openModal}
                  className="px-8 py-3 rounded-md bg-primary text-[18px] font-bold text-light hover:bg-primary/90"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
