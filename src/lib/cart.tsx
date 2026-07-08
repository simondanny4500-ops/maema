import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Parfum offert via la roue de la chance — prix à 0, quantité fixe, non cumulable. */
  isGift?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  /** Ajoute le parfum offert choisi au panier (remplace le cadeau précédent s'il existe). */
  addGift: (item: Omit<CartItem, "quantity" | "isGift">) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hasGift: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "memma_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartContextValue["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && !i.isGift);
      if (existing) {
        return prev.map((i) => (i.id === item.id && !i.isGift ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { ...item, quantity: qty, isGift: false }];
    });
  };
  const addGift: CartContextValue["addGift"] = (item) => {
    setItems((prev) => [...prev.filter((i) => !i.isGift), { ...item, quantity: 1, isGift: true }]);
  };
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) =>
    setItems((p) => p.map((i) => (i.id === id && !i.isGift ? { ...i, quantity: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.isGift ? 0 : i.price * i.quantity), 0);
  const hasGift = items.some((i) => i.isGift);

  return (
    <CartContext.Provider value={{ items, add, addGift, remove, updateQty, clear, count, subtotal, hasGift }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}
