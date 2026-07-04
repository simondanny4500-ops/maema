import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@17.7.0";

Deno.serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Clés Stripe manquantes dans les secrets de la fonction");
    return new Response("Configuration manquante", { status: 500 });
  }

  if (!signature) {
    return new Response("Signature manquante", { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("Signature webhook invalide:", err);
    return new Response("Signature invalide", { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({
              status: "paid",
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
            })
            .eq("id", orderId);

          await sendOrderConfirmationEmail(supabaseAdmin, orderId);
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await supabaseAdmin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)
            .eq("status", "pending");
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Erreur de traitement du webhook:", error);
    return new Response("Erreur interne", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

async function sendOrderConfirmationEmail(
  // deno-lint-ignore no-explicit-any
  supabaseAdmin: any,
  orderId: string,
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY non configurée — email de confirmation ignoré.");
    return;
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order?.email) {
    console.error("Impossible de charger la commande pour l'email:", error);
    return;
  }

  const itemsHtml = order.order_items
    .map(
      (it: any) =>
        `<tr>
          <td style="padding:8px 0;color:#3a3229;">${it.product_name} × ${it.quantity}</td>
          <td style="padding:8px 0;text-align:right;color:#3a3229;">${formatEUR(it.line_total)}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;color:#3a3229;">
      <h1 style="font-size:24px;font-weight:normal;letter-spacing:0.02em;">Memma &amp; Maman</h1>
      <p style="font-size:15px;line-height:1.6;">Merci pour votre commande, elle est confirmée !</p>
      <p style="font-size:13px;color:#8a7f6e;text-transform:uppercase;letter-spacing:0.1em;">
        Commande n° ${order.order_number}
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        ${itemsHtml}
        <tr><td colspan="2" style="border-top:1px solid #e5ddd0;padding-top:10px;"></td></tr>
        <tr>
          <td style="padding:6px 0;">Sous-total</td>
          <td style="padding:6px 0;text-align:right;">${formatEUR(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;">Livraison</td>
          <td style="padding:6px 0;text-align:right;">${order.shipping === 0 ? "Offerte" : formatEUR(order.shipping)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:17px;">Total</td>
          <td style="padding:10px 0;text-align:right;font-size:17px;">${formatEUR(order.total)}</td>
        </tr>
      </table>
      <p style="font-size:14px;line-height:1.6;color:#5a5142;">
        Livraison à : ${order.address_line}, ${order.postal_code} ${order.city}, ${order.country}
      </p>
      <p style="font-size:13px;color:#8a7f6e;margin-top:30px;">
        Une question ? Contactez-nous à
        <a href="mailto:aide@maema.fr" style="color:#a8874a;">aide@maema.fr</a>
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Memma & Maman <commandes@maema.fr>",
        to: [order.email],
        subject: `Confirmation de votre commande n° ${order.order_number}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Erreur envoi email Resend:", await res.text());
    }
  } catch (e) {
    console.error("Erreur envoi email:", e);
  }
}
