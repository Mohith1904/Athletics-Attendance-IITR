import { useState, useEffect } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
} from "firebase/auth";
import app from "../services/firebase";
import AuthContext from "./AuthContext";

// Import Firestore functions
import { db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await currentUser.reload();

        // Allow only IITR emails
        if (!currentUser.email.toLowerCase().endsWith("iitr.ac.in")) {
          await signOut(auth);
          setUser(null);
          setError("Only IITR emails allowed");
          setLoading(false);
          return;
        }

        // Generate a Firestore-friendly document ID from email
        const userDocId = currentUser.email.replace(/[@.]/g, "_");
        const userRef = doc(db, "Users", userDocId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Store the complete user object in Firestore
          const userData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            emailVerified: currentUser.emailVerified,
            phoneNumber: currentUser.phoneNumber || null,
            providerId: currentUser.providerData[0]?.providerId || "unknown",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            admin: false, // Default role
          };

          await setDoc(userRef, userData, { merge: true }); // Ensure all fields are stored
        } else {
          // Update last login time
          await setDoc(userRef, { lastLoginAt: new Date().toISOString() }, { merge: true });
        }
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Login with Google
  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
      setError("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
