// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBwLKLpD87S1UE1nbouznA9jf_iDOKjKe8",
    authDomain: "eliesports.firebaseapp.com",
    projectId: "eliesports",
    storageBucket: "eliesports.firebasestorage.app",
    messagingSenderId: "168108927899",
    appId: "1:168108927899:web:50bccb0c643053c4418f3e",
    measurementId: "G-34TZSGKG0Q"
};

// Initialize Firebase App (make sure it's initialized only once)
const app = initializeApp(firebaseConfig);

// Export Firestore database
const db = getFirestore(app);

export { db };
