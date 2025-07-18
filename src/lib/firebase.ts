// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// =================================================================================
// TODO: ΑΝΤΙΚΑΤΑΣΤΗΣΤΕ ΤΟ ΠΑΡΑΚΑΤΩ ΜΕ ΤΗ ΔΙΑΜΟΡΦΩΣΗ ΤΟΥ ΔΙΚΟΥ ΣΑΣ FIREBASE
//
// Πηγαίνετε στο https://console.firebase.google.com/
// 1. Επιλέξτε το project σας.
// 2. Πατήστε το εικονίδιο με το γρανάζι (Ρυθμίσεις) και επιλέξτε "Ρυθμίσεις project".
// 3. Στην καρτέλα "Γενικά", εντοπίστε την εφαρμογή web σας.
// 4. Επιλέξτε "Config" (Διαμόρφωση) και αντιγράψτε ολόκληρο το αντικείμενο `firebaseConfig`.
// 5. Επικολλήστε το εδώ, αντικαθιστώντας το παράδειγμα.
// =================================================================================
const firebaseConfig = {
  apiKey: "TODO: Add your api key",
  authDomain: "TODO: Add your auth domain",
  projectId: "TODO: Add your project id",
  storageBucket: "TODO: Add your storage bucket",
  messagingSenderId: "TODO: Add your messaging sender id",
  appId: "TODO: Add your app id"
};
// =================================================================================
// ΤΕΛΟΣ ΕΝΟΤΗΤΑΣ TODO
// =================================================================================


// Initialize Firebase
let app;
if (!getApps().length) {
    // Check if the config keys are placeholders
    if (firebaseConfig.apiKey.startsWith("TODO:")) {
        console.error("Firebase is not configured. Please add your Firebase credentials to src/lib/firebase.ts");
    }
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const db = getFirestore(app);

export { app, db };
