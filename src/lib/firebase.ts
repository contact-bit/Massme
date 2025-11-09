// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8f19Lxrm3kY3GWPeoFe52vdkeWPViQ7s",
  authDomain: "massme-v2.firebaseapp.com",
  projectId: "massme-v2",
  storageBucket: "massme-v2.firebasestorage.app",
  messagingSenderId: "225242654839",
  appId: "1:225242654839:web:05ce98599904f6c3073e72",
  measurementId: "G-KN01NKH1Z2",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
