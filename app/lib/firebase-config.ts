import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-mNTcfRz7zBZq-SZClnXlfV6iTUuzkb4",
  authDomain: "nau-maternity-center.firebaseapp.com",
  projectId: "nau-maternity-center",
  storageBucket: "nau-maternity-center.firebasestorage.app",
  messagingSenderId: "383201138714",
  appId: "1:383201138714:web:be55d8879ce8f28c4899a3",
  measurementId: "G-7QXF454WNX"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
