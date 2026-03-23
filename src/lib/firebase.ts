import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with user's firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDn6Q0c2ncAE0TdB_8aeA-qLilbl5Eym00",
  authDomain: "learning-app-forjc.firebaseapp.com",
  projectId: "learning-app-forjc",
  storageBucket: "learning-app-forjc.firebasestorage.app",
  messagingSenderId: "666103578102",
  appId: "1:666103578102:web:4b4c45d9039f7fffa09bd7",
  measurementId: "G-74S6M271K2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
