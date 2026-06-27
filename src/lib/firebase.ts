import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const config = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
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
