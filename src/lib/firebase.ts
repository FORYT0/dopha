import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config — these values are intentionally public (security enforced by Firestore rules)
const firebaseConfig = {
  apiKey:            'AIzaSyASTxsK_MfvVDxpZf_1-MwO3duQuhp4sl8',
  authDomain:        'dopha-5002f.firebaseapp.com',
  projectId:         'dopha-5002f',
  storageBucket:     'dopha-5002f.firebasestorage.app',
  messagingSenderId: '307016651998',
  appId:             '1:307016651998:web:054a1b6708e915d8fb1e4f',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
