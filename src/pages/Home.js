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
  arrayUnion,
} from "firebase/firestore";
import ShowAttendees from "../components/ShowAttendees";

const HomePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [attendanceEnabled, setAttendanceEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [showPersonalHistory, setShowPersonalHistory] = useState(false);
  const [personalAttendance, setPersonalAttendance] = useState([]);

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

  // Get admin name from Firestore user document
  let adminName = "Admin";
  try {
    const userDocRef = doc(db, "Users", user.email.replace(/[@.]/g, "_"));
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      adminName = userData.displayName || user.email.split('@')[0] || "Admin";
    }
  } catch (error) {
    console.error("Error fetching admin name:", error);
  }

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
        startAdminName: adminName
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
    const attendanceRecord = {
      sessionId: sessionDoc.id,
      timestamp: new Date(),
      distance: distance,
      adminName: sessionData.startAdminName || "Unknown",
      adminLocation: sessionData.adminLocation
    };

    await setDoc(attendeesRef, {
      name: user.displayName,
      email: user.email,
      ...attendanceRecord,
    });

    // Increase user's attendanceCount and add to attendances array in "Users" collection
    const userRef = doc(db, "Users", user.email.replace(/[@.]/g, "_"));
    await updateDoc(userRef, {
      attendanceCount: increment(1),
      attendances: arrayUnion(attendanceRecord)
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

  // Fetch personal attendance history
  const fetchPersonalAttendance = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "Users", user.email.replace(/[@.]/g, "_"));
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setPersonalAttendance(data.attendances || []);
      } else {
        setPersonalAttendance([]);
      }
      setShowPersonalHistory(true);
    } catch (error) {
      console.error("Error fetching personal attendance:", error);
      alert("Error fetching attendance history");
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '20px', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>🏃‍♂️ Athletics Attendance</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Track your progress and stay committed!</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h3 style={{ marginTop: '0', color: '#FFD700' }}>Your Stats</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>{attendanceCount}</p>
            <p>Total Attendances</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h3 style={{ marginTop: '0', color: '#FFD700' }}> Quick Actions</h3>
            <button onClick={markAttendance} style={{ background: 'linear-gradient(45deg, #4CAF50, #45a049)', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '25px', margin: '10px 5px', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>Mark Attendance</button>
            <button onClick={fetchPersonalAttendance} style={{ background: 'linear-gradient(45deg, #2196F3, #1976d2)', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '25px', margin: '10px 5px', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>View My History</button>
            <button onClick={logout} style={{ background: 'linear-gradient(45deg, #f44336, #d32f2f)', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '25px', margin: '10px 5px', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>Logout</button>
          </div>

          {isAdmin && (
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h3 style={{ marginTop: '0', color: '#FFD700' }}>Admin Controls</h3>
              <button onClick={toggleAttendance} style={{ background: attendanceEnabled ? 'linear-gradient(45deg, #f44336, #d32f2f)' : 'linear-gradient(45deg, #4CAF50, #45a049)', color: 'white', padding: '15px 30px', border: 'none', borderRadius: '25px', margin: '10px 5px', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', transition: 'all 0.3s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                {attendanceEnabled ? "Stop Attendance ❌" : "Start Attendance ✅"}
              </button>
            </div>
          )}
        </div>

        {showPersonalHistory && (
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px' }}>
            <h3 style={{ color: '#FFD700', marginTop: '0' }}>📅 Your Attendance History</h3>
            {personalAttendance.length === 0 ? (
              <p>No attendance records found.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {personalAttendance.map((att, index) => (
                  <div key={index} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p><strong>Date:</strong> {att.timestamp?.toDate().toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {att.timestamp?.toDate().toLocaleTimeString()}</p>
                    <p><strong>Admin:</strong> {att.adminName || 'Unknown'}</p>
                    <p><strong>Distance:</strong> {att.distance ? `${att.distance.toFixed(2)}m` : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowPersonalHistory(false)} style={{ background: 'linear-gradient(45deg, #FF9800, #e68900)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '20px', marginTop: '20px', cursor: 'pointer' }}>Close</button>
          </div>
        )}

        {isAdmin && <ShowAttendees />}
      </div>
    </div>
  );
};
export default HomePage;
