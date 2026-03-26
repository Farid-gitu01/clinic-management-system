// @/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDLrnt-w1CxWx3MSjI_rOQ-erZM3nGmmEc",
  authDomain: "clinic-management-c59f1.firebaseapp.com",
  projectId: "clinic-management-c59f1",
  storageBucket: "clinic-management-c59f1.firebasestorage.app",
  messagingSenderId: "279163413523",
  appId: "1:279163413523:web:98fb492521645cb9460be6",
  databaseURL: "https://clinic-management-c59f1-default-rtdb.firebaseio.com/",
};

// Initialize Firebase for SSR/Next.js environment
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;