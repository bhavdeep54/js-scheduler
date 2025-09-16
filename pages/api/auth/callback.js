// pages/api/auth/callback.js
import { exchangeCodeForTokens, createOAuthClient } from '../../../lib/googleClient';
import connect from '../../../lib/mongoose';
import User from '../../../models/User';
import Seller from '../../../models/Seller';
import { encrypt } from '../../../lib/crypto';
import { signToken } from '../../../lib/auth';
import { google } from 'googleapis';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code, state } = req.query;
  if (!code) return res.status(400).send('Missing code');

  let stateObj = { role: 'buyer' };
  try {
    if (state) stateObj = JSON.parse(state);
  } catch (e) {
    // ignore
  }

  const tokens = await exchangeCodeForTokens(code);
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ access_token: tokens.access_token, id_token: tokens.id_token });

  // fetch userinfo
  const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
  const { data } = await oauth2.userinfo.get();
  const googleId = data.id;
  const email = data.email;
  const name = data.name;
  const picture = data.picture;

  await connect();
  // create or update user
  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.create({ googleId, email, name, picture, role: stateObj.role || 'buyer' });
  } else {
    // update name/picture if changed and role if not set
    user.name = name;
    user.picture = picture;
    user.role = user.role || (stateObj.role || 'buyer');
    await user.save();
  }

  // If we have refresh_token, store it for sellers/buyers (we will store for both so we can create events on both calendars)
  if (tokens.refresh_token) {
    // store encrypted token in Seller collection if role === seller, else create Buyer-like entry
    // For simplicity store a Seller record only for users with role='seller'
    if (user.role === 'seller') {
      const encrypted = encrypt(tokens.refresh_token);
      // upsert seller record
      await Seller.findOneAndUpdate(
        { user: user._id },
        { user: user._id, encryptedRefreshToken: encrypted },
        { upsert: true, new: true }
      );
    } else {
      // also store for buyers: we can reuse Seller model name or create BuyerToken model.
      // For simplicity: store in Seller collection but this is fine for the challenge (mark role on User).
      // Upsert with user ref; keep tokens available to create events on buyer calendar too.
      const encrypted = encrypt(tokens.refresh_token);
      await Seller.findOneAndUpdate(
        { user: user._id },
        { user: user._id, encryptedRefreshToken: encrypted },
        { upsert: true, new: true }
      );
    }
  } else {
    // no refresh token returned (Google may not return refresh token if previously consented).
    // In that case we rely on previously stored token
  }

  // sign JWT and set cookie
 const token = signToken({ userId: String(user._id), role: user.role });

// set cookie
const cookieStr = serialize(process.env.SESSION_COOKIE_NAME || 'token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 30 // 30 days
});

res.setHeader('Set-Cookie', cookieStr);

  // redirect to dashboard based on role
  if (user.role === 'seller') {
    return res.redirect('/seller/dashboard');
  } else {
    return res.redirect('/buyer');
  }
}
