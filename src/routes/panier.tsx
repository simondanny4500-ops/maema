import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, formatEUR } from "@/lib/cart";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/panier")({
  head: () => ({ meta: [{ title: "Panier — Memma & Maman" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, remove, subtotal, count } = useCart();
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 4.9;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center px-5 py-32">
        <ShoppingBag size={40} className="mx-auto text-muted-foreground mb-6" strokeWidth={1} />
        <h1 className="font-serif text-4xl">Votre panier est vide</h1>
        <p className="mt-3 text-muted-foreground">Explorez notre boutique pour trouver vos coups de cœur.</p>
        <Link to="/boutique" className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors">
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Votre panier</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-card border border-border p-4 animate-fade">
              <img src={item.image} alt={item.name} className="w-24 h-28 object-cover" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to="/produit/$slug" params={{ slug: item.slug }} className="font-serif text-lg hover:text-primary">{item.name}</Link>
                  <p className="text-sm text-primary mt-1">{formatEUR(item.price)}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1.5 hover:bg-muted"><Minus size={12} /></button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1.5 hover:bg-muted"><Plus size={12} /></button>
                  </div>
                  <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive p-2"><X size={16} /></button>
                </div>
              </div>
              <div className="text-right font-medium">{formatEUR(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <aside className="bg-[oklch(0.96_0.015_70)] p-6 h-fit sticky top-28 border border-border">
          <h3 className="font-serif text-2xl mb-6">Récapitulatif</h3>
          <div className="space-y-3 text-sm">
            <Row label="Sous-total" value={formatEUR(subtotal)} />
            <Row label="Livraison" value={shipping === 0 ? "Offerte" : formatEUR(shipping)} />
            <div className="divider-gold my-3" />
            <Row label="Total" value={formatEUR(total)} bold />
          </div>
          {shipping > 0 ? (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                Plus que <span className="text-primary font-medium">{formatEUR(50 - subtotal)}</span> pour la livraison offerte !
              </p>
              <div className="h-1.5 w-full bg-border/60 overflow-hidden rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 text-xs text-primary animate-fade">
              <span className="inline-block h-1.5 w-full bg-primary rounded-full" />
              <span className="whitespace-nowrap font-medium">Livraison offerte 🎉</span>
            </div>
          )}
          <Link
            to="/checkout"
            className="mt-6 flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors"
          >
            Passer commande <ArrowRight size={14} />
          </Link>
          <Link to="/boutique" className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary uppercase tracking-widest">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-lg font-serif" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
