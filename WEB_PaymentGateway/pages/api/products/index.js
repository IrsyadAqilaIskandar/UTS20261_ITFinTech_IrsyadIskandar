import dbConnect from "../../../lib/db";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await dbConnect();
  const { category, q } = req.query;
  const filter = {};
  if (category && category !== "All") filter.category = category;
  if (q) filter.name = { $regex: String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const products = await Product.find(filter).sort({ createdAt: 1 }).lean();
  res.json(products.map((p) => ({ ...p, _id: String(p._id) })));
}
