-- Ajoute le format (contenance) des parfums, nécessaire pour la roue de la
-- chance : le lot "parfum offert" n'est éligible qu'aux produits en 35 ml.
ALTER TABLE public.products
  ADD COLUMN volume_ml INT;

COMMENT ON COLUMN public.products.volume_ml IS
  'Contenance du produit en millilitres (ex: 35, 50, 100). Utilisée pour filtrer les parfums éligibles au cadeau de la roue de la chance.';

CREATE INDEX products_volume_ml_idx ON public.products(volume_ml);
