// Firebase authentication 
import { auth } from '../config_files/firebase-admin-config.js'

// Utility functions
import { createJWTToken } from '../utils/firebase_utils/auth_utils.js'
import { setUser } from '../utils/firebase_utils/realtime_db_utils.js'
import { getCurrDateTime } from '../utils/date_utils/datetime.js'

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
        const uid = await auth
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

        registration_status.message = "user has registered successfully."
        registration_status.status = "success" 
        registration_status.jwt_token = await createJWTToken(uid)  //JWT token for authentication passed to frontend
        registration_status.redirect_url = "/authenticated"

        // Set user registration information to database
        const userInfo = {
            userID: uid,
            signedInWith: "email",
            authenticationMethods: {
                email: {
                    email: registerEmail,
                }
            },
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        await setUser(uid, userInfo)
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
        // Process form and send back response to frontend fetch request
        console.log("received register")
        let responseData = await handleRegistration(req.body)
        res.json(responseData)
    })
};

// Export all necessary routes and symbols
export { registerUserRoutes }