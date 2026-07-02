import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";
import { Search, SlidersHorizontal } from "lucide-react";

const searchSchema = z.object({
  cat: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["new", "price-asc", "price-desc"]).optional(),
});

export const Route = createFileRoute("/boutique")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Boutique — Memma & Maman" },
      { name: "description", content: "Parcourez notre boutique de parfums, soins et maquillage premium à prix déstockés." },
    ],
  }),
  component: Boutique,
});

function Boutique() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/boutique" });
  const [term, setTerm] = useState(search.q ?? "");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id,slug,name").order("sort_order");
      return data ?? [];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", search.cat ?? null, search.sort ?? "new"],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id,slug,name,brand,price,sale_price,images,is_new,category_id,categories(slug)")
        .eq("status", "published");
      if (search.sort === "price-asc") q = q.order("price", { ascending: true });
      else if (search.sort === "price-desc") q = q.order("price", { ascending: false });
      else q = q.order("created_at", { ascending: false });
      const { data } = await q.limit(60);
      const items = data ?? [];
      if (search.cat) {
        return items.filter((p: any) => p.categories?.slug === search.cat);
      }
      return items;
    },
  });

  const filtered = useMemo(() => {
    if (!search.q) return products;
    const t = search.q.toLowerCase();
    return products.filter(
      (p: any) => p.name.toLowerCase().includes(t) || (p.brand ?? "").toLowerCase().includes(t),
    );
  }, [products, search.q]);

  type S = z.infer<typeof searchSchema>;
  const setCat = (cat?: string) => navigate({ search: (s: S) => ({ ...s, cat }) });
  const setSort = (sort: S["sort"]) => navigate({ search: (s: S) => ({ ...s, sort }) });
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: (s: S) => ({ ...s, q: term || undefined }) });
  };

  return (
    <>
      <section className="border-b border-border/60 bg-[oklch(0.97_0.012_75)]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Notre boutique</p>
          <h1 className="font-serif text-5xl md:text-6xl">
            {search.cat
              ? categories.find((c) => c.slug === search.cat)?.name ?? "Boutique"
              : "Toute la sélection"}
          </h1>
          <p className="mt-4 text-muted-foreground">{filtered.length} produits</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat(undefined)}
              className={`px-4 py-2 text-xs uppercase tracking-widest border transition ${
                !search.cat ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"
              }`}
            >
              Tout
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-widest border transition ${
                  search.cat === c.slug
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <form onSubmit={submitSearch} className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Rechercher…"
                className="pl-9 pr-3 py-2 text-sm border border-border bg-background rounded-sm w-full md:w-56 focus:outline-none focus:border-primary transition"
              />
            </form>
            <div className="relative">
              <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={search.sort ?? "new"}
                onChange={(e) => setSort(e.target.value as S["sort"])}
                className="pl-9 pr-3 py-2 text-sm border border-border bg-background rounded-sm focus:outline-none focus:border-primary"
              >
                <option value="new">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p>Aucun produit ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
