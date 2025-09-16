// pages/api/auth/google.js
import { generateAuthUrl } from '../../../lib/googleClient';

export default async function handler(req, res) {
  const role = req.query.role === 'seller' ? 'seller' : 'buyer';
  const url = generateAuthUrl(role);
  // redirect user to google auth url
  res.redirect(url);
}
