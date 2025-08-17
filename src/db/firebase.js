// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNOUntD42lb7WtYWQ-RizZYInm4dPBAtU",
  authDomain: "solm-283c5.firebaseapp.com",
  projectId: "solm-283c5",
  storageBucket: "solm-283c5.firebasestorage.app",
  messagingSenderId: "577177431382",
  appId: "1:577177431382:web:8a63af849a2235b9ecbaf7",
  measurementId: "G-8NZM5TMS76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
