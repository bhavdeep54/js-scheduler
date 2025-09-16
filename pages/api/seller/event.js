// pages/api/seller/events.js
import { getSession } from '../../../lib/auth';
import connect from '../../../lib/mongoose';
import Seller from '../../../models/Seller';
import { decrypt } from '../../../lib/crypto';
import { oauthClientFromRefreshToken } from '../../../lib/googleClient';
import { google } from 'googleapis';

export default async function handler(req, res) {
  const sess = await getSession(req);
  if (!sess || !sess.user) return res.status(401).send('Not authenticated');
  // must be seller
  if (sess.user.role !== 'seller') return res.status(403).send('Not a seller');

  await connect();
  const tokens = await Seller.findOne({ user: sess.user._id }).lean();
  if (!tokens || !tokens.encryptedRefreshToken) return res.status(400).send('No refresh token');

  const refreshToken = decrypt(tokens.encryptedRefreshToken);
  const auth = oauthClientFromRefreshToken(refreshToken);
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days
  const resp = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });

  const events = (resp.data.items || []).map(e => ({
    id: e.id,
    summary: e.summary,
    start: e.start.dateTime || e.start.date,
    end: e.end.dateTime || e.end.date,
    attendees: e.attendees || [],
    hangoutLink: e.hangoutLink || (e.conferenceData && e.conferenceData.entryPoints && e.conferenceData.entryPoints[0] && e.conferenceData.entryPoints[0].uri) || ''
  }));

  res.json({ events });
}
