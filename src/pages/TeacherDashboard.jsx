import React, { useEffect, useState } from "react";
import { getAttendance } from "../utils/attendance";

const TeacherDashboard = () => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    setAttendance(getAttendance());
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Teacher Dashboard</h2>

      <h3>Attendance Records</h3>

      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.roll}</td>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherDashboard;
