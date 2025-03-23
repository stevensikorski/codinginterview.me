// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "codinginterview-me.firebaseapp.com",
  databaseURL: "https://codinginterview-me-default-rtdb.firebaseio.com",
  projectId: "codinginterview-me",
  storageBucket: "codinginterview-me.firebasestorage.app",
  messagingSenderId: "397071209842",
  appId: "1:397071209842:web:b6c7dd9b3038a4d4a239eb",
  measurementId: "G-LTLRGDY1GD"
};

// Initialize Firebase
const firebase_client = initializeApp(firebaseConfig);
export { firebase_client }