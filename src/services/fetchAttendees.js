// attendanceService.js
import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
  } from "firebase/firestore";
 import { db } from "./firebase"; // Adjust this to your Firebase config file
  
  export async function getSessionsForDay(selectedDate) {
    const startOfDay = new Date(selectedDate);
    const endOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);
  
    // Convert to Firestore Timestamps
    const start = Timestamp.fromDate(startOfDay);
    const end = Timestamp.fromDate(endOfDay);
  
    // Query attendance sessions within the date range
    const attendanceRef = collection(db, "attendance");
    const sessionsQuery = query(
      attendanceRef,
      where("timestamp", ">=", start),
      where("timestamp", "<=", end)
    );
    const sessionSnapshot = await getDocs(sessionsQuery);
  
    // For each session, fetch its attendees subcollection
    const sessionsWithAttendees = await Promise.all(
      sessionSnapshot.docs.map(async (docSnap) => {
        const sessionData = docSnap.data();
        // Query the attendees subcollection for this session
        const attendeesRef = collection(db, "attendance", docSnap.id, "attendees");
        const attendeesSnapshot = await getDocs(attendeesRef);
        const attendees = attendeesSnapshot.docs.map((attDoc) => attDoc.data());
        return {
          id: docSnap.id,
          ...sessionData,
          attendees,
        };
      })
    );
    return sessionsWithAttendees;
  }
  