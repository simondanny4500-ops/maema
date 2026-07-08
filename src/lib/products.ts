const ML35_PATTERN = /35\s*ml/i;

type ProductLike = {
  name?: string | null;
  short_description?: string | null;
  sku?: string | null;
  categories?: { slug?: string } | null;
};

/** Détecte un parfum au format 35 ml via nom, description courte ou SKU. */
export function is35mlPerfume(product: ProductLike): boolean {
  const haystack = [product.name, product.short_description, product.sku]
    .filter(Boolean)
    .join(" ");
  return ML35_PATTERN.test(haystack);
}

/** Vérifie qu'un produit est un parfum publié en 35 ml. */
export function isEligibleFreePerfume(product: ProductLike & { stock?: number }): boolean {
  const isParfum = product.categories?.slug === "parfums";
  return isParfum && is35mlPerfume(product) && (product.stock ?? 0) > 0;
}
