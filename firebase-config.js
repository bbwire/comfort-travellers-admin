// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYVzic_GYopmyT2vTkmB4RfLwmwlB75jo",
  authDomain: "comfort-ticketing-app.firebaseapp.com",
  projectId: "comfort-ticketing-app",
  storageBucket: "comfort-ticketing-app.appspot.com",
  messagingSenderId: "1093686163740",
  appId: "1:1093686163740:web:8a1393a60aedf3db2362d9",
  measurementId: "G-MR56S4RMPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);