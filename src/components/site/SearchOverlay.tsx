import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatEUR } from "@/lib/cart";

type Result = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,price,sale_price,images")
        .eq("status", "published")
        .ilike("name", `%${query.trim()}%`)
        .limit(8);
      setResults(data ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] animate-fade">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-24 md:mt-32 px-5">
        <div className="bg-background border border-border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] animate-fade-up">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Search size={18} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un parfum, une marque..."
              className="flex-1 bg-transparent focus:outline-none text-base"
            />
            {loading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            <button onClick={onClose} aria-label="Fermer" className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          {query.trim() && !loading && results.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Aucun résultat pour « {query} »
            </p>
          )}

          {results.length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.map((r, i) => {
                const price = r.sale_price ?? r.price;
                return (
                  <Link
                    key={r.id}
                    to="/produit/$slug"
                    params={{ slug: r.slug }}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors animate-fade"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="h-14 w-14 shrink-0 bg-[oklch(0.96_0.015_60)] overflow-hidden">
                      {r.images?.[0] && (
                        <img src={r.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {r.brand && (
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.brand}</p>
                      )}
                      <p className="font-serif text-base truncate">{r.name}</p>
                    </div>
                    <p className="text-sm text-primary shrink-0">{formatEUR(price)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
