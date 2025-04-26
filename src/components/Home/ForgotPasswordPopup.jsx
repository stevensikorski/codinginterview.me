import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordPopup = ({ isOpen, closeModal, openLoginModal }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
      setTimeout(() => {
        closeModal();
        openLoginModal();
      }, 3000);
    } catch (error) {
      console.log(error);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-dark/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] transform transition-all duration-500 ease-in-out scale-100">
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-6">
              Reset Password
            </h2>
            <form onSubmit={handlePasswordReset}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-0"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              {message && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mb-6 text-center text-sm text-gray-600">
                We'll send you an email with a link to reset your password.
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 font-bold bg-primary text-white rounded-lg text-base hover:bg-primary/90 disabled:bg-gray-400"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    openLoginModal();
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Back to Login
                </button>
              </div>
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

export default ForgotPasswordPopup;