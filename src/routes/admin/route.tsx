import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Users, Percent,
  Home, LogOut, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: role } = await supabase
      .from("user_roles").select("role").eq("user_id", data.user.id).eq("role", "admin").maybeSingle();
    if (!role) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/produits", label: "Produits", icon: Package },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/categories", label: "Catégories", icon: Tag },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/promos", label: "Codes promo", icon: Percent },
];

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnectée.");
    window.location.href = "/";
  };
  return (
    <div className="min-h-screen flex bg-[oklch(0.97_0.008_75)]">
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40 transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 border-b border-border">
          <Logo className="text-base" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary mt-2">Administration</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded transition ${
                  active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted"
                }`}>
                <n.icon size={16} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted rounded">
            <Home size={16} /> Voir la boutique
          </Link>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 w-full rounded">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-card border-b border-border px-4 py-3 flex justify-between items-center">
          <button onClick={() => setOpen(v => !v)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <Logo className="text-sm" />
        </div>
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
