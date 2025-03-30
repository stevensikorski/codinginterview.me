import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

// utility functions
import { isAuthenticated } from "../utilities/auth_context.js"
import e from "cors";

// Some routes can only be accessed if user is authenticated
const ProtectedRoute = ({ element, ...rest }) => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated)
        setIsAuthenticatedState(authenticated);
      else
        return <Navigate to="/" replace />;
    };

    checkAuthentication();
  }, []);

  // While we're checking the authentication, we can show a loading state or null
  if (!isAuthenticatedState) {
    return <div>Loading...</div>; 
  }

  // If the user is authenticated, render the protected element
  return element;
};

export default ProtectedRoute;


export { ProtectedRoute }