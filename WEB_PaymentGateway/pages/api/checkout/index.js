import dbConnect from "../../../lib/db";
import Product from "../../../models/Product";
import Checkout from "../../../models/Checkout";
import { TAX_RATE } from "../../../lib/format";

// Body: { items: [{ productId, qty }] } — harga selalu dihitung ulang dari DB
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();
  const { items } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Keranjang kosong" });

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } }).lean();
  const lines = items
    .map((i) => {
      const p = products.find((x) => String(x._id) === i.productId);
      const qty = Math.max(1, parseInt(i.qty, 10) || 1);
      return p && { productId: p._id, name: p.name, price: p.price, qty };
    })
    .filter(Boolean);
  if (!lines.length) return res.status(400).json({ error: "Produk tidak ditemukan" });

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const checkout = await Checkout.create({ items: lines, subtotal, tax, total: subtotal + tax });
  res.status(201).json({ id: String(checkout._id) });
}
