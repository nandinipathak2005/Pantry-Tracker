// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore}   from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_siQdcQI-NGD20Z0kUkNhC_-VW4vdDZU",
  authDomain: "inventory-management-48cfc.firebaseapp.com",
  projectId: "inventory-management-48cfc",
  storageBucket: "inventory-management-48cfc.appspot.com",
  messagingSenderId: "214131096979",
  appId: "1:214131096979:web:2e905b9a1ad279803fbc66",
  measurementId: "G-7E4PW0S4WK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore}