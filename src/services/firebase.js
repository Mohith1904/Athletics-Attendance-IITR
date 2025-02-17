import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXap36-70Vl1SBSE9elvyKWBM9NPBim-w",
  authDomain: "athletics-attendance.firebaseapp.com",
  databaseURL: "https://athletics-attendance-default-rtdb.firebaseio.com",
  projectId: "athletics-attendance",
  storageBucket: "athletics-attendance.firebasestorage.app",
  messagingSenderId: "822555078014",
  appId: "1:822555078014:web:4c159f6165eea90f22172f",
  measurementId: "G-ZTZKCHLMYS"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


export default app;
