// pages/api/sellers/list.js
import connect from '../../../lib/mongoose';
import User from '../../../models/User';

export default async function handler(req, res) {
  await connect();
  const sellers = await User.find({ role: 'seller' }).select('name email picture').lean();
  res.json({ sellers });
}
