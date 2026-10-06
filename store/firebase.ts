import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDkUWAK8W_n-qdDA7YDWpsRqXtQfVPvc1g",
  authDomain: "matchpoint-vp.firebaseapp.com",
  databaseURL: "https://matchpoint-vp-default-rtdb.firebaseio.com",
  projectId: "matchpoint-vp",
  storageBucket: "matchpoint-vp.firebasestorage.app",
  messagingSenderId: "67267342244",
  appId: "1:67267342244:web:5685d18053a4da80b25b31",
  measurementId: "G-LFDFELBYQE"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);