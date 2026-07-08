import { useQuery } from "@tanstack/react-query";
import { Check, Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useWheel } from "@/lib/wheel";

export function GiftPerfumeSelector() {
  const { items, addGift } = useCart();
  const { markGiftClaimed } = useWheel();
  const giftItem = items.find((i) => i.isGift);

  const { data: eligible = [], isLoading } = useQuery({
    queryKey: ["gift-eligible-perfumes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,images,price")
        .eq("status", "published")
        .eq("volume_ml", 35)
        .gt("stock", 0)
        .order("name");
      return data ?? [];
    },
  });

  const select = (product: { id: string; slug: string; name: string; images: string[] }) => {
    addGift({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? "",
      price: 0,
    });
    markGiftClaimed();
  };

  return (
    <div className="bg-[oklch(0.96_0.015_60)] border border-[color:var(--gold)]/40 rounded-lg p-5 md:p-6 mb-6 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Gift size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold flex items-center gap-1.5">
            <Sparkles size={11} /> Votre cadeau de la roue de la chance
          </p>
          <h3 className="font-serif text-xl md:text-2xl mt-1">Un parfum offert pour votre achat</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Offre valable uniquement sur les parfums au format <strong className="text-foreground">35&nbsp;ml</strong>.
            Sélectionnez le parfum offert de votre choix parmi les références disponibles ci-dessous.
          </p>
        </div>
      </div>

      {giftItem ? (
        <div className="mt-5 flex items-center gap-4 bg-background border border-border rounded-md p-3 animate-scale-in">
          {giftItem.image ? (
            <img src={giftItem.image} alt={giftItem.name} className="w-14 h-16 object-cover rounded-sm" />
          ) : (
            <div className="w-14 h-16 bg-muted rounded-sm" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">{giftItem.name}</p>
            <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
              <Check size={12} /> Format 35 ml — Offert
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted/70 rounded-md animate-pulse" />
          ))}
        </div>
      ) : eligible.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground italic">
          Aucun parfum au format 35 ml n'est disponible pour le moment. Contactez-nous pour en savoir plus.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {eligible.map((p) => (
            <button
              key={p.id}
              onClick={() => select(p)}
              className="group text-left focus:outline-none"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[oklch(0.99_0.005_80)] border border-border transition-all group-hover:border-primary group-hover:shadow-[0_10px_24px_-12px_rgba(120,90,50,0.4)]">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                    Sans visuel
                  </div>
                )}
                <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
                  Offert
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {p.name}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
