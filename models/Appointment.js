// models/Appointment.js
import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  googleEventId: String,
  meetingLink: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
