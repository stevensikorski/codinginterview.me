import React from "react";
import { firebase_client } from "../config_files/firebase-client-config.js"
import { getAuth, signInWithCustomToken, sendEmailVerification } from "firebase/auth"

// Email registration 
const handleEmail = async (event) => {
  event.preventDefault()

  // Form element that invoked the callback funciton
  const form = new FormData(event.target)
  const endpoint = 'http://localhost:3002/register'

  // Fetch API to connect to backend endpoint
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullName: form.get('fullname'),
      registerEmail: form.get('register-email'),
      registerPassword: form.get('register-password'),
      confirmPassword: form.get('confirm-password')
    })
  })
    
    if (!response.ok){
      throw new Error ("Error in response")
    }

    const data = await response.json()
    const auth = getAuth(firebase_client)
    // Check for existence of jwt_token passed by backend for authentication
    if (data.jwt_token){
      console.log("found jwt token: ", data.jwt_token)
      signInWithCustomToken(auth, data.jwt_token)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user

          // First, store the JWT token in localStorage so that user authentication state is tracked in multiple paths
          user.getIdToken().then((token) => {
            localStorage.setItem("jwtToken", token)
          })

          // EMAIL VERIFICATION (DISABLE WHEN TESTING)
          sendEmailVerification(user)
            .then(() => {
              console.log("Email verification sent!")
            })

          //redirect to /authenticated
          window.location.href = data.redirect_url
        })
        .catch((error) => {
          console.log("An error occurred: ", error)
        })
    }
}


const RegisterPopup = ({ isOpen, closeModal }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] transform transition-all duration-500 ease-in-out scale-100"> 
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
              Create an Account
            </h2>
            <form onSubmit={handleEmail}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-600"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="fullname"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-gray-600"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="register-email"
                  name="register-email"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="register-password"
                  name="register-password"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-bold bg-primary text-white rounded-lg text-base"
              >
                Register
              </button>
            </form>
                          <button
              onClick={closeModal}
              className="absolute top-3 right-4 cursor-pointer text-gray-600 hover:text-gray-900 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterPopup;