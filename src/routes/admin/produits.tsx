import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatEUR } from "@/lib/cart";
import { Plus, Edit2, Trash2, Copy, X } from "lucide-react";

export const Route = createFileRoute("/admin/produits")({
  component: AdminProducts,
});

type Product = any;

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => (await supabase.from("categories").select("id,name,slug").order("sort_order")).data ?? [],
  });

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  const duplicate = async (p: Product) => {
    const { id, created_at, updated_at, categories: _c, ...rest } = p;
    const { error } = await supabase.from("products").insert({
      ...rest, slug: rest.slug + "-copie-" + Date.now(), name: rest.name + " (copie)",
    });
    if (error) toast.error(error.message);
    else { toast.success("Dupliqué"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-serif text-3xl">Produits</h1>
          <p className="text-sm text-muted-foreground">{products.length} produits</p>
        </div>
        <button onClick={() => setEditing({})} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-[color:var(--gold-deep)]">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="bg-card border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Produit</th>
              <th className="text-left px-4 py-3">Catégorie</th>
              <th className="text-right px-4 py-3">Prix</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 object-cover" alt="" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  {p.sale_price ? (
                    <span><span className="text-primary">{formatEUR(p.sale_price)}</span> <span className="line-through text-xs text-muted-foreground">{formatEUR(p.price)}</span></span>
                  ) : formatEUR(p.price)}
                </td>
                <td className={`px-4 py-3 text-right ${p.stock <= 3 ? "text-destructive" : ""}`}>{p.stock}</td>
                <td className="px-4 py-3"><span className={`text-xs uppercase tracking-widest ${p.status === "published" ? "text-primary" : "text-muted-foreground"}`}>{p.status === "published" ? "Publié" : "Brouillon"}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => setEditing(p)} className="p-2 hover:bg-muted rounded"><Edit2 size={14} /></button>
                    <button onClick={() => duplicate(p)} className="p-2 hover:bg-muted rounded"><Copy size={14} /></button>
                    <button onClick={() => remove(p.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProductForm product={editing} categories={categories} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}
    </>
  );
}

function ProductForm({ product, categories, onClose }: { product: any; categories: any[]; onClose: () => void }) {
  const isNew = !product.id;
  const [f, setF] = useState({
    name: product.name ?? "",
    slug: product.slug ?? "",
    brand: product.brand ?? "",
    sku: product.sku ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price: product.price ?? 0,
    sale_price: product.sale_price ?? "",
    stock: product.stock ?? 0,
    category_id: product.category_id ?? "",
    status: product.status ?? "published",
    is_featured: product.is_featured ?? false,
    is_new: product.is_new ?? false,
    images: (product.images ?? []).join("\n"),
  });
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      ...f,
      price: Number(f.price),
      sale_price: f.sale_price === "" ? null : Number(f.sale_price),
      stock: Number(f.stock),
      images: f.images.split("\n").map((s: string) => s.trim()).filter(Boolean),
      category_id: f.category_id || null,
      slug: f.slug || f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", product.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(isNew ? "Produit créé" : "Produit modifié"); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={save} className="bg-card w-full max-w-2xl my-8 p-8 rounded max-h-[90vh] overflow-y-auto relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-muted rounded"><X size={16} /></button>
        <h2 className="font-serif text-2xl mb-6">{isNew ? "Nouveau produit" : "Modifier"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <F label="Nom" value={f.name} onChange={(v) => setF({ ...f, name: v })} required />
          <F label="Slug (URL)" value={f.slug} onChange={(v) => setF({ ...f, slug: v })} placeholder="auto" />
          <F label="Inspiration" value={f.brand} onChange={(v) => setF({ ...f, brand: v })} />
          <F label="Référence (SKU)" value={f.sku} onChange={(v) => setF({ ...f, sku: v })} />
          <F label="Prix (€)" type="number" step="0.01" value={f.price} onChange={(v) => setF({ ...f, price: v })} required />
          <F label="Prix promo (€)" type="number" step="0.01" value={f.sale_price} onChange={(v) => setF({ ...f, sale_price: v })} />
          <F label="Stock" type="number" value={f.stock} onChange={(v) => setF({ ...f, stock: v })} required />
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Catégorie</label>
            <select value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5">
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Description courte</label>
            <input value={f.short_description} onChange={(e) => setF({ ...f, short_description: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" />
          </div>
          <div className="col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Description</label>
            <textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5" />
          </div>
          <div className="col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Images (une URL par ligne)</label>
            <textarea rows={3} value={f.images} onChange={(e) => setF({ ...f, images: e.target.value })} placeholder="https://…" className="mt-1 w-full bg-background border border-border px-3 py-2.5 font-mono text-xs" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Statut</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className="mt-1 w-full bg-background border border-border px-3 py-2.5">
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
          <div className="flex items-center gap-6 pt-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Mis en avant</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_new} onChange={(e) => setF({ ...f, is_new: e.target.checked })} /> Nouveau</label>
          </div>
        </div>
        <div className="flex gap-2 mt-8 justify-end">
          <button type="button" onClick={onClose} className="px-6 py-3 border border-border text-xs uppercase tracking-widest">Annuler</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-widest hover:bg-[color:var(--gold-deep)]">{loading ? "…" : "Enregistrer"}</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, value, onChange, type = "text", required = false, placeholder, step }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string; step?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input type={type} step={step} required={required} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary" />
    </div>
  );
}

