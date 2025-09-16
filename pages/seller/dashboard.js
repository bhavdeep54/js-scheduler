// pages/seller/dashboard.js
import { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function SellerDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/seller/events')
      .then(r => r.json())
      .then(j => setEvents(j.events || []))
      .catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <Header />
      <h2>Seller Dashboard</h2>
      <h3>Upcoming events</h3>
      <ul>
        {events.map(e => (
          <li key={e.id} style={{ marginBottom: 8 }}>
            <div><strong>{e.summary || 'No title'}</strong></div>
            <div>{new Date(e.start).toLocaleString()} - {new Date(e.end).toLocaleString()}</div>
            <div>{e.hangoutLink ? <a href={e.hangoutLink} target="_blank">Join Meet</a> : null}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
