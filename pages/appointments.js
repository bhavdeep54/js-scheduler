// pages/appointments.js
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then((j) => setAppointments(j || []))
      .catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <Header />
      <h2>Your Appointments</h2>
      <ul>
        {appointments.map((a) => (
          <li key={a._id} style={{ marginBottom: 12 }}>
            <div>
              <strong>
                {a.seller?.name} — {a.buyer?.name}
              </strong>
            </div>
            <div>
              {new Date(a.start).toLocaleString()} -{" "}
              {new Date(a.end).toLocaleString()}
            </div>
            {a.meetingLink ? (
              <div>
                <a href={a.meetingLink} target="_blank">
                  Join Meeting
                </a>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
