import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/promos")({
  component: AdminPromos,
});

function AdminPromos() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["all-promos"],
    queryFn: async () => (await supabase.from("promo_codes").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce code ?")) return;
    await supabase.from("promo_codes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["all-promos"] });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Codes promotionnels</h1>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs uppercase tracking-widest"><Plus size={14} /> Nouveau</button>
      </div>

      <div className="bg-card border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Réduction</th>
              <th className="text-left px-4 py-3">Utilisations</th>
              <th className="text-left px-4 py-3">Expiration</th>
              <th className="text-left px-4 py-3">Actif</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((p: any) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="px-4 py-3 font-mono">{p.code}</td>
                <td className="px-4 py-3">{p.discount_percent ? `${p.discount_percent}%` : p.discount_amount ? `${p.discount_amount} €` : "—"}</td>
                <td className="px-4 py-3">{p.uses_count}{p.max_uses ? ` / ${p.max_uses}` : ""}</td>
                <td className="px-4 py-3">{p.expires_at ? new Date(p.expires_at).toLocaleDateString("fr-FR") : "—"}</td>
                <td className="px-4 py-3">{p.active ? "Oui" : "Non"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <PromoForm onClose={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["all-promos"] }); }} />}
    </>
  );
}

function PromoForm({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ code: "", discount_percent: "", discount_amount: "", max_uses: "", expires_at: "" });
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { code: f.code.toUpperCase().trim(), active: true };
    if (f.discount_percent) payload.discount_percent = Number(f.discount_percent);
    if (f.discount_amount) payload.discount_amount = Number(f.discount_amount);
    if (f.max_uses) payload.max_uses = Number(f.max_uses);
    if (f.expires_at) payload.expires_at = new Date(f.expires_at).toISOString();
    const { error } = await supabase.from("promo_codes").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Code créé"); onClose(); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <form onSubmit={save} className="bg-card w-full max-w-md p-8 rounded relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded"><X size={16} /></button>
        <h2 className="font-serif text-2xl mb-6">Nouveau code promo</h2>
        <div className="space-y-4">
          <F label="Code" value={f.code} onChange={(v) => setF({ ...f, code: v })} required />
          <div className="grid grid-cols-2 gap-4">
            <F label="% remise" type="number" value={f.discount_percent} onChange={(v) => setF({ ...f, discount_percent: v })} />
            <F label="Montant remise (€)" type="number" step="0.01" value={f.discount_amount} onChange={(v) => setF({ ...f, discount_amount: v })} />
          </div>
          <F label="Utilisations max" type="number" value={f.max_uses} onChange={(v) => setF({ ...f, max_uses: v })} />
          <F label="Date d'expiration" type="date" value={f.expires_at} onChange={(v) => setF({ ...f, expires_at: v })} />
        </div>
        <button className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest">Créer</button>
      </form>
    </div>
  );
}

function F({ label, value, onChange, type = "text", required = false, step }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean; step?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} step={step} required={required} value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary" />
    </div>
  );
}

