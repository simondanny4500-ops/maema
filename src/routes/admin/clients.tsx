import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/clients")({
  component: Clients,
});

function Clients() {
  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <>
      <h1 className="font-serif text-3xl mb-2">Clients</h1>
      <p className="text-sm text-muted-foreground mb-6">{profiles.length} clients inscrits</p>

      <div className="bg-card border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Nom</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Téléphone</th>
              <th className="text-left px-4 py-3">Ville</th>
              <th className="text-left px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p: any) => (
              <tr key={p.id} className="border-t border-border/50">
                <td className="px-4 py-3">{p.full_name || "—"}</td>
                <td className="px-4 py-3">{p.email}</td>
                <td className="px-4 py-3">{p.phone || "—"}</td>
                <td className="px-4 py-3">{p.city || "—"}</td>
                <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
