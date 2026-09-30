import Link from "next/link";
import { useRouter } from "next/router";

const LABELS = ["Pilih", "Checkout", "Bayar"];

export default function Header({ step, title, back, count }) {
  const router = useRouter();
  return (
    <header className="header">
      <div className="header-in">
        <div className="header-row">
          {back ? (
            <>
              <button className="back" onClick={() => router.push(back)}>‹ Kembali</button>
              <span className="title">{title}</span>
              <span style={{ width: 64 }} />
            </>
          ) : (
            <>
              <span className="brand">Kedai Kopi</span>
              <Link href="/checkout" className="pill" aria-label="Buka keranjang">
                Keranjang <b>{count}</b>
              </Link>
            </>
          )}
        </div>
        <div className="steps" aria-label="Langkah pemesanan">
          {LABELS.map((l, i) => (
            <span key={l} style={{ display: "contents" }}>
              {i > 0 && <hr />}
              <span className={"step" + (i === step ? " on" : i < step ? " done" : "")}>
                <i>{i < step ? "✓" : i + 1}</i>{l}
              </span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
