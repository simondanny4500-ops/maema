
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.order_status AS ENUM ('pending','paid','preparing','shipped','delivered','cancelled','refunded');
CREATE TYPE public.product_status AS ENUM ('draft','published');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address_line TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USER ROLES (separate table — no privilege escalation)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- =========================================================
-- CATEGORIES
-- =========================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PRODUCTS
-- =========================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  brand TEXT,
  sku TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  sale_price NUMERIC(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  status product_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  weight_g INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published products" ON public.products
  FOR SELECT TO anon, authenticated USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_featured_idx ON public.products(is_featured) WHERE is_featured;

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('MM' || to_char(now(),'YYMMDD') || lpad((floor(random()*99999))::text, 5, '0')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  promo_code TEXT,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'France',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- =========================================================
-- PROMO CODES
-- =========================================================
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
  discount_amount NUMERIC(10,2),
  max_uses INT,
  uses_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO anon, authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active promo codes" ON public.promo_codes FOR SELECT TO anon, authenticated
  USING (active = true);
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- CONTACT MESSAGES
-- =========================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit contact" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update contact" ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- NEWSLETTER
-- =========================================================
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- ACTIVITY LOG (admin actions)
-- =========================================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read log" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins write log" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- TRIGGERS: profile creation + admin auto-grant + updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Auto-assign admin role for the owner email
  IF NEW.email = 'admin@memmaetmaman.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
