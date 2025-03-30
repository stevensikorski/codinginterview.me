//function to get the JWT token from local storage
const getToken = () => {
    try {
      return localStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };
  
  //function to remove the token (for logout)
  const removeToken = () => {
    try {
      localStorage.removeItem('jwtToken');
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  };
  
  //function to check if user is authenticated
  const isAuthenticated = () => {
    return !!getToken();
  };
  
  export { getToken, removeToken, isAuthenticated };