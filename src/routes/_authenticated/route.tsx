import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { User, ShoppingBag, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCompte = pathname === "/compte";
  const isCommandes = pathname === "/compte/commandes";

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("À bientôt !");
    window.location.href = "/";
  };

  return (
    <section className="max-w-6xl mx-auto px-5 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl mb-10">Mon compte</h1>
      <div className="grid md:grid-cols-4 gap-10">
        <aside className="space-y-1">
          <NavItem to="/compte" icon={User} label="Mon profil" active={isCompte} />
          <NavItem to="/compte/commandes" icon={ShoppingBag} label="Mes commandes" active={isCommandes} />
          <button onClick={signOut} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm text-muted-foreground hover:text-destructive transition">
            <LogOut size={16} /> Déconnexion
          </button>
        </aside>
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </section>
  );
}

function NavItem({ to, icon: Icon, label, active }: any) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 text-sm transition border-l-2 ${
        active ? "border-primary text-primary bg-primary/5" : "border-transparent text-foreground/70 hover:text-primary"
      }`}
    >
      <Icon size={16} /> {label}
    </Link>
  );
}
