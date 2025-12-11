// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlu-HLrVOjxvttYEWae5ks8YmBxUNuBnM",
  authDomain: "sollungo-maami.firebaseapp.com",
  projectId: "sollungo-maami",
  storageBucket: "sollungo-maami.firebasestorage.app",
  messagingSenderId: "776648875112",
  appId: "1:776648875112:web:d132681846ec7a058fefdd",
  measurementId: "G-YWX7544W5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
