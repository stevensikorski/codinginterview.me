import { getAuth } from "firebase/auth";

//function to get the JWT token from local storage stored in user's browser
const getLocalToken = () => {
  try {
    return localStorage.getItem("jwtToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

//function to get current signed-in user
//if user is not signed-in, the function returns null
const getUser = async () => {
  const auth = getAuth();

  // Ensure the object returned from getAuth() is fully initialized
  // (has all properties and methods loaded), otherwise the properties/methods
  // will be null.
  await auth.authStateReady();
  return auth.currentUser;
};

//function to remove the token (for logout)
const removeToken = () => {
  try {
    localStorage.removeItem("jwtToken");
    return true;
  } catch (error) {
    console.error("Error removing token:", error);
    return false;
  }
};

//function to check if user is authenticated
const isAuthenticated = async () => {
  const user = await getUser();
  // unable to get user or invalid user
  if (!user) {
    return false;
  }
  
  const firebaseToken = await user.getIdToken()
  if (getLocalToken() === firebaseToken){
    return true
  }
};

//function to check if user email is verified
const isEmailVerified = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  await user.reload();

  if (user.emailVerified) return true;
  return false;
};

export { getLocalToken, removeToken, isAuthenticated, getUser, isEmailVerified }
