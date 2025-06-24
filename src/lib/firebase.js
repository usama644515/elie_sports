// lib/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyBwLKLpD87S1UE1nbouznA9jf_iDOKjKe8",
  authDomain: "eliesports.firebaseapp.com",
  projectId: "eliesports",
  storageBucket: "eliesports.firebasestorage.app",
  messagingSenderId: "168108927899",
  appId: "1:168108927899:web:50bccb0c643053c4418f3e",
  measurementId: "G-34TZSGKG0Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Initialize storage service

// Export services
export { db, auth, storage }; // Add storage to exports