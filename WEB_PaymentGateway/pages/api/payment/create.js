import dbConnect from "../../../lib/db";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";

const METHODS = {
  card: ["CREDIT_CARD"],
  ewallet: ["OVO", "DANA", "SHOPEEPAY", "LINKAJA"],
  bank: ["BCA", "BNI", "BRI", "MANDIRI", "PERMATA"],
};

// Body: { checkoutId, method, shipping: { name, phone, address } }
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();
  const { checkoutId, method, shipping } = req.body || {};
  const checkout = await Checkout.findById(checkoutId);
  if (!checkout) return res.status(404).json({ error: "Checkout tidak ditemukan" });
  if (checkout.status === "LUNAS") return res.status(400).json({ error: "Pesanan sudah lunas" });
  if (!METHODS[method]) return res.status(400).json({ error: "Metode pembayaran tidak valid" });
  if (!shipping?.name || !shipping?.address) return res.status(400).json({ error: "Nama dan alamat pengiriman wajib diisi" });

  checkout.shipping = shipping;
  checkout.status = "MENUNGGU";
  await checkout.save();

  const externalId = `INV-${checkout._id}-${Date.now()}`;
  const appUrl = process.env.APP_URL || `http://${req.headers.host}`;

  const xr = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64"),
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: checkout.total,
      currency: "IDR",
      description: `Pesanan ${checkout._id}`,
      payment_methods: METHODS[method],
      success_redirect_url: `${appUrl}/payment?id=${checkout._id}`,
      failure_redirect_url: `${appUrl}/payment?id=${checkout._id}`,
    }),
  });
  const invoice = await xr.json();
  if (!xr.ok) return res.status(502).json({ error: invoice.message || "Gagal membuat invoice Xendit" });

  await Payment.create({
    checkout: checkout._id,
    externalId,
    xenditInvoiceId: invoice.id,
    invoiceUrl: invoice.invoice_url,
    method,
    amount: checkout.total,
  });
  res.json({ invoiceUrl: invoice.invoice_url });
}
