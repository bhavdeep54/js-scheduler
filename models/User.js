// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true, required: true },
  email: { type: String, index: true, required: true },
  name: String,
  picture: String,
  role: { type: String, enum: ['seller', 'buyer'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
