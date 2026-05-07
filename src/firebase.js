import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqSxx5acFifbz1SHOQz9Lyt6b_9kFOpvA",
  authDomain: "muse-hub-db.firebaseapp.com",
  projectId: "muse-hub-db",
  storageBucket: "muse-hub-db.firebasestorage.app",
  messagingSenderId: "1018851628636",
  appId: "1:1018851628636:web:f9e6962bc37ddcfb19b899"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);