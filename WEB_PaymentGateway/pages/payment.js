import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../components/Header";
import { useCart } from "../lib/cart";
import { rupiah } from "../lib/format";

const METHODS = [
  { id: "card", label: "Kartu kredit/debit", sub: "Visa, Mastercard, JCB" },
  { id: "ewallet", label: "E-wallet", sub: "OVO, DANA, ShopeePay, LinkAja" },
  { id: "bank", label: "Transfer bank", sub: "BCA, BNI, BRI, Mandiri, Permata" },
];

export default function Payment() {
  const router = useRouter();
  const { clear } = useCart();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [method, setMethod] = useState("card");
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch(`/api/checkout/${id}`).then((r) => r.json()).then(setData).catch(() => {});
  useEffect(() => { if (id) load(); }, [id]);

  // Setelah kembali dari Xendit, cek status tiap 4 detik sampai LUNAS (diubah otomatis oleh webhook)
  const status = data?.checkout?.status;
  const pending = data?.payment?.status === "PENDING";
  useEffect(() => {
    if (status === "LUNAS") { clear(); return; }
    if (!pending) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status, pending]);

  async function pay() {
    setBusy(true); setError("");
    const r = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId: id, method, shipping }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Pembayaran gagal dibuat"); setBusy(false); return; }
    window.location.href = d.invoiceUrl;
  }

  const set = (k) => (e) => setShipping({ ...shipping, [k]: e.target.value });
  const head = <Header step={2} title="Pembayaran aman" back="/checkout" />;

  if (!data) return <>{head}<main className="wrap"><p className="muted">Memuat…</p></main></>;
  if (data.error) return <>{head}<main className="wrap"><p className="error">{data.error}</p></main></>;
  const { checkout, payment } = data;
  const qty = checkout.items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Head><title>Pembayaran</title></Head>
      {head}
      <main className="wrap">
        {status === "LUNAS" ? (
          <section className="panel done">
            <div className="ok">✓</div>
            <h2>Pembayaran lunas</h2>
            <p className="muted">
              {rupiah(checkout.total)} diterima{payment?.paymentChannel ? ` via ${payment.paymentChannel}` : ""}. Terima kasih!
            </p>
            <button className="cta" onClick={() => router.push("/")}>Pesan lagi</button>
          </section>
        ) : (
          <>
            {pending && <div className="notice">Menunggu pembayaran… status berubah otomatis setelah Xendit mengonfirmasi.</div>}
            {status === "KEDALUWARSA" && <div className="notice bad">Invoice kedaluwarsa. Buat pembayaran baru di bawah.</div>}

            <section className="panel pad">
              <h2>Alamat pengiriman</h2>
              <div className="field"><label htmlFor="n">Nama penerima</label><input id="n" value={shipping.name} onChange={set("name")} /></div>
              <div className="field"><label htmlFor="p">No. telepon</label><input id="p" inputMode="tel" value={shipping.phone} onChange={set("phone")} /></div>
              <div className="field"><label htmlFor="a">Alamat lengkap</label><textarea id="a" rows={3} value={shipping.address} onChange={set("address")} /></div>
            </section>

            <section className="panel pad">
              <h2>Metode pembayaran</h2>
              {METHODS.map((m) => (
                <label key={m.id} className={"method" + (method === m.id ? " on" : "")}>
                  <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} />
                  <span className="dot" />
                  <span><b>{m.label}</b><small>{m.sub}</small></span>
                </label>
              ))}
            </section>

            <section className="panel pad">
              <h2>Ringkasan pesanan</h2>
              <div className="sum"><span>Item ({qty})</span><span>{rupiah(checkout.subtotal)}</span></div>
              <div className="sum"><span>Pajak</span><span>{rupiah(checkout.tax)}</span></div>
              <div className="sum total"><span>Total</span><span>{rupiah(checkout.total)}</span></div>
              {error && <p className="error">{error}</p>}
              <button className="cta gold" disabled={busy} onClick={pay}>{busy ? "Mengalihkan…" : "Konfirmasi & bayar"}</button>
            </section>
          </>
        )}
      </main>
    </>
  );
}
