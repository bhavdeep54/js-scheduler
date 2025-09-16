
// models/Seller.js
import mongoose from 'mongoose';

const SellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  encryptedRefreshToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
