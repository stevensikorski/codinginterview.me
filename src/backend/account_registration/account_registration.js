import { createUserWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth'

// Asynchronous function that handles registration with Firebase Authentication ('auth' object)
// Email registration
const handleRegistration = async (firebase_auth, userCredObj) => {
    const { fullName, registerEmail, registerPassword, confirmPassword } = userCredObj

    // Stores status of processing user registration and returns it
    var registration_status = {}
    // Perform basic checks on passwords 
    if (registerPassword != confirmPassword){
        registration_status.message = "passwords do not match."
        registration_status.status = "failed"
        return registration_status
    }

    try {
        // Await the user creation process
        await createUserWithEmailAndPassword(firebase_auth, registerEmail, registerPassword);        
        registration_status.message = "user has registered successfully."
        registration_status.status = "success" 
        return registration_status      
    } catch (error) {
        // Firebase error messages
        console.error("Error signing up:", error.message);

        registration_status.message = "invalid email or password"
        registration_status.status = "failed"
        return registration_status
    }
}

// Invoking this function will mount the routes to the specified paths
const registerUserRoutes = (app, firebase_auth) => {
    // Route handler for form submission
    app.post('/register', (req, res) => {
        // const { email, password } = req.body;
        console.log('printing request body...')
        console.log(req.body)

        let responseData = {
            message: 'Email registration is successful',
            status: 'success'
        };
        // Process form and send back response to frontend fetch request
        responseData = handleRegistration(firebase_auth, req.body)
        console.log(responseData)
        res.send(responseData)
        // Redirecting user to another path
        // console.log('redirecting user...')
        // res.redirect('http://localhost:3000/')
    })
};

// Export all necessary routes and symbols
export { registerUserRoutes }