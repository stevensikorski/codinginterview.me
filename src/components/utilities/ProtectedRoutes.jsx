import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// utility functions
import { isAuthenticated } from "../utilities/auth_context.js"

// Some routes can only be accessed if user is authenticated
const ProtectedRoute = ({ element, ...rest }) => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated();
      console.log("is user authenticated: ", authenticated)
      if (authenticated){
        setIsAuthenticatedState(authenticated);
      }
      setIsLoading(false);
    };

    checkAuthentication();
  }, []);

  // While we're checking the authentication, we can show a loading state or null
  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticatedState){
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated, render the protected element
  return element;
};

export default ProtectedRoute;


export { ProtectedRoute }