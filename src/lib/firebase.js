// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0D4w5zcP8XfNHaID5PKHAjmrK6W_kkfE",
  authDomain: "sol-maami.firebaseapp.com",
  projectId: "sol-maami",
  storageBucket: "sol-maami.firebasestorage.app",
  messagingSenderId: "95079224506",
  appId: "1:95079224506:web:101c6ec34cf9a17daa1e83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const db = getFirestore(app);

//auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
