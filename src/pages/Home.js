import React, { useState, useEffect, useContext } from "react";
import { db } from "../services/firebase";  // Ensure firebase.js exports 'db'
import AuthContext from "../context/AuthContext";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  where,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
} from "firebase/firestore";
import ShowAttendees from "../components/ShowAttendees";

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [attendanceCount, setAttendanceCount] = useState(0);

  // 1. UseEffect to fetch user details and the latest attendance session
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      await getLocation();
      //checking if the user is and admin
      const adminDocRef = doc(db, "UserData", "Admins");
      const adminDocSnap = await getDoc(adminDocRef);
      if (
        adminDocSnap.exists() &&
        adminDocSnap.data().adminEmails.includes(user.email)
      ) {
        setIsAdmin(true);
      }
      // fetching users attendance count
      const userDocRef = doc(db, "Users", user.email.replace(/[@.]/g, "_"));
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setAttendanceCount(data.attendanceCount || 0);
      }
    };

    // Fetch the latest attendance session details
    const fetchLatestAttendanceSession = async () => {
      try {
        const sessionQuery = query(
          collection(db, "attendance"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const sessionSnapshot = await getDocs(sessionQuery);

        if (!sessionSnapshot.empty) {
          const sessionDoc = sessionSnapshot.docs[0];
          const sessionData = sessionDoc.data();
          setAttendanceEnabled(sessionData.enabled);
        }
      } catch (error) {
        console.error("Error fetching latest attendance session:", error);
      }
    };

    // Call both async functions
    fetchUserDetails();
    fetchLatestAttendanceSession();
  }, [user]);

  const getLocation  = async () => {
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        }
      );
    }else{
      alert("geolocation not supported");
      return 0;
    };
    return 1;
  }

  // 2. Toggle attendance if admin
 const toggleAttendance = async () => {
  if (!isAdmin) return;
  await getLocation();
  if (!userLocation.latitude) return;
  const attendanceRef = collection(db, "attendance");
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  let sessionRef;

  if (attendanceEnabled) {
    const q = query(
      attendanceRef,
      orderBy("timestamp", "desc"),
      limit(1) // Get the latest session
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestSession = querySnapshot.docs[0];
      sessionRef = doc(db, "attendance", latestSession.id);
      await setDoc( sessionRef, { enabled: false }, { merge: true } );
    }
    setAttendanceEnabled(!attendanceEnabled);
  } else {
    const q = query(
      attendanceRef,
      where("timestamp", ">", twoHoursAgo),
      orderBy("timestamp", "desc"),
      limit(1) 
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const latestSession = querySnapshot.docs[0];
      sessionRef = doc(db, "attendance", latestSession.id);
    } else {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      sessionRef = doc(db, "attendance", timestamp);
    }
    await setDoc(
      sessionRef,
      {
        enabled: true,
        adminLocation: userLocation,
        timestamp: new Date(),
        startAdminName: user?.displayName || "Unknown"
      },
      { merge: true }
    );
    setAttendanceEnabled(!attendanceEnabled);
  }
};

  // 3. Mark attendance for the current user
  const markAttendance = async () => {
    if (!user) return alert("no valid user found");
    let sessionData;
    let sessionDoc;
    try {
      const sessionQuery = query(
        collection(db, "attendance"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      const sessionSnapshot = await getDocs(sessionQuery);

      if (!sessionSnapshot.empty) {
        sessionDoc = sessionSnapshot.docs[0];
        sessionData = sessionDoc.data();
        if(!sessionData.enabled) return alert("Attendance is disabled");
      }
    } catch (error) {
      alert("Error fetching latest attendance session: ", error);
    }
  
    if (!userLocation) return alert("Location not found");
    const distance = getDistance(userLocation, sessionData.adminLocation);
    
    if (distance > 100) return alert("You are not within 100m of the admin");

    // Check if user has already marked attendance
    const attendeesRef = doc(db, "attendance", sessionDoc.id, "attendees", user.email);
    const attendeeDoc = await getDoc(attendeesRef);
    if (attendeeDoc.exists()) return alert("You have already marked attendance");

    // Mark attendance
    await setDoc(attendeesRef, {
      name: user.displayName,
      email: user.email,
      timestamp: new Date(),
      distance: distance,
    });

    // Increase user's attendanceCount in "Users" collection
    const userRef = doc(db, "Users", user.email.replace(/[@.]/g, "_"));
    await updateDoc(userRef, {
      attendanceCount: increment(1),
    });
    setAttendanceCount(prevCount => prevCount + 1);
    alert("Attendance marked successfully");
  };

  // Helper to calculate distance (in meters) between two lat/lng points
  const getDistance = (loc1, loc2) => {
    const R = 6371e3; // Earth's radius in meters
    const lat1 = (loc1.latitude * Math.PI) / 180;
    const lat2 = (loc2.latitude * Math.PI) / 180;
    const deltaLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const deltaLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div>
      <h1>Welcome, {user?.displayName || "Guest"}</h1>

      <p>Total Attendances: {attendanceCount}</p>

      <button onClick={markAttendance}>Mark Attendance</button>

      {isAdmin && (
        <button onClick={toggleAttendance}>
          {attendanceEnabled ? "Stop Attendance" : "Start Attendance"}
        </button>
      )}

      <button onClick={logout}>Logout</button>
      {isAdmin && <ShowAttendees />}
    </div>
  );
};
export default HomePage;
