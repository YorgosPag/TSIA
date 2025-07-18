
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration - ΑΝΤΙΚΑΤΑΣΤΗΣΤΕ ΜΕ ΤΑ ΔΙΚΑ ΣΑΣ ΣΤΟΙΧΕΙΑ
const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Function to check if the config is still using placeholder values
function isConfigValid(config: FirebaseOptions): boolean {
    if (!config.apiKey || config.apiKey.startsWith("YOUR_")) {
        return false;
    }
    if (!config.projectId || config.projectId.startsWith("YOUR_")) {
        return false;
    }
    return true;
}


// Initialize Firebase only if not already initialized and if config is valid
let app;
let db;

if (isConfigValid(firebaseConfig)) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
} else {
    console.error("Firebase config is not valid. Please update your configuration in src/lib/firebase.ts");
    // Set db to a value that won't cause the app to crash immediately,
    // the UI should handle the error.
    db = null;
}


export { app, db };
