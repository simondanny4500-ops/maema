import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — Memma & Maman" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/compte" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Compte créé, vous êtes connecté !");
      navigate({ to: "/compte" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error("Identifiants invalides.");
      toast.success("Ravie de vous revoir.");
      navigate({ to: "/compte" });
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Connexion Google impossible.");
    if (result.redirected) return;
    navigate({ to: "/compte" });
  };

  return (
    <section className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block relative bg-[oklch(0.94_0.03_25)]">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="text-center animate-rise">
            <Logo className="text-2xl mb-8" />
            <p className="font-serif text-3xl italic text-foreground/80 leading-snug">
              « Prendre soin de soi,<br />c'est un acte d'amour. »
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm animate-fade">
          <Link to="/" className="md:hidden block text-center mb-8">
            <Logo className="text-lg" />
          </Link>
          <h1 className="font-serif text-4xl mb-2">{mode === "signin" ? "Bonjour" : "Bienvenue"}</h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "signin" ? "Connectez-vous à votre compte" : "Créez votre compte en un instant"}
          </p>

          <button
            onClick={google}
            className="w-full border border-border py-3 text-sm font-medium hover:bg-muted transition-colors mb-6"
          >
            Continuer avec Google
          </button>
          <div className="relative text-center text-xs text-muted-foreground mb-6">
            <span className="bg-background px-3 relative z-10">ou</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-border -z-0" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <input
                type="text" placeholder="Nom complet" required
                value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border px-3 py-3 focus:outline-none focus:border-primary"
              />
            )}
            <input
              type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border px-3 py-3 focus:outline-none focus:border-primary"
            />
            <input
              type="password" placeholder="Mot de passe" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border px-3 py-3 focus:outline-none focus:border-primary"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[color:var(--gold-deep)] transition-colors"
            >
              {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "Nouvelle cliente ?" : "Déjà un compte ?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signin" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
          <Link to="/" className="block text-center mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
