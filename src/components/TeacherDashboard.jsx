import React, { useEffect, useState } from "react";
import { getAttendance, clearAttendance } from "../utils/attendance";

const TeacherDashboard = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    setAttendance(getAttendance());
  }, []);

  const handleRefresh = () => {
    setAttendance(getAttendance());
  };

  const handleClear = () => {
    if (window.confirm("Clear all attendance records?")) {
      clearAttendance();
      setAttendance([]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teacher Dashboard</h2>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={handleRefresh} style={{ marginRight: "10px" }}>
          Refresh
        </button>
        <button onClick={handleClear}>
          Clear Attendance (Demo)
        </button>
      </div>

      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>{record.name}</td>
                <td>{record.roll}</td>
                <td>{record.date}</td>
                <td>{record.time}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherDashboard;
