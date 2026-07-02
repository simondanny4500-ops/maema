import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatEUR } from "@/lib/cart";
import { ShoppingBag, Euro, Package, AlertTriangle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, products, low] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at,full_name,order_number").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,stock,price"),
        supabase.from("products").select("id,name").lte("stock", 3),
      ]);
      const allOrders = orders.data ?? [];
      const paid = allOrders.filter((o) => ["paid", "preparing", "shipped", "delivered"].includes(o.status));
      const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
      return {
        totalOrders: allOrders.length,
        revenue,
        productCount: products.data?.length ?? 0,
        lowStock: low.data ?? [],
        recentOrders: allOrders.slice(0, 6),
      };
    },
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("product_name, quantity");
      const totals = new Map<string, number>();
      (data ?? []).forEach((it: any) => totals.set(it.product_name, (totals.get(it.product_name) ?? 0) + it.quantity));
      return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    },
  });

  const cards = [
    { icon: ShoppingBag, label: "Commandes", value: stats?.totalOrders ?? 0 },
    { icon: Euro, label: "Chiffre d'affaires", value: formatEUR(stats?.revenue ?? 0) },
    { icon: Package, label: "Produits", value: stats?.productCount ?? 0 },
    { icon: AlertTriangle, label: "Stock faible", value: stats?.lowStock.length ?? 0 },
  ];

  return (
    <>
      <h1 className="font-serif text-3xl mb-1">Tableau de bord</h1>
      <p className="text-sm text-muted-foreground mb-8">Vue d'ensemble de votre boutique</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border p-5 rounded">
            <c.icon size={18} className="text-primary mb-3" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
            <p className="font-serif text-3xl mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded">
          <h3 className="font-serif text-xl mb-4">Dernières commandes</h3>
          {stats?.recentOrders.length ? (
            <ul className="space-y-3">
              {stats.recentOrders.map((o: any) => (
                <li key={o.id} className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{o.full_name} · {new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="text-right">
                    <p>{formatEUR(o.total)}</p>
                    <p className="text-xs text-muted-foreground">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Aucune commande.</p>}
        </div>

        <div className="bg-card border border-border p-6 rounded">
          <h3 className="font-serif text-xl mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Meilleures ventes</h3>
          {topProducts.length ? (
            <ul className="space-y-3">
              {topProducts.map(([name, qty]) => (
                <li key={name} className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                  <span>{name}</span>
                  <span className="text-primary font-medium">{qty} vendus</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">Pas encore de vente.</p>}
        </div>
      </div>

      {stats && stats.lowStock.length > 0 && (
        <div className="mt-6 bg-destructive/5 border border-destructive/30 p-5 rounded">
          <h3 className="font-serif text-lg text-destructive flex items-center gap-2"><AlertTriangle size={18} /> Stock faible</h3>
          <ul className="mt-2 text-sm space-y-1">
            {stats.lowStock.map((p: any) => <li key={p.id}>· {p.name}</li>)}
          </ul>
        </div>
      )}
    </>
  );
}
