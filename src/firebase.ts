import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, inMemoryPersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

// Configuration from firebase-applet-config.json
export const firebaseConfig = {
  projectId: "perceptive-upgrade-j5jvd",
  appId: "1:884767084550:web:c831634bc0fae85125b387",
  apiKey: "AIzaSyA0XOGQXrkGkONikGcaT7Xfbnbi-Q7Bc7w",
  authDomain: "perceptive-upgrade-j5jvd.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-scootyride-46da1d3c-fc99-4f70-9b52-365ccc1ae2f0",
  storageBucket: "perceptive-upgrade-j5jvd.firebasestorage.app",
  messagingSenderId: "884767084550",
  measurementId: ""
};

let app;
let auth;
let db;
let isFirebaseAvailable = false;

try {
  // Initialize Firebase app
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Initialize Auth
  auth = getAuth(app);

  // Initialize Firestore with custom databaseId
  db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');
  
  isFirebaseAvailable = true;
  console.log("Firebase initialized successfully with database:", firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.error("Firebase failed to initialize. Falling back to local simulation mode:", error);
  isFirebaseAvailable = false;
}

export { app, auth, db, isFirebaseAvailable };
