// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5QtMuZUMzscyVQD87iE0gHPXzQ06m7-k",
  authDomain: "confession-bbdd4.firebaseapp.com",
  projectId: "confession-bbdd4",
  storageBucket: "confession-bbdd4.appspot.com",
  messagingSenderId: "84315674586",
  appId: "1:84315674586:web:d1c1fa4373062bea6612e3",
  measurementId: "G-36D05HXLY8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
