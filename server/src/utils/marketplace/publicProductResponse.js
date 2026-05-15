/**
 * Strip fulfillment-only fields from storefront API responses.
 * Admins and product owners still receive full documents.
 */
import { resolveSourcePlatform } from "../catalog/sourcePlatform.js";

const FULFILLMENT_ONLY_KEYS = [
  "sourceUrl",
  "automation",
  "originalPrice",
  "marginPercentApplied",
  "magicImportSnapshot",
];

/**
 * @param {Record<string, unknown>} product
 * @returns {Record<string, unknown>}
 */
export function sanitizeProductForStorefront(product) {
  if (!product || typeof product !== "object") return product;
  const out = { ...product };
  for (const key of FULFILLMENT_ONLY_KEYS) {
    delete out[key];
  }
  if (out.automation !== undefined) delete out.automation;
  if (!out.source_platform && out.sourceType) {
    out.source_platform = resolveSourcePlatform(out.sourceType);
  }
  if (!out.source_url && out.sourceUrl) {
    out.source_url = out.sourceUrl;
  }
  return out;
}

/**
 * @param {Record<string, unknown>[]} products
 */
export function sanitizeProductsForStorefront(products) {
  if (!Array.isArray(products)) return products;
  return products.map((p) => sanitizeProductForStorefront(p));
}
