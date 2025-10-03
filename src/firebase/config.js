import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyD8zwPZZiUIGMyV7LMepyi-wSYRdPDLk",
  authDomain: "metro-supply-orders-7187-7a030.firebaseapp.com",
  projectId: "metro-supply-orders-7187-7a030",
  storageBucket: "metro-supply-orders-7187-7a030.firebasestorage.app",
  messagingSenderId: "487168245729",
  appId: "1:487168245729:web:5a6f0b7a33e3796b279ca0",
  measurementId: "G-YJMSH1BJ8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
