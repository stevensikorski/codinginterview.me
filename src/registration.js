import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth'
import express from 'express'

const app = express() 
const port = process.env.BACKEND_PORT

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Route handler for form submission
app.post('/foo', (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    console.log("Form submitted with email:", email, "and password:", password);

    // Process form 
    handleRegistration(auth, email, password)

    // Responding back to the user (could be a redirect, message, etc.)
    res.send(`Form submitted! Email: ${email}`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function handleRegistration(auth, email, password){
    try {
        // Await the user creation process
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
    
        console.log("User signed up: ", user);
        // Optionally: Redirect to another page or update UI
    
    } catch (error) {
        console.error("Error signing up:", error.message);
    }
}