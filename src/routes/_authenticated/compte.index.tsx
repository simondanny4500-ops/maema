import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/compte/")({
  component: Profile,
});

function Profile() {
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "", address_line: "", city: "", postal_code: "", country: "France" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.user.id).maybeSingle();
      if (data) setProfile(data);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error } = await supabase.from("profiles").upsert({ ...profile, id: user.user.id });
    setLoading(false);
    if (error) toast.error("Enregistrement impossible.");
    else toast.success("Profil mis à jour.");
  };

  return (
    <form onSubmit={save} className="space-y-4 bg-card border border-border p-8">
      <h2 className="font-serif text-2xl mb-2">Mes informations</h2>
      <Field label="Nom complet" value={profile.full_name ?? ""} onChange={(v) => setProfile({ ...profile, full_name: v })} />
      <Field label="Téléphone" value={profile.phone ?? ""} onChange={(v) => setProfile({ ...profile, phone: v })} />
      <Field label="Adresse" value={profile.address_line ?? ""} onChange={(v) => setProfile({ ...profile, address_line: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Code postal" value={profile.postal_code ?? ""} onChange={(v) => setProfile({ ...profile, postal_code: v })} />
        <Field label="Ville" value={profile.city ?? ""} onChange={(v) => setProfile({ ...profile, city: v })} />
      </div>
      <Field label="Pays" value={profile.country ?? ""} onChange={(v) => setProfile({ ...profile, country: v })} />
      <button className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest">{loading ? "…" : "Enregistrer"}</button>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-background border border-border px-3 py-2.5 focus:outline-none focus:border-primary" />
    </div>
  );
}
