import React, { useState } from "react";
import { getSessionsForDay } from "../services/fetchAttendees";

function ShowAttendees() {
  const [selectedDate, setSelectedDate] = useState("");
  const [sessions, setSessions] = useState([]);

  const handleDateChange = (e) => {
    // e.target.value is in "YYYY-MM-DD" format
    setSelectedDate(e.target.value);
  };

  const fetchSessions = async () => {
    if (!selectedDate) return;
    const dateObject = new Date(selectedDate);
    const fetchedSessions = await getSessionsForDay(dateObject);
    setSessions(fetchedSessions);
  };

  return (
    <div>
      <h2>Fetch Attendance Sessions</h2>
      <input type="date" value={selectedDate} onChange={handleDateChange} />
      <button onClick={fetchSessions}>Fetch Attendees</button>

      <div>
        <h3>Attendance Sessions for {selectedDate}</h3>
        {sessions.length === 0 && <p>No sessions found for this day.</p>}
        {sessions.map((session) => (
          <div key={session.id} style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "1rem" }}>
            <p>
              <strong>Session Timestamp:</strong>{" "}
              {session.timestamp?.toDate().toLocaleString() || "N/A"}
            </p>
            <p>
                <strong>
                    Attendance started by:
                </strong>
                {" "}
                {session.startAdminName || "Unknown"}
            </p>
            <p>
                <strong>
                    Total Attendance Count:
                </strong>{" "}
                {session.attendees ? session.attendees.length : 0}
            </p>
            <div>
              <strong>Attendees:</strong>
              {session.attendees && session.attendees.length > 0 ? (
                <ul>
                  {session.attendees.map((att, idx) => (
                    <li key={idx}>{att.name || "Unnamed User"}</li>
                  ))}
                </ul>
              ) : (
                <p>No attendees.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowAttendees;
