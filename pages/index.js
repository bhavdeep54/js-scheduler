// pages/index.js
import Header from '../components/Header';

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: '20px auto', padding: 12 }}>
      <Header />
      <h1>Next.js Scheduler — Google Calendar Integration</h1>
      <p>Choose a role and sign in with Google:</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="/api/auth/google?role=buyer">
          <button>Sign in as Buyer</button>
        </a>
        <a href="/api/auth/google?role=seller">
          <button>Sign in as Seller</button>
        </a>
      </div>
      <hr style={{ margin: '20px 0' }} />
      <p>After signing in as Seller, go to <strong>Seller Dashboard</strong> to see calendar events.</p>
      <p>As Buyer, go to <strong>Buyers</strong> to choose a seller and book a slot.</p>
    </div>
  );
}
