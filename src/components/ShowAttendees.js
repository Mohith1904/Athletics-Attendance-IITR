import React, { useState } from "react";
import { getSessionsForDay } from "../services/fetchAttendees";

function ShowAttendees() {
  const [selectedDate, setSelectedDate] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const fetchSessions = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const dateObject = new Date(selectedDate);
      const fetchedSessions = await getSessionsForDay(dateObject);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '15px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', marginTop: '20px' }}>
      <h2 style={{ color: '#FFD700', marginTop: '0', textAlign: 'center' }}> Admin Dashboard - View Attendance</h2>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', fontWeight: 'bold' }}>Select Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={handleDateChange}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
          />
        </div>
        <button 
          onClick={fetchSessions}
          disabled={loading}
          style={{ 
            background: 'linear-gradient(45deg, #2196F3, #1976d2)', 
            color: 'white', 
            padding: '12px 25px', 
            border: 'none', 
            borderRadius: '25px', 
            fontSize: '1rem', 
            cursor: loading ? 'not-allowed' : 'pointer', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
            transition: 'all 0.3s',
            marginTop: '20px'
          }}
          onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
        >
          {loading ? '🔄 Fetching...' : '🔍 Fetch Attendees'}
        </button>
      </div>

      <div>
        {selectedDate && <h3 style={{ color: '#FFD700', textAlign: 'center' }}>Attendance Sessions for {new Date(selectedDate).toLocaleDateString()}</h3>}
        {sessions.length === 0 && selectedDate && !loading && <p style={{ textAlign: 'center', opacity: 0.8 }}>No sessions found for this day.</p>}
        {sessions.map((session) => (
          <div key={session.id} style={{ background: 'rgba(255,255,255,0.05)', margin: '15px 0', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#FFD700' }}>⏰ Session Time:</strong>
                <p>{session.timestamp?.toDate().toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <strong style={{ color: '#FFD700' }}>👨‍💼 Started by:</strong>
                <p>{session.startAdminName || "Unknown"}</p>
              </div>
              <div>
                <strong style={{ color: '#FFD700' }}>👥 Total Attendees:</strong>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{session.attendees ? session.attendees.length : 0}</p>
              </div>
            </div>
            <div>
              <strong style={{ color: '#FFD700' }}>📝 Attendees List:</strong>
              {session.attendees && session.attendees.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {session.attendees.map((att, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {att.name || "Unnamed User"}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ opacity: 0.7 }}>No attendees for this session.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowAttendees;
