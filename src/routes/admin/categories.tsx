import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);

  const { data = [] } = useQuery({
    queryKey: ["all-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimée"); qc.invalidateQueries({ queryKey: ["all-cats"] }); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editing.id;
    const payload = {
      name: editing.name,
      slug: (editing.slug || editing.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: editing.description ?? null,
      image_url: editing.image_url ?? null,
      sort_order: Number(editing.sort_order ?? 0),
    };
    const { error } = isNew
      ? await supabase.from("categories").insert(payload)
      : await supabase.from("categories").update(payload).eq("id", editing.id);
    if (error) toast.error(error.message);
    else { toast.success("Enregistrée"); setEditing(null); qc.invalidateQueries({ queryKey: ["all-cats"] }); }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-3xl">Catégories</h1>
        <button onClick={() => setEditing({})} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs uppercase tracking-widest"><Plus size={14} /> Nouvelle</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((c: any) => (
          <div key={c.id} className="bg-card border border-border p-5 rounded flex justify-between">
            <div>
              <p className="font-serif text-lg">{c.name}</p>
              <p className="text-xs text-muted-foreground">/{c.slug} · ordre {c.sort_order}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(c)} className="p-2 hover:bg-muted rounded"><Edit2 size={14} /></button>
              <button onClick={() => remove(c.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-card w-full max-w-md p-8 rounded relative">
            <button type="button" onClick={() => setEditing(null)} className="absolute top-4 right-4 p-2 hover:bg-muted rounded"><X size={16} /></button>
            <h2 className="font-serif text-2xl mb-6">{editing.id ? "Modifier" : "Nouvelle catégorie"}</h2>
            <div className="space-y-4">
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Nom</label>
                <input required value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" /></div>
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Slug</label>
                <input value={editing.slug ?? ""} placeholder="auto" onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" /></div>
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Image URL</label>
                <input value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" /></div>
              <div><label className="text-xs uppercase tracking-widest text-muted-foreground">Ordre</label>
                <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" /></div>
            </div>
            <button className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest">Enregistrer</button>
          </form>
        </div>
      )}
    </>
  );
}
