import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Facebook, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Une erreur est survenue.");
    } else {
      toast.success("Merci ! Vous êtes inscrite à notre newsletter.");
      setEmail("");
    }
  };

  return (
    <footer className="mt-32 bg-[oklch(0.96_0.015_70)] border-t border-border/60">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo className="text-xl mb-5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Parfums d'inspiration, formulés en Europe. Des fragrances élégantes qui rappellent
              les grands classiques — à un prix juste, sans marque copiée, sans contrefaçon.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2.5 text-sm text-foreground/70">
              <li><Link to="/boutique" className="hover:text-primary transition-colors">Toute la boutique</Link></li>
              <li><Link to="/boutique" search={{ cat: "parfums" }} className="hover:text-primary transition-colors">Parfums</Link></li>
              <li><Link to="/boutique" search={{ cat: "coffrets" }} className="hover:text-primary transition-colors">Coffrets</Link></li>
              <li><Link to="/boutique" search={{ cat: "nouveautes" }} className="hover:text-primary transition-colors">Nouveautés</Link></li>
              <li><Link to="/boutique" search={{ cat: "best-sellers" }} className="hover:text-primary transition-colors">Best Sellers</Link></li>
              <li><Link to="/promotions" className="hover:text-primary transition-colors">Promotions</Link></li>
            </ul>
          </div>


          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Aide</h4>
            <ul className="space-y-2.5 text-sm text-foreground/70">
              <li><Link to="/a-propos" className="hover:text-primary transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Nous contacter</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/compte" className="hover:text-primary transition-colors">Mon compte</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez nos ventes privées et offres exclusives.
            </p>
            <form onSubmit={subscribe} className="flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="flex-1 bg-background border border-border rounded-l-md px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 rounded-r-md hover:bg-[color:var(--gold-deep)] transition-colors"
              >
                <Mail size={16} />
              </button>
            </form>
            <div className="flex gap-3 mt-5 text-foreground/60">
              <a href="https://www.instagram.com/memmaetmaman?igsh=MjR1NjhqNjNreTlq" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors"><Instagram size={18} /></a>
              <a href="https://www.facebook.com/share/1E5yDT4ZLZ/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors"><Facebook size={18} /></a>
            </div>
          </div>
        </div>

        <div className="divider-gold my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Memma & Maman. Parfums d'inspiration — tous droits réservés.</p>
          <p className="tracking-wider">Livraison offerte dès 50 € · Paiement sécurisé</p>
        </div>

        <div className="mt-6 pt-6 border-t border-border/60 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link to="/cgv" className="hover:text-primary transition-colors">Conditions Générales de Vente</Link>
          <Link to="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          <Link to="/cookies" className="hover:text-primary transition-colors">Politique de cookies</Link>
          <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
          <Link to="/retractation" className="hover:text-primary transition-colors">Formulaire de rétractation</Link>
        </div>

      </div>
    </footer>
  );
}
