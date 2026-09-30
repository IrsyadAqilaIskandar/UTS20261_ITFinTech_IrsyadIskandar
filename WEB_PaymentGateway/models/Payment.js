import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    checkout: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout", required: true },
    externalId: { type: String, required: true, unique: true }, // dikirim ke Xendit sebagai external_id
    xenditInvoiceId: String,
    invoiceUrl: String,
    method: String, // card | ewallet | bank
    amount: Number,
    status: { type: String, enum: ["PENDING", "LUNAS", "EXPIRED"], default: "PENDING" },
    paymentChannel: String, // diisi dari webhook
    paidAt: Date,
    callbackPayload: Object,
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
