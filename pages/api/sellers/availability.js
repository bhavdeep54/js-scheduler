// pages/api/sellers/availability.js
import connect from '../../../lib/mongoose';
import Seller from '../../../models/Seller';
import User from '../../../models/User';
import { decrypt } from '../../../lib/crypto';
import { oauthClientFromRefreshToken } from '../../../lib/googleClient';
import { google } from 'googleapis';

// small helper split day into 30-min slots
function createSlots(startDate, endDate, slotMinutes = 30) {
  const slots = [];
  let cur = new Date(startDate);
  while (cur < endDate) {
    const next = new Date(cur.getTime() + slotMinutes * 60 * 1000);
    slots.push({ start: new Date(cur), end: new Date(next) });
    cur = next;
  }
  return slots;
}

export default async function handler(req, res) {
  // expects ?sellerId=<id>&date=YYYY-MM-DD
  const { sellerId, date } = req.query;
  if (!sellerId || !date) return res.status(400).send('sellerId and date required');

  await connect();
  const user = await User.findById(sellerId).lean();
  if (!user) return res.status(404).send('Seller not found');

  const sellerTokens = await Seller.findOne({ user: sellerId }).lean();
  if (!sellerTokens || !sellerTokens.encryptedRefreshToken) {
    return res.status(500).send('Seller has not connected calendar');
  }

  const refreshToken = decrypt(sellerTokens.encryptedRefreshToken);
  const auth = oauthClientFromRefreshToken(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  // build timeMin/timeMax for the whole day in ISO
  const dayStart = new Date(`${date}T00:00:00Z`);
  const dayEnd = new Date(`${date}T23:59:59Z`);

  // freebusy query
  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items: [{ id: 'primary' }]
    }
  });

  const busy = (fb.data.calendars && fb.data.calendars.primary && fb.data.calendars.primary.busy) || [];

  // generate candidate slots between 09:00-17:00 (business hours) in seller's timezone (we keep UTC to simplify)
  const businessStart = new Date(Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate(), 9, 0, 0));
  const businessEnd = new Date(Date.UTC(dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate(), 17, 0, 0));

  const slots = createSlots(businessStart, businessEnd, 30);

  // filter out slots that overlap busy periods or are in the past
  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  const now = new Date();
  const available = slots.filter(s => {
    if (s.start < now) return false;
    for (const b of busy) {
      const busyStart = new Date(b.start);
      const busyEnd = new Date(b.end);
      if (overlaps(s.start, s.end, busyStart, busyEnd)) return false;
    }
    return true;
  });

  res.json({
    date,
    available: available.map(s => ({ start: s.start.toISOString(), end: s.end.toISOString() }))
  });
}
