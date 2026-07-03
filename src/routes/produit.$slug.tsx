import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatEUR } from "@/lib/cart";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Truck, RotateCcw, ShieldCheck, Check } from "lucide-react";

export const Route = createFileRoute("/produit/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(slug,name)")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.name} — Memma & Maman` },
            { name: "description", content: loaderData.short_description ?? loaderData.description ?? "Découvrez ce produit sur Memma & Maman." },
            { property: "og:title", content: loaderData.name },
            { property: "og:image", content: loaderData.images?.[0] ?? "" },
          ],
        }
      : {},
  component: ProductPage,
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto text-center py-32">
      <h1 className="font-serif text-4xl">Produit introuvable</h1>
      <Link to="/boutique" className="inline-block mt-6 text-primary underline">Retour à la boutique</Link>
    </div>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData() as any;
  const [qty, setQty] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const price = product.sale_price ?? product.price;
  const image = product.images[imageIdx] ?? product.images[0] ?? "";

  const { data: related = [] } = useQuery({
    queryKey: ["related", product.category_id, product.id],
    queryFn: async () => {
      if (!product.category_id) return [];
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,brand,price,sale_price,images,is_new")
        .eq("status", "published")
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4);
      return data ?? [];
    },
  });

  const addToCart = () => {
    if (product.stock <= 0) {
      toast.error("Ce produit est en rupture de stock.");
      return;
    }
    add({ id: product.id, slug: product.slug, name: product.name, price, image }, qty);
    toast.success(`${product.name} ajouté au panier`);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-16">
        <nav className="text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Accueil</Link> ·{" "}
          <Link to="/boutique" className="hover:text-primary">Boutique</Link>
          {product.categories && <> · <span>{product.categories.name}</span></>}
        </nav>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div className="animate-fade">
            <div className="aspect-square overflow-hidden bg-[oklch(0.96_0.015_60)]">
              {image ? (
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sans visuel</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {product.images.slice(0, 5).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`aspect-square overflow-hidden border-2 transition ${
                      imageIdx === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="animate-rise">
            {product.brand && (
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">{product.brand}</p>
            )}
            <h1 className="font-serif text-4xl md:text-5xl leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-3 mt-5">
              {product.sale_price ? (
                <>
                  <span className="text-3xl font-serif text-primary">{formatEUR(product.sale_price)}</span>
                  <span className="text-muted-foreground line-through">{formatEUR(product.price)}</span>
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2 py-1">
                    −{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-serif">{formatEUR(product.price)}</span>
              )}
            </div>

            {product.short_description && (
              <p className="mt-6 text-foreground/70 leading-relaxed">{product.short_description}</p>
            )}

            <div className="divider-gold my-8" />

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-3 hover:bg-muted transition"><Minus size={14} /></button>
                <span className="px-4 text-sm w-10 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-3 hover:bg-muted transition"><Plus size={14} /></button>
              </div>
              <button
                onClick={addToCart}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  justAdded ? "scale-[0.97]" : "scale-100"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={16} className="animate-fade" />
                    Ajouté
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} en stock` : "Épuisé"}
              {product.sku && ` · Réf. ${product.sku}`}
            </p>

            {product.description && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-serif text-xl mb-3">Description</h3>
                <p className="text-foreground/75 leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <div className="mt-10 grid grid-cols-3 gap-4 text-center text-xs">
              {[
                { icon: Truck, label: "Livraison offerte dès 50 €" },
                { icon: RotateCcw, label: "Retours sous 14 jours" },
                { icon: ShieldCheck, label: "Paiement sécurisé" },
              ].map((f) => (
                <div key={f.label} className="flex flex-col items-center gap-2 text-muted-foreground">
                  <f.icon size={18} strokeWidth={1.4} className="text-primary" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
          <h2 className="font-serif text-3xl text-center mb-12">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </>
  );
}
