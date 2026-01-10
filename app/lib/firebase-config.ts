import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
