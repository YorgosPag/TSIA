// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3c-3X8P0o_m7Av6iuixd673ddtDM4d4s",
  authDomain: "tsia-96afd.firebaseapp.com",
  projectId: "tsia-96afd",
  storageBucket: "tsia-96afd.firebasestorage.app",
  messagingSenderId: "392609655230",
  appId: "1:392609655230:web:b9f3704dc56837b317f1ef",
  measurementId: "G-RV2TH9CW39"
};

// Initialize Firebase
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);

export { app, db };
