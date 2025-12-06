import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL CONFIG KEYS
const firebaseConfig = {
  apiKey: "AIzaSyBx90weJ7MO6vcXvS4KYpecOFNxZql6fDI",
  authDomain: "newhijabcollection-d625a.firebaseapp.com",
  projectId: "newhijabcollection-d625a",
  storageBucket: "newhijabcollection-d625a.firebasestorage.app",
  messagingSenderId: "658968155062",
  appId: "1:658968155062:web:d3eec286526f4453992717",
  measurementId: "G-58FSHZZ2MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
