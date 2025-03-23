// utility functions
import { getToken } from "../utilities/auth_context.js"
import { Navigate } from "react-router-dom";

// ProtectedRoute component
const ProtectedRoute = ({ element, ...rest }) => {
  // Check if user is authenticated via token
  if (!getToken()) {
    // Redirect to the login page if no token (unauthenticated)
    return <Navigate to="/" replace />;
  }

  // If the user is authenticated, render the protected component
  return element;
};

export { ProtectedRoute }