import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "@/lib/wishlist";
import { useCart, formatEUR } from "@/lib/cart";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/favoris")({
  head: () => ({ meta: [{ title: "Mes favoris — Memma & Maman" }] }),
  component: Favoris,
});

function Favoris() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center px-5 py-32">
        <Heart size={40} className="mx-auto text-muted-foreground mb-6" strokeWidth={1} />
        <h1 className="font-serif text-4xl">Aucun favori pour l'instant</h1>
        <p className="mt-3 text-muted-foreground">
          Cliquez sur le cœur d'un produit pour le retrouver ici.
        </p>
        <Link
          to="/boutique"
          className="shine btn-press inline-block mt-8 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Mes favoris</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {items.map((item) => (
          <div key={item.id} className="group relative animate-fade">
            <button
              onClick={() => remove(item.id)}
              aria-label="Retirer des favoris"
              className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/85 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-transform"
            >
              <X size={14} />
            </button>
            <Link to="/produit/$slug" params={{ slug: item.slug }} className="block">
              <div className="aspect-[4/5] overflow-hidden bg-[oklch(0.96_0.015_60)]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                />
              </div>
              <div className="pt-3 text-center">
                <h3 className="font-serif text-base group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-foreground/80 mt-1">{formatEUR(item.price)}</p>
              </div>
            </Link>
            <button
              onClick={() => {
                add(item, 1);
                toast.success(`${item.name} ajouté au panier`);
              }}
              className="shine mt-2 w-full flex items-center justify-center gap-2 border border-border py-2.5 text-[11px] uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              <ShoppingBag size={13} /> Ajouter au panier
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
