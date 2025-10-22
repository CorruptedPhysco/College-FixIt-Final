import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "your-api-key" && 
         firebaseConfig.projectId !== "your-project-id";
};

// Check if we should force localStorage mode
const shouldForceLocalStorage = () => {
  return import.meta.env.VITE_FORCE_LOCALSTORAGE === 'true';
};

// Initialize Firebase only if properly configured and not forced to localStorage
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured() && !shouldForceLocalStorage()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  if (shouldForceLocalStorage()) {
    console.log('Forced to use localStorage mode');
  } else {
    console.warn('Firebase not configured. Please set up your .env.local file with Firebase credentials.');
    console.warn('The app will use localStorage as fallback for data storage.');
  }
}

export { auth, db };
export default app;