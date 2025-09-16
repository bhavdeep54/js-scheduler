// lib/auth.js
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

import connect from './mongoose';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'token';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET env var is required');
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export async function getSession(req) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    await connect();
    const user = await User.findById(payload.userId).lean();
    if (!user) return null;
    return { user, payload };
  } catch (e) {
    return null;
  }
}
