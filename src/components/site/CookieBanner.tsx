import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "memma-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (private browsing, etc.) — skip silently.
    }
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 md:p-6 animate-fade">
      <div className="max-w-3xl mx-auto bg-background border border-border shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
        <p className="text-sm text-foreground/80 leading-relaxed flex-1">
          Nous utilisons des cookies nécessaires au fonctionnement du site (panier, paiement) et,
          avec votre accord, des cookies de mesure d'audience. En savoir plus dans notre{" "}
          <Link to="/cookies" className="text-primary underline">
            Politique de cookies
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => choose("rejected")}
            className="flex-1 md:flex-none px-5 py-2.5 text-xs uppercase tracking-widest border border-border hover:bg-muted transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={() => choose("accepted")}
            className="flex-1 md:flex-none px-5 py-2.5 text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:bg-[color:var(--gold-deep)] transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
