"use client";
import * as React from "react";

export type CartLine = { productId: string; qty: number };
type CartContextType = {
  cart: CartLine[];
  addToCart: (id: string | number, qty: number) => void;
  incQty: (id: string | number) => void;
  decQty: (id: string | number) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;
  count: number;
};

const CartContext = React.createContext<CartContextType | null>(null);
const STORAGE_KEY = "pet24_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = (id: string | number, qty: number) =>
    setCart((c) => {
      const productId = String(id);
      const existing = c.find((l) => l.productId === productId);
      if (existing) return c.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l));
      return [...c, { productId, qty }];
    });
  const incQty = (id: string | number) => setCart((c) => c.map((l) => (l.productId === String(id) ? { ...l, qty: l.qty + 1 } : l)));
  const decQty = (id: string | number) => setCart((c) => c.map((l) => (l.productId === String(id) ? { ...l, qty: Math.max(1, l.qty - 1) } : l)));
  const removeItem = (id: string | number) => setCart((c) => c.filter((l) => l.productId !== String(id)));
  const clearCart = () => setCart([]);
  const count = cart.reduce((sum, l) => sum + l.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, incQty, decQty, removeItem, clearCart, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
