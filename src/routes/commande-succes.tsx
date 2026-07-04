import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { ConfettiBurst } from "@/components/site/ConfettiBurst";

export const Route = createFileRoute("/commande-succes")({
  head: () => ({ meta: [{ title: "Commande confirmée — Memma & Maman" }] }),
  component: CommandeSucces,
  validateSearch: (search: Record<string, unknown>) => ({
    order_id: typeof search.order_id === "string" ? search.order_id : "",
  }),
});

function CommandeSucces() {
  const { order_id } = Route.useSearch();
  const { clear } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    clear();
    setCelebrate(true);
    if (order_id) {
      supabase
        .from("orders")
        .select("order_number")
        .eq("id", order_id)
        .single()
        .then(({ data }) => setOrderNumber(data?.order_number ?? null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_id]);

  return (
    <section className="max-w-2xl mx-auto px-5 md:px-10 py-24 text-center">
      {celebrate && <ConfettiBurst />}
      <div className="relative inline-block mb-6">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-glow" />
        <CheckCircle2 size={72} className="relative mx-auto text-primary animate-pop" />
      </div>
      <h1 className="font-serif text-4xl md:text-5xl mb-4 animate-fade-up">
        Merci pour votre commande !
      </h1>
      <p className="text-lg text-foreground mb-2 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {orderNumber
          ? `Commande n° ${orderNumber} confirmée.`
          : "Votre paiement a bien été reçu."}
      </p>
      <p className="text-muted-foreground mb-10 animate-fade-up" style={{ animationDelay: "180ms" }}>
        Un email de confirmation vous sera envoyé. Vous pouvez suivre l'état
        de votre commande depuis votre compte.
      </p>
      <Link
        to="/compte/commandes"
        className="shine btn-press inline-block px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition animate-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        Voir mes commandes
      </Link>
    </section>
  );
}
