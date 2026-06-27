import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Env vars are used when available (local dev); hardcoded values are the
// production fallback so Firebase always initialises on the deployed site.
// Firebase config is intentionally public — security is enforced via
// Firestore security rules, not by hiding these values.
const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyASTxsK_MfvVDxpZf_1-MwO3duQuhp4sl8',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'dopha-5002f.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'dopha-5002f',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'dopha-5002f.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '307016651998',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:307016651998:web:054a1b6708e915d8fb1e4f',
};

// Only initialise Firebase when all required env vars are present
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

if (isFirebaseConfigured) {
  _app = getApps().length ? getApps()[0] : initializeApp(config);
  _db = getFirestore(_app);
}

export const db = _db;
