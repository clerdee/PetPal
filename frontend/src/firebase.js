// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    FacebookAuthProvider 
} from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID
};

console.log("🔥 Initializing Firebase with config:", firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// ⭐️ Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => console.log("✅ Firestore offline persistence enabled"))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("⚠️ Multiple tabs open, offline persistence disabled");
    } else if (err.code === 'unimplemented') {
      console.warn("⚠️ Browser doesn't support offline persistence");
    } else {
      console.error("❌ Firestore persistence error:", err);
    }
  });

console.log("✅ Firebase initialized successfully"); 