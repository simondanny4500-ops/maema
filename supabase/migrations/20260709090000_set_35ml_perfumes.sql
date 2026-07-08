-- Marque les parfums 35 ml éligibles au cadeau de la roue de la chance.
-- Correspondance sur le nom du produit (insensible à la casse et aux espaces
-- superflus). Si un nom en base diffère légèrement (accent, mot en plus,
-- variante "Toxic Homme" vs "Toxic"...), il ne sera pas mis à jour ici —
-- vérifiez ensuite dans /admin/produits (colonne "Format") et complétez à la main.

UPDATE public.products
SET volume_ml = 35
WHERE lower(trim(name)) = ANY (ARRAY[
  'toxic',
  'royal',
  'vanilla',
  'ombre sensuel',
  'gold man',
  'marshmallow blush',
  'black horse',
  'instinct',
  'dolce vita',
  'symbiose',
  'paris mon amour',
  'purple night',
  'black silk'
]);
