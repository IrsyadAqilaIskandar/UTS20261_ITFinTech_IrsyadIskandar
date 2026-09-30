import dbConnect from "../../../lib/db";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";

// Daftarkan URL ini di Dashboard Xendit > Settings > Webhooks > "Invoices paid" (& "Invoices expired"):
//   https://<domain-anda>/api/webhook/xendit
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Verifikasi bahwa request benar-benar dari Xendit
  if (req.headers["x-callback-token"] !== process.env.XENDIT_WEBHOOK_TOKEN) {
    return res.status(401).json({ error: "Token callback tidak valid" });
  }

  await dbConnect();
  const { external_id, status, paid_at, payment_channel, payment_method } = req.body || {};
  const payment = await Payment.findOne({ externalId: external_id });
  if (!payment) return res.status(200).json({ ok: true, note: "external_id tidak dikenal" });

  if (status === "PAID" || status === "SETTLED") {
    payment.status = "LUNAS";
    payment.paidAt = paid_at ? new Date(paid_at) : new Date();
    payment.paymentChannel = payment_channel || payment_method;
    await Checkout.findByIdAndUpdate(payment.checkout, { status: "LUNAS" }); // status LUNAS otomatis
  } else if (status === "EXPIRED") {
    payment.status = "EXPIRED";
    await Checkout.findOneAndUpdate({ _id: payment.checkout, status: "MENUNGGU" }, { status: "KEDALUWARSA" });
  }
  payment.callbackPayload = req.body;
  await payment.save();

  res.status(200).json({ ok: true }); // balas 200 agar Xendit tidak mengirim ulang
}
