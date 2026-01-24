// Firebase configuration for Village Vital web app
// Uses the same Firebase project as the Flutter app

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDTvU-C0_WFrFQf4POVu2qAOxhgDGFtQh8",
  authDomain: "smarthealthsurvilance.firebaseapp.com",
  projectId: "smarthealthsurvilance",
  storageBucket: "smarthealthsurvilance.firebasestorage.app",
  messagingSenderId: "527334408837",
  appId: "1:527334408837:web:9d278d5f9d61aff1bddfec",
  measurementId: "G-PRH2SRSH20"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics (client-side only)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
