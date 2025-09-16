// pages/api/appointments.js
import dbConnect from "../../lib/mongoose";
import Appointment from "../../models/Appointment";
import { getSession } from "../../lib/auth";

export default async function handler(req, res) {
  await dbConnect();
  const session = await getSession(req);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const appointments = await Appointment.find({
      $or: [{ buyer: session.userId }, { seller: session.userId }],
    }).populate("buyer seller");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}
