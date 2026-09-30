# WEB_PaymentGateway

Next.js (Pages Router) + MongoDB (Mongoose) + Xendit Invoice + webhook.

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env.local`, lalu isi `MONGODB_URI`, `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`, `APP_URL`.
3. `npm run dev`, lalu buka `http://localhost:3000/api/seed` sekali untuk mengisi produk contoh.
4. Buka `http://localhost:3000`.

## Alur
Select Item (`/`) → Checkout (`/checkout`) → Payment (`/payment?id=...`) → halaman bayar Xendit → kembali ke `/payment` (status LUNAS otomatis).

## Koleksi MongoDB
- **Product**: name, description, price, category
- **Checkout**: items (snapshot nama/harga/qty), subtotal, tax, total, shipping, status (MENUNGGU/LUNAS/KEDALUWARSA)
- **Payment**: checkout, externalId, xenditInvoiceId, invoiceUrl, method, amount, status (PENDING/LUNAS/EXPIRED), paidAt, paymentChannel

## Webhook Xendit
Endpoint: `POST /api/webhook/xendit`
1. Deploy ke Vercel/Netlify atau jalankan `ngrok http 3000`.
2. Dashboard Xendit → Settings → Webhooks → isi URL `https://<domain>/api/webhook/xendit` untuk **Invoices paid** dan **Invoices expired**.
3. Salin *Webhook verification token* ke `XENDIT_WEBHOOK_TOKEN` (dicek lewat header `x-callback-token`).
4. Set `APP_URL` ke domain publik agar redirect setelah bayar kembali ke aplikasi.
Pada Vercel, isi semua environment variable di Project Settings.
