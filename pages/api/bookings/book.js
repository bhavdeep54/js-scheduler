// pages/api/bookings/book.js
import { getSession } from '../../../lib/auth';
import connect from '../../../lib/mongoose';
import User from '../../../models/User';
import Seller from '../../../models/Seller';
import Appointment from '../../../models/Appointment';
import { decrypt } from '../../../lib/crypto';
import { oauthClientFromRefreshToken } from '../../../lib/googleClient';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const sess = await getSession(req);
  if (!sess || !sess.user) return res.status(401).send('Not authenticated');
  // buyer only
  if (sess.user.role !== 'buyer') return res.status(403).send('Only buyers can book');

  const { sellerId, start, end, summary = 'Appointment' } = req.body;
  if (!sellerId || !start || !end) return res.status(400).send('sellerId, start, end required');

  await connect();

  const sellerUser = await User.findById(sellerId);
  if (!sellerUser) return res.status(404).send('Seller not found');

  const sellerTokens = await Seller.findOne({ user: sellerId }).lean();
  const buyerTokens = await Seller.findOne({ user: sess.user._id }).lean(); // stored tokens for buyer if any

  if (!sellerTokens || !sellerTokens.encryptedRefreshToken) return res.status(400).send('Seller has not connected calendar');

  // check availability via seller freebusy
  const sellerRefresh = decrypt(sellerTokens.encryptedRefreshToken);
  const sellerAuth = oauthClientFromRefreshToken(sellerRefresh);
  const calendar = google.calendar({ version: 'v3', auth: sellerAuth });

  const fb = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(start).toISOString(),
      timeMax: new Date(end).toISOString(),
      items: [{ id: 'primary' }]
    }
  });

  const busy = fb.data.calendars.primary.busy || [];
  if (busy.length > 0) {
    return res.status(409).send('Selected slot is no longer available');
  }

  // create event on seller calendar (with buyer as attendee). Use conferenceData to create Google Meet
  const requestId = uuidv4();
  const event = {
    summary,
    start: { dateTime: new Date(start).toISOString() },
    end: { dateTime: new Date(end).toISOString() },
    attendees: [{ email: sellerUser.email }, { email: sess.user.email }],
    description: `Booked via Next.js Scheduler`,
    conferenceData: { createRequest: { requestId } }
  };

  const insertResp = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all'
  });

  const createdEvent = insertResp.data;
  const meetingLink =
    (createdEvent.hangoutLink) ||
    (createdEvent.conferenceData && createdEvent.conferenceData.entryPoints && createdEvent.conferenceData.entryPoints[0] && createdEvent.conferenceData.entryPoints[0].uri) ||
    '';

  // Optionally: create event on buyer calendar using buyer's refresh token (if buyer granted & we have token)
  if (buyerTokens && buyerTokens.encryptedRefreshToken) {
    try {
      const buyerRefresh = decrypt(buyerTokens.encryptedRefreshToken);
      const buyerAuth = oauthClientFromRefreshToken(buyerRefresh);
      const buyerCal = google.calendar({ version: 'v3', auth: buyerAuth });

      // create a mirror event for buyer (this will create a separate event in buyer calendar, we reuse meeting link in description)
      const buyerEvent = {
        summary,
        start: { dateTime: new Date(start).toISOString() },
        end: { dateTime: new Date(end).toISOString() },
        attendees: [{ email: sellerUser.email }, { email: sess.user.email }],
        description: `Booked via Next.js Scheduler. Join: ${meetingLink || ''}`
      };
      await buyerCal.events.insert({
        calendarId: 'primary',
        requestBody: buyerEvent,
        sendUpdates: 'all'
      });
    } catch (e) {
      // ignore non-fatal
      console.error('Failed to insert on buyer calendar', e);
    }
  }

  // store appointment in DB
  await Appointment.create({
    seller: sellerUser._id,
    buyer: sess.user._id,
    start: new Date(start),
    end: new Date(end),
    googleEventId: createdEvent.id,
    meetingLink
  });

  res.json({ ok: true, event: createdEvent });
}
