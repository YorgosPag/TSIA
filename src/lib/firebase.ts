// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3c-3X8P0o_m7Av6iuixd673ddtDM4d4s",
  authDomain: "tsia-96afd.firebaseapp.com",
  projectId: "tsia-96afd",
  storageBucket: "tsia-96afd.appspot.com",
  messagingSenderId: "392609655230",
  appId: "1:392609655230:web:b9f3704dc56837b317f1ef",
  measurementId: "G-RV2TH9CW39"
};

// Initialize Firebase only if not already initialized
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
