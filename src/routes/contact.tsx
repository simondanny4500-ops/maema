import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Memma & Maman" },
      { name: "description", content: "Une question ? Contactez notre équipe. Nous répondons sous 24h." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(2000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Merci de vérifier votre message.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Une erreur est survenue.");
      return;
    }
    toast.success("Message envoyé. À très vite !");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-20">
      <div className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Écrivez-nous</p>
        <h1 className="font-serif text-5xl md:text-6xl">Contact</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Notre équipe est à votre écoute pour toute question sur nos produits, votre commande ou vos envies beauté.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="space-y-8">
          {[
            { icon: Mail, title: "Email", value: "contact@memmaetmaman.com" },
            { icon: Phone, title: "Téléphone", value: "+33 1 23 45 67 89" },
            { icon: MapPin, title: "Adresse", value: "Paris, France" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4">
              <c.icon size={20} className="text-primary shrink-0 mt-1" strokeWidth={1.4} />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.title}</p>
                <p className="text-foreground mt-1">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="md:col-span-2 space-y-4 bg-card p-8 border border-border/60">
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Nom" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          </div>
          <Input label="Sujet" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-8 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors"
          >
            {loading ? "Envoi…" : "Envoyer le message"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Input({
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
