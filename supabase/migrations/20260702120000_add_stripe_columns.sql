-- Add columns to track the related Stripe Checkout Session / Payment Intent
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
