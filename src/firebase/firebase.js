import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxmEIcN4aQ8liG4FaYeBAsEqNLv8qtD5Q",
  authDomain: "musicflow-403ab.firebaseapp.com",
  projectId: "musicflow-403ab",
  storageBucket: "musicflow-403ab.firebasestorage.app",
  messagingSenderId: "80049215399",
  appId: "1:80049215399:web:baacdbcece567eb551c882"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();