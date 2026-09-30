import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    shipping: { name: String, phone: String, address: String },
    status: { type: String, enum: ["MENUNGGU", "LUNAS", "KEDALUWARSA"], default: "MENUNGGU" },
  },
  { timestamps: true }
);

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
