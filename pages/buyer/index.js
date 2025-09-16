// pages/buyer/index.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Image from "next/image";

export default function BuyerList() {
  const [sellers, setSellers] = useState([]);
  useEffect(() => {
    fetch('/api/sellers/list').then(r => r.json()).then(j => setSellers(j.sellers || []));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <Header />
      <h2>Sellers</h2>
      <ul>
        {sellers.map(s => (
          <li key={s._id} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {s.picture ? <Image src={s.picture} width={48} height={48} alt="" /> : null}
              <div>
                <div><strong>{s.name}</strong></div>
                <div>{s.email}</div>
                <div><Link href={`/buyer/book/${s._id}`}><button>Book</button></Link></div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
