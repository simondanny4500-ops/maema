import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatEUR } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  sale_price: number | null;
  images: string[];
  is_new?: boolean;
};

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const price = product.sale_price ?? product.price;
  const discount =
    product.sale_price && product.price > 0
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;
  const image = product.images[0] ?? "";
  const { toggle, has } = useWishlist();
  const saved = has(product.id);

  return (
    <Link
      to="/produit/$slug"
      params={{ slug: product.slug }}
      className="group block animate-rise"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="relative overflow-hidden bg-[oklch(0.96_0.015_60)] aspect-[4/5] rounded-sm shadow-[0_0_0_0_rgba(120,90,50,0)] transition-shadow duration-500 group-hover:shadow-[0_18px_40px_-18px_rgba(120,90,50,0.35)]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Sans visuel
          </div>
        )}

        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <button
          onClick={(e) => {
            e.preventDefault();
            toggle({ id: product.id, slug: product.slug, name: product.name, price, image });
          }}
          aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/85 backdrop-blur flex items-center justify-center shadow-sm transition-transform hover:scale-110 active:scale-90 z-10"
        >
          <Heart
            size={15}
            className={saved ? "fill-primary text-primary animate-pop" : "text-foreground/60"}
          />
        </button>

        {discount > 0 && (
          <span className="shine absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-sm">
            −{discount}%
          </span>
        )}
        {product.is_new && !discount && (
          <span className="absolute top-3 left-3 bg-foreground/90 text-background text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-sm">
            Nouveau
          </span>
        )}
      </div>

      <div className="pt-4 text-center">
        {product.brand && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{product.brand}</p>
        )}
        <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="mt-1.5 text-sm flex items-center justify-center gap-2">
          {product.sale_price ? (
            <>
              <span className="text-primary font-medium">{formatEUR(product.sale_price)}</span>
              <span className="text-muted-foreground line-through text-xs">{formatEUR(product.price)}</span>
            </>
          ) : (
            <span className="text-foreground/80">{formatEUR(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
