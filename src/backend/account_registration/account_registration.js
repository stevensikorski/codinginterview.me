import { firebase_admin } from '../config_files/firebase-admin-config.js'
import { getAuth } from 'firebase-admin/auth'

// Asynchronous function that handles registration with Firebase Authentication ('auth' object)
// Email registration
const handleRegistration = async (userCredObj) => {
    const { fullName, registerEmail, registerPassword, confirmPassword } = userCredObj
    
    // Stores status of processing user registration and returns it
    var registration_status = {}
    if (registerPassword != confirmPassword){
        registration_status.message = "passwords do not match."
        registration_status.status = "failed"
        return registration_status
    }

    try {
        // Await the user creation process
        const firebase_auth = getAuth(firebase_admin)
        const uid = await firebase_auth
                .createUser({
                    email: registerEmail,
                    emailVerified: false, 
                    password: registerPassword,
                    displayName: fullName,
                    disabled: false
                })
                .then((userRecord) => {
                    return userRecord.uid
                })

    
        const jwt_token = await firebase_auth
                .createCustomToken(uid)
                .then((customToken) => {
                    return customToken 
                })
        registration_status.message = "user has registered successfully."
        registration_status.status = "success" 
        registration_status.jwt_token = jwt_token   //JWT token for authentication passed to frontend
        registration_status.redirect_url = "/authenticated"
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
const registerUserRoutes = (app) => {
    // Route handler for form submission
    app.post('/register', async (req, res) => {
        // const { email, password } = req.body;
        console.log('printing request body...')
        console.log(req.body)

        // Process form and send back response to frontend fetch request
        let responseData = await handleRegistration(req.body)
        console.log(responseData)
        res.json(responseData)
        // Redirecting user to another path
        // console.log('redirecting user...')
    })
};

// Export all necessary routes and symbols
export { registerUserRoutes }