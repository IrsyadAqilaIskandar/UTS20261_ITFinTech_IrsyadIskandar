import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../components/Header";
import { useCart } from "../lib/cart";
import { rupiah, TAX_RATE } from "../lib/format";

export default function Checkout() {
  const router = useRouter();
  const { cart, setQty } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);

  async function next() {
    setBusy(true); setError("");
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.map((i) => ({ productId: i._id, qty: i.qty })) }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Gagal membuat checkout"); setBusy(false); return; }
    router.push(`/payment?id=${d.id}`);
  }

  return (
    <>
      <Head><title>Checkout</title></Head>
      <Header step={1} title="Checkout" back="/" />
      <main className="wrap">
        {cart.length === 0 ? (
          <div className="panel pad">
            <p className="muted">Keranjang masih kosong. Pilih menu dulu.</p>
            <button className="cta" onClick={() => router.push("/")}>Lihat menu</button>
          </div>
        ) : (
          <>
            <section className="panel">
              {cart.map((i) => (
                <article className="item" key={i._id}>
                  <div className="grow">
                    <div className="name">{i.name}</div>
                    <div className="sub">{rupiah(i.price)} per item</div>
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(i._id, i.qty - 1)} aria-label="Kurangi">−</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i._id, i.qty + 1)} aria-label="Tambah">+</button>
                  </div>
                  <div className="tot">{rupiah(i.price * i.qty)}</div>
                </article>
              ))}
            </section>

            <section className="panel pad">
              <div className="sum"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
              <div className="sum"><span>Pajak (11%)</span><span>{rupiah(tax)}</span></div>
              <div className="sum total"><span>Total</span><span>{rupiah(subtotal + tax)}</span></div>
              {error && <p className="error">{error}</p>}
              <button className="cta" disabled={busy} onClick={next}>{busy ? "Memproses…" : "Lanjut ke pembayaran"}</button>
            </section>
          </>
        )}
      </main>
    </>
  );
}
