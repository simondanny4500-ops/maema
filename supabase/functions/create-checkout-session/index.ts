// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session for an existing order and returns its URL.
// Called from the frontend via supabase.functions.invoke("create-checkout-session", { body: { order_id } })

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import Stripe from "npm:stripe@17.7.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id manquant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // The caller must be authenticated and must own the order.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.order_items || order.order_items.length === 0) {
      return new Response(JSON.stringify({ error: "Commande vide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY n'est pas configurée");
      return new Response(
        JSON.stringify({ error: "Paiement momentanément indisponible" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    // Build Stripe line items directly from the order items already stored in DB.
    // Using price_data (rather than pre-created Stripe Products) means any number
    // of products can be sold without having to create/maintain them in Stripe.
    const line_items = order.order_items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product_name,
          images: item.product_image ? [item.product_image] : undefined,
        },
        unit_amount: Math.round(Number(item.unit_price) * 100),
      },
      quantity: item.quantity,
    }));

    if (Number(order.shipping) > 0) {
      line_items.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Livraison" },
          unit_amount: Math.round(Number(order.shipping) * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "https://maema.fr";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: order.email,
      line_items,
      success_url: `${origin}/commande-succes?order_id=${order.id}`,
      cancel_url: `${origin}/checkout`,
      metadata: { order_id: order.id },
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-checkout-session error:", error);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
