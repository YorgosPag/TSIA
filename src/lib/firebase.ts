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
    return !!config.apiKey && !config.apiKey.startsWith("YOUR_");
}

const configIsValid = isConfigValid(firebaseConfig);

// Initialize Firebase only if the config is valid
const app = configIsValid && getApps().length === 0 ? initializeApp(firebaseConfig) : (configIsValid ? getApp() : null);
const db = app ? getFirestore(app) : null;


export { app, db };
