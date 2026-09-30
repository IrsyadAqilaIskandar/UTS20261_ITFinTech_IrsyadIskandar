import dbConnect from "../../../lib/db";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";

// Dipakai halaman Payment (dan polling status LUNAS)
export default async function handler(req, res) {
  await dbConnect();
  const checkout = await Checkout.findById(req.query.id).lean();
  if (!checkout) return res.status(404).json({ error: "Checkout tidak ditemukan" });
  const payment = await Payment.findOne({ checkout: checkout._id }).sort({ createdAt: -1 }).lean();
  res.json({ checkout, payment });
}
