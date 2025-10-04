// scripts/firebase-init.js
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyApHjPKfhxXw76DdHowCLOPWQzD2kuyyFw",
    authDomain: "friends-managment.firebaseapp.com",
    projectId: "friends-managment",
    storageBucket: "friends-managment.appspot.com",
    messagingSenderId: "819108875979",
    appId: "1:819108875979:web:b20dea08d51a366df7d54e",
    measurementId: "G-6WT4JZFC64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Export so other scripts can use them
export { app, auth, db };
