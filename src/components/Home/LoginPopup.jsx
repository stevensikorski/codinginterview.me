import React from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebase_client } from "../config_files/firebase-client-config.js";

//handles login for email-password sign-in method on client side
const handleLogin = async (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const auth = getAuth(firebase_client);
  
  try {
    console.log(form.get('email'), form.get('password'));
    const userCredentials = await signInWithEmailAndPassword(auth, form.get('email'), form.get('password'));
    //signed in
    const user = userCredentials.user;
    const jwt_token = await user.getIdToken(true);
    localStorage.setItem("jwtToken", jwt_token);
    window.location.href = "/authenticated";
  } catch (error) {
    console.log(error);
  }
};

const LoginModal = ({ isOpen, closeModal }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] transform transition-all duration-500 ease-in-out scale-100">
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
              Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-600"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-bold bg-primary text-white rounded-lg text-base"
              >
                Login
              </button>
            </form>
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 cursor-pointer text-gray-600 hover:text-gray-900 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginModal;