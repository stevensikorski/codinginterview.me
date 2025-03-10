import { createUserWithEmailAndPassword } from 'firebase/auth'

// Asynchronous function that handles registration with Firebase Authentication ('auth' object)
const handleRegistration = async (firebase_auth, email, password) => {
    try {
        // Await the user creation process
        const userCred = await createUserWithEmailAndPassword(firebase_auth, email, password);
        const user = userCred.user;
    
        console.log("User signed up: ", user);        
    } catch (error) {
        console.error("Error signing up:", error.message);
    }
}

// Invoking this function will mount the routes to the specified paths
const registerUserRoutes = (app, firebase_auth) => {
    // Route handler for form submission
    app.post('/register', (req, res) => {
        const { email, password } = req.body;

        // Process form 
        handleRegistration(firebase_auth, email, password);

        // Responding back to the user 
        // res.send(`Form submitted! Email: ${email}`);

        // Redirecting user to another path
        console.log('redirecting user...')
        res.redirect('https://example.com')
    })
};

// Export all necessary routes and symbols
export { registerUserRoutes }