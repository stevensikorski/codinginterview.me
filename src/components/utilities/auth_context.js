// Function to get the JWT token from local storage
const getToken = () => {
    return localStorage.getItem('jwtToken');
};

export { getToken }
