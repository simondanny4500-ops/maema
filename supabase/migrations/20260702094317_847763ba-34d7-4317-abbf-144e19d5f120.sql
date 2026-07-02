
INSERT INTO public.categories (name, slug, sort_order, description)
VALUES
  ('Parfums', 'parfums', 1, 'Fragrances d''inspiration haut de gamme'),
  ('Coffrets', 'coffrets', 2, 'Nos coffrets cadeaux'),
  ('Nouveautés', 'nouveautes', 3, 'Les dernières arrivées'),
  ('Promotions', 'promotions', 4, 'Nos offres du moment'),
  ('Best Sellers', 'best-sellers', 5, 'Les plus aimés')
ON CONFLICT (slug) DO NOTHING;

-- Rattache les produits existants sans catégorie à Parfums (par défaut)
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'parfums')
WHERE category_id IS NULL;

-- Les coffrets vont dans Coffrets
UPDATE public.products
SET category_id = (SELECT id FROM public.categories WHERE slug = 'coffrets')
WHERE name ILIKE '%coffret%';
