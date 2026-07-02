import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatEUR } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/compte/commandes")({
  component: Orders,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente", paid: "Payée", preparing: "Préparation",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée", refunded: "Remboursée",
};

function Orders() {
  const { data = [] } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (data.length === 0) {
    return <div className="bg-card border border-border p-10 text-center text-muted-foreground">Vous n'avez pas encore de commande.</div>;
  }

  return (
    <div className="space-y-4">
      {data.map((o: any) => (
        <div key={o.id} className="bg-card border border-border p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Commande</p>
              <p className="font-serif text-xl">{o.order_number}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest bg-primary/10 text-primary">{STATUS_LABEL[o.status] ?? o.status}</span>
              <p className="mt-2 font-serif text-lg">{formatEUR(o.total)}</p>
            </div>
          </div>
          <div className="divider-gold mb-3" />
          <ul className="text-sm text-foreground/80 space-y-1">
            {o.order_items.map((it: any) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.product_name} × {it.quantity}</span>
                <span>{formatEUR(it.line_total)}</span>
              </li>
            ))}
          </ul>
          {o.tracking_number && (
            <p className="mt-3 text-xs text-primary">Suivi : {o.tracking_number}</p>
          )}
        </div>
      ))}
    </div>
  );
}
