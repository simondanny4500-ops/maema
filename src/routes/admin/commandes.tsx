import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatEUR } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";
import { X } from "lucide-react";

export const Route = createFileRoute("/admin/commandes")({
  component: AdminOrders,
});

const STATUSES = ["pending","paid","preparing","shipped","delivered","cancelled","refunded"] as const;
const LABEL: Record<string, string> = {
  pending: "En attente", paid: "Payée", preparing: "Préparation",
  shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée", refunded: "Remboursée",
};

function AdminOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = orders.filter((o: any) => {
    if (filter && o.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return o.order_number.toLowerCase().includes(s) || o.full_name.toLowerCase().includes(s) || o.email.toLowerCase().includes(s);
    }
    return true;
  });

  const update = async (id: string, changes: any) => {
    const { error } = await supabase.from("orders").update(changes).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Commande mise à jour"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); if (selected) setSelected({ ...selected, ...changes }); }
  };

  return (
    <>
      <h1 className="font-serif text-3xl mb-2">Commandes</h1>
      <p className="text-sm text-muted-foreground mb-6">{filtered.length} commande{filtered.length > 1 ? "s" : ""}</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input placeholder="Rechercher (n°, nom, email)…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-border px-3 py-2 text-sm w-64" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-card border border-border px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">N°</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => (
              <tr key={o.id} onClick={() => setSelected(o)} className="border-t border-border/50 cursor-pointer hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{o.order_number}</td>
                <td className="px-4 py-3">{o.full_name}<br /><span className="text-xs text-muted-foreground">{o.email}</span></td>
                <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                <td className="px-4 py-3 text-right">{formatEUR(o.total)}</td>
                <td className="px-4 py-3"><span className="text-xs uppercase tracking-widest text-primary">{LABEL[o.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl p-8 rounded max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded"><X size={16} /></button>
            <h2 className="font-serif text-2xl">Commande {selected.order_number}</h2>
            <p className="text-sm text-muted-foreground mb-6">{new Date(selected.created_at).toLocaleString("fr-FR")}</p>

            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Client</p>
                <p>{selected.full_name}</p>
                <p>{selected.email}</p>
                {selected.phone && <p>{selected.phone}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Livraison</p>
                <p>{selected.address_line}</p>
                <p>{selected.postal_code} {selected.city}</p>
                <p>{selected.country}</p>
              </div>
            </div>

            <div className="border border-border rounded overflow-hidden mb-6">
              <table className="w-full text-sm">
                <tbody>
                  {selected.order_items.map((it: any) => (
                    <tr key={it.id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2">{it.product_name} × {it.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatEUR(it.line_total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-medium">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{formatEUR(selected.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Statut</label>
                <select value={selected.status} onChange={(e) => update(selected.id, { status: e.target.value })}
                  className="mt-1 w-full bg-background border border-border px-3 py-2.5">
                  {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">N° de suivi</label>
                <input defaultValue={selected.tracking_number ?? ""} onBlur={(e) => update(selected.id, { tracking_number: e.target.value || null })}
                  className="mt-1 w-full bg-background border border-border px-3 py-2.5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
