import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatEUR } from "@/lib/cart";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Paiement — Memma & Maman" }] }),
  component: Checkout,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  address_line: z.string().trim().min(4).max(200),
  city: z.string().trim().min(2).max(100),
  postal_code: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(80),
});

function Checkout() {
  const { items, subtotal, clear, count } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "",
    address_line: "", city: "", postal_code: "", country: "France",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.email) setForm((f) => ({ ...f, email: data.session!.user.email! }));
    });
  }, []);

  const shipping = subtotal >= 50 ? 0 : 4.9;
  const total = subtotal + shipping;

  if (count === 0) {
    return (
      <div className="text-center py-32">
        <p>Votre panier est vide.</p>
        <Link to="/boutique" className="text-primary underline mt-4 inline-block">Retour à la boutique</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Connectez-vous pour finaliser votre commande.");
      navigate({ to: "/auth" });
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Merci de vérifier vos informations.");
      return;
    }
    setLoading(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: session.user.id,
        status: "pending",
        subtotal,
        shipping,
        total,
        ...parsed.data,
      })
      .select()
      .single();
    if (error || !order) {
      setLoading(false);
      toast.error("Impossible de créer la commande.");
      return;
    }
    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      product_image: i.image,
      unit_price: i.price,
      quantity: i.quantity,
      line_total: i.price * i.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    const { data: checkoutData, error: checkoutError } =
      await supabase.functions.invoke("create-checkout-session", {
        body: { order_id: order.id },
      });

    setLoading(false);

    if (checkoutError || !checkoutData?.url) {
      toast.error("Impossible de lancer le paiement. Merci de réessayer.");
      return;
    }

    window.location.href = checkoutData.url;
  };


  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Paiement</h1>
      {!session && (
        <div className="mb-8 p-4 border border-primary bg-primary/5 text-sm">
          <Link to="/auth" className="text-primary font-medium">Connectez-vous</Link> ou créez un compte pour finaliser votre commande.
        </div>
      )}

      <form onSubmit={submit} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="font-serif text-2xl mb-4">Livraison</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nom complet" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Pays" value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
              <div className="md:col-span-2">
                <Field label="Adresse" value={form.address_line} onChange={(v) => setForm({ ...form, address_line: v })} required />
              </div>
              <Field label="Code postal" value={form.postal_code} onChange={(v) => setForm({ ...form, postal_code: v })} required />
              <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-2xl mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-primary" /> Paiement
            </h3>
            <div className="p-6 bg-muted/50 border border-border text-sm text-muted-foreground flex items-center gap-3">
              <Lock size={16} className="text-primary" />
              Le paiement sécurisé Stripe (CB, Apple Pay, Google Pay, PayPal) sera activé à la mise en production.
              Pour cette version de démonstration, votre commande sera enregistrée en statut « En attente ».
            </div>
          </div>
        </div>

        <aside className="bg-[oklch(0.96_0.015_70)] p-6 h-fit border border-border">
          <h3 className="font-serif text-2xl mb-4">Récapitulatif</h3>
          <div className="space-y-2 text-sm max-h-72 overflow-y-auto mb-4 pr-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="flex-1 truncate">{i.name} × {i.quantity}</span>
                <span>{formatEUR(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="divider-gold mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatEUR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{shipping === 0 ? "Offerte" : formatEUR(shipping)}</span></div>
            <div className="flex justify-between font-serif text-lg pt-2 border-t border-border">
              <span>Total</span><span>{formatEUR(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors disabled:opacity-50"
          >
            {loading ? "Traitement…" : `Confirmer · ${formatEUR(total)}`}
          </button>
        </aside>
      </form>
    </section>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary transition"
      />
    </div>
  );
}
