import React, { useEffect, useState } from "react";
import { isAuthenticated as isUserAuthenticated} from "../utilities/auth_context.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Header({ openModal }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const checkAuthState = async () => {
      //check for token first (faster than waiting for Firebase)
      const getUserAuthState = await isUserAuthenticated()
      console.log(getUserAuthState)
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

  console.log(isAuthenticated)
  //logo destination changes based on authentication state
  const homeLink = isAuthenticated ? "/authenticated" : "/";

  return (
    <header className="bg-light py-3 px-4">
      <div className="container mx-auto">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex justify-between items-center">
            {/*logo - links to dashboard if authenticated, home if not */}
            <a href={homeLink} className="text-2xl font-semibold text-dark">
              <img className="size-28 object-contain" src="/logo.webp" alt="logo" />
            </a>
            
            {/*navigation */}
            <div className="flex items-center gap-6">
              {/*only show HOME button when not authenticated */}
              {!isAuthenticated && (
                <a
                  href={homeLink}
                  className="text-[13px] text-dark-100 leading-tight font-bold transition-all"
                >
                  HOME
                </a>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-8">
                    {userEmail && (
                      <span className="text-[15px] text-dark-100 font-medium">
                        {userEmail}
                      </span>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 rounded-md bg-neutral-700 text-[15px] font-bold text-light"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={openModal}
                  className="px-6 py-2 rounded-md bg-primary text-[15px] font-bold text-light"
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