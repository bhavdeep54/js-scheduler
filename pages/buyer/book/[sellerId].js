// pages/buyer/book/[sellerId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../../components/Header';

export default function BookSeller() {
  const router = useRouter();
  const { sellerId } = router.query;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    fetchSlots();
  }, [sellerId, date]);

  async function fetchSlots() {
    setLoading(true);
    const res = await fetch(`/api/sellers/availability?sellerId=${sellerId}&date=${date}`);
    if (res.ok) {
      const j = await res.json();
      setSlots(j.available || []);
    } else {
      const text = await res.text();
      alert('Error: ' + text);
    }
    setLoading(false);
  }

  async function bookSlot(start, end) {
    const confirmIt = confirm(`Book slot ${new Date(start).toLocaleString()} - ${new Date(end).toLocaleString()}?`);
    if (!confirmIt) return;
    const resp = await fetch('/api/bookings/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, start, end, summary: 'Meeting via Scheduler' })
    });
    if (resp.ok) {
      alert('Booked! Check your calendar.');
      router.push('/appointments');
    } else {
      const txt = await resp.text();
      alert('Failed to book: ' + txt);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <Header />
      <h2>Book Seller</h2>
      <div>
        <label>Date: <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
      </div>
      <div style={{ marginTop: 12 }}>
        {loading ? <div>Loading...</div> : (
          slots.length === 0 ? <div>No available slots on this date</div> : (
            <ul>
              {slots.map(s => (
                <li key={s.start} style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{new Date(s.start).toLocaleTimeString()} - {new Date(s.end).toLocaleTimeString()}</strong>
                    <button style={{ marginLeft: 8 }} onClick={() => bookSlot(s.start, s.end)}>Book</button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
