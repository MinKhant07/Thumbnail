import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// We are not using Firebase Storage anymore, so we remove the import.

const firebaseConfig = {
  "projectId": "new-prototype-xn0xr",
  "appId": "1:407636448141:web:67decdaa498180e241e3c4",
  "storageBucket": "new-prototype-xn0xr.firebasestorage.app",
  "apiKey": "AIzaSyCa_hFXTXi9I0GbLKYQOloSPe5dWIf-GRE",
  "authDomain": "new-prototype-xn0xr.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "407636448141"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// We are not using Firebase Storage anymore, so we remove the storage export.
export { db };
