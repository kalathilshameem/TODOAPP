// Import the Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCIPgJ6WG_QqVIUh19SNkFKhwQr0plth3U", // Your Firebase API key
    authDomain: "todo-108cc.firebaseapp.com", // Your Firebase Auth domain
    projectId: "todo-108cc", // Your Firebase project ID
    storageBucket: "todo-108cc.appspot.com", // Your Firebase Storage bucket
    messagingSenderId: "858399478617", // Your Firebase messaging sender ID
    appId: "1:858399478617:web:exampleappid", // Replace with your Firebase app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
