import { useQuery } from "@tanstack/react-query";
import { Check, Gift, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isEligibleFreePerfume } from "@/lib/products";
import { useWheelReward, type FreePerfumeSelection } from "@/lib/wheel-reward";

export function FreePerfumeGift() {
  const { wonFreePerfume, selectedPerfume, selectFreePerfume } = useWheelReward();

  const { data: perfumes = [], isLoading } = useQuery({
    queryKey: ["free-perfumes-35ml"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,images,stock,short_description,sku,categories(slug)")
        .eq("status", "published")
        .gt("stock", 0)
        .order("name");
      return (data ?? []).filter(isEligibleFreePerfume);
    },
    enabled: wonFreePerfume,
  });

  if (!wonFreePerfume) return null;

  const handleSelect = (product: (typeof perfumes)[number]) => {
    const selection: FreePerfumeSelection = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? "",
    };
    if (selectedPerfume?.id === product.id) {
      selectFreePerfume(null);
    } else {
      selectFreePerfume(selection);
    }
  };

  return (
    <section className="mb-8 animate-fade-up">
      <div className="bg-gradient-to-br from-primary/15 via-secondary/30 to-accent/40 border border-primary/25 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Gift size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl md:text-2xl">Votre parfum offert</h2>
            <p className="mt-1 text-sm text-foreground/75">
              Félicitations ! Vous avez gagné un parfum offert pour tout achat.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 bg-background/70 border border-primary/20 p-3.5">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/85 leading-relaxed">
            <strong className="text-primary">Important :</strong> l'offre concerne{" "}
            <strong>obligatoirement un parfum au format 35 ml</strong>. Vous pouvez
            sélectionner <strong>un seul parfum offert</strong> parmi les modèles
            éligibles ci-dessous.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : perfumes.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground text-center py-6">
            Aucun parfum en 35 ml n'est disponible pour le moment. Votre gain reste
            valable — revenez bientôt !
          </p>
        ) : (
          <>
            <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">
              Choisissez votre parfum offert (35 ml) — {perfumes.length} disponible
              {perfumes.length > 1 ? "s" : ""}
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {perfumes.map((product) => {
                const selected = selectedPerfume?.id === product.id;
                const image = product.images?.[0];
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={`group relative text-left border-2 transition-all duration-200 overflow-hidden ${
                      selected
                        ? "border-primary shadow-[0_0_0_1px_var(--primary)] scale-[1.02]"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="aspect-[4/5] bg-[oklch(0.96_0.015_60)] overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          Sans visuel
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-card">
                      {product.brand && (
                        <p className="text-[9px] uppercase tracking-widest text-primary truncate">
                          {product.brand}
                        </p>
                      )}
                      <p className="text-xs font-medium leading-snug line-clamp-2 mt-0.5">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">35 ml · Offert</p>
                    </div>
                    {selected && (
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md animate-pop">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {selectedPerfume && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary animate-fade">
            <Check size={16} />
            <span>
              <strong>{selectedPerfume.name}</strong> sera ajouté gratuitement à votre commande.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
