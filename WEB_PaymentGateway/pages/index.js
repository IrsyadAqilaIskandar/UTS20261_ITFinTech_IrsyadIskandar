import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Header from "../components/Header";
import { useCart } from "../lib/cart";
import { rupiah } from "../lib/format";

const CATEGORIES = ["All", "Drinks", "Snacks", "Bundles"];

export default function SelectItem() {
  const { cart, add, setQty, count } = useCart();
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/products?category=${category}&q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setProducts(Array.isArray(d) ? d : []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [category, q]);

  const qtyOf = (id) => cart.find((i) => i._id === id)?.qty || 0;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <Head><title>Kedai Kopi — Pilih Menu</title></Head>
      <Header step={0} count={count} />
      <main className="wrap">
        <input className="search" placeholder="Cari menu" aria-label="Cari menu" value={q} onChange={(e) => setQ(e.target.value)} />
        <nav className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={c === category ? "chip on" : "chip"} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </nav>

        {loading && <p className="muted">Memuat menu…</p>}
        {!loading && products.length === 0 && (
          <p className="muted">Menu belum ada. Buka <code>/api/seed</code> untuk mengisi data contoh.</p>
        )}
        <div className="grid">
          {products.map((p) => {
            const n = qtyOf(p._id);
            return (
              <article className={`card cat-${p.category}`} key={p._id}>
                <div>
                  <div className="name">{p.name}</div>
                  <div className="desc">{p.description}</div>
                  <div className="price">{rupiah(p.price)}</div>
                </div>
                {n === 0 ? (
                  <button className="add" onClick={() => add(p)}>Tambah</button>
                ) : (
                  <div className="qty">
                    <button onClick={() => setQty(p._id, n - 1)} aria-label="Kurangi">−</button>
                    <span>{n}</span>
                    <button onClick={() => setQty(p._id, n + 1)} aria-label="Tambah">+</button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>

      {count > 0 && (
        <div className="bar">
          <Link href="/checkout">
            <span>{count} item dipilih</span>
            <span>Lihat keranjang · {rupiah(total)}</span>
          </Link>
        </div>
      )}
    </>
  );
}
