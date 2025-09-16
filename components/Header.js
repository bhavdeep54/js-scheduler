// components/Header.js
import Link from 'next/link';
export default function Header({ user }) {
  return (
    <header style={{ padding: 12, borderBottom: '1px solid #eee', marginBottom: 20 }}>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/">Home</Link>
        <Link href="/buyer">Buyers</Link>
        <Link href="/seller/dashboard">Seller</Link>
        <Link href="/appointments">Appointments</Link>
      </nav>
      {user ? <div style={{ marginTop: 8 }}>Signed in: {user.name} ({user.role})</div> : null}
    </header>
  );
}
