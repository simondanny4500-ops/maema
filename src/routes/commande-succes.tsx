import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";

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

  useEffect(() => {
    // Payment succeeded (Stripe redirected here) — the cart can now be emptied.
    clear();

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
    <section className="max-w-xl mx-auto px-5 py-32 text-center">
      <CheckCircle2 className="mx-auto text-primary mb-6" size={56} />
      <h1 className="font-serif text-3xl md:text-4xl mb-4">
        Merci pour votre commande !
      </h1>
      <p className="text-muted-foreground mb-2">
        {orderNumber
          ? `Commande n° ${orderNumber} confirmée.`
          : "Votre paiement a bien été reçu."}
      </p>
      <p className="text-muted-foreground mb-8">
        Un email de confirmation vous sera envoyé. Vous pouvez suivre l'état
        de votre commande depuis votre compte.
      </p>
      <Link to="/compte/commandes" className="text-primary underline">
        Voir mes commandes
      </Link>
    </section>
  );
}
