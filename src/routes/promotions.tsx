import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — Memma & Maman" },
      { name: "description", content: "Découvrez tous nos produits de beauté premium en promotion." },
    ],
  }),
  component: Promotions,
});

function Promotions() {
  const { data = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,price,sale_price,images,is_new")
        .eq("status", "published")
        .not("sale_price", "is", null)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <>
      <section className="bg-[oklch(0.94_0.03_25)] py-20 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Ventes privées</p>
          <h1 className="font-serif text-5xl md:text-6xl">Promotions</h1>
          <p className="mt-4 text-foreground/70">Des offres exclusives, tant qu'il en reste.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Aucune promotion pour le moment. Revenez bientôt !</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {data.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
