import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "memma_wishlist_v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const has = (id: string) => items.some((i) => i.id === id);

  const toggle: WishlistContextValue["toggle"] = (item) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item],
    );
  };

  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));

  return (
    <WishlistContext.Provider value={{ items, toggle, has, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
