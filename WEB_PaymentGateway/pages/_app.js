import { useEffect, useState } from "react";
import { CartContext } from "../lib/cart";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const [cart, setCart] = useState([]); // [{ _id, name, price, qty }]
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("cart", JSON.stringify(cart)); }, [cart, ready]);

  const add = (p) =>
    setCart((c) => {
      const found = c.find((i) => i._id === p._id);
      return found
        ? c.map((i) => (i._id === p._id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { _id: p._id, name: p.name, price: p.price, qty: 1 }];
    });
  const setQty = (id, qty) =>
    setCart((c) => (qty < 1 ? c.filter((i) => i._id !== id) : c.map((i) => (i._id === id ? { ...i, qty } : i))));
  const clear = () => setCart([]);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, add, setQty, clear, count }}>
      <Component {...pageProps} />
    </CartContext.Provider>
  );
}
