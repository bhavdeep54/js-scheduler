// pages/index.js
import Header from "../components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      <Header />

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
          Next.js Scheduler — Google Calendar Integration
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: "30px" }}>
          Schedule meetings easily with Google Calendar. Choose your role to get
          started:
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <Link href="/api/auth/google?role=buyer">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#1a73e8",
                color: "white",
              }}
            >
              👤 Sign in as Buyer
            </button>
          </Link>

          <Link href="/api/auth/google?role=seller">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#34a853",
                color: "white",
              }}
            >
              🛠️ Sign in as Seller
            </button>
          </Link>
        </div>

        <hr style={{ margin: "40px 0" }} />

        <div style={{ textAlign: "left", fontSize: "1rem", lineHeight: "1.6" }}>
          <h2 style={{ marginBottom: "10px" }}>How it works:</h2>
          <ul style={{ listStyle: "disc", paddingLeft: "20px" }}>
            <li>
              <strong>Sellers</strong> connect their Google Calendar and manage
              available time slots from the dashboard.
            </li>
            <li>
              <strong>Buyers</strong> browse available sellers and book a
              convenient meeting slot.
            </li>
            <li>
              Both parties automatically receive a{" "}
              <strong>Google Calendar event with a Meet link</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
