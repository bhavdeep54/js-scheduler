import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Header from "../../../components/Header";

export default function BookSeller() {
  const router = useRouter();
  const { sellerId } = router.query;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sellers/availability?sellerId=${sellerId}&date=${date}`
      );
      if (res.ok) {
        const j = await res.json();
        setSlots(j.available || []);
      } else {
        const errText = await res.text();
        alert("Error fetching slots: " + errText);
      }
    } catch (err) {
      console.error("Fetch slots error", err);
      alert("Failed to load slots. Please try again.");
    }
    setLoading(false);
  }, [sellerId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  async function bookSlot(start, end) {
    const confirmIt = confirm(
      `Book slot ${new Date(start).toLocaleString()} - ${new Date(
        end
      ).toLocaleString()}?`
    );
    if (!confirmIt) return;

    try {
      const resp = await fetch("/api/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          start,
          end,
          summary: "Meeting via Scheduler",
        }),
      });

      if (resp.ok) {
        alert("🎉 Booked successfully! Check your calendar.");
        router.push("/appointments");
      } else {
        // Try parsing JSON error first
        let errMsg = "Failed to book";
        try {
          const data = await resp.json();
          if (data.error) errMsg = data.error;
        } catch {
          // fallback to text if not JSON
          const txt = await resp.text();
          if (txt) errMsg = txt;
        }
        alert("⚠️ " + errMsg);
      }
    } catch (err) {
      console.error("Book slot error", err);
      alert("Something went wrong while booking. Try again.");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <Header />
      <h2>📅 Book Seller</h2>
      <div>
        <label>
          Date:{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        {loading ? (
          <div>Loading...</div>
        ) : slots.length === 0 ? (
          <div>No available slots on this date</div>
        ) : (
          <ul>
            {slots.map((s) => (
              <li key={s.start} style={{ marginBottom: 8 }}>
                <div>
                  <strong>
                    {new Date(s.start).toLocaleTimeString()} -{" "}
                    {new Date(s.end).toLocaleTimeString()}
                  </strong>
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => bookSlot(s.start, s.end)}
                  >
                    Book
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
