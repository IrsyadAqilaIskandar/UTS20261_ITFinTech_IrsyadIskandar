import dbConnect from "../../lib/db";
import Product from "../../models/Product";

const DATA = [
  { name: "Kopi Susu Gula Aren", description: "Es kopi susu, 350 ml", price: 22000, category: "Drinks" },
  { name: "Teh Tarik", description: "Teh susu hangat", price: 18000, category: "Drinks" },
  { name: "Jus Jeruk", description: "Jeruk peras segar", price: 20000, category: "Drinks" },
  { name: "Keripik Tempe", description: "Renyah, 100 g", price: 15000, category: "Snacks" },
  { name: "Roti Bakar Cokelat", description: "Cokelat dan keju", price: 17000, category: "Snacks" },
  { name: "Pisang Goreng", description: "6 potong", price: 14000, category: "Snacks" },
  { name: "Paket Ngopi Berdua", description: "2 kopi susu + 1 roti bakar", price: 55000, category: "Bundles" },
  { name: "Paket Camilan Kantor", description: "3 keripik + 3 teh tarik", price: 89000, category: "Bundles" },
];

// Buka sekali di browser: /api/seed (isi ulang data contoh)
export default async function handler(req, res) {
  await dbConnect();
  await Product.deleteMany({});
  const created = await Product.insertMany(DATA);
  res.json({ inserted: created.length });
}
