/** Mirrors server `Category.catalog_key` / `marketplace_vertical` for client-side legal UI. */
export const CATALOG_KEYS = Object.freeze({
  FRESH_PRODUCE: "fresh_produce",
  PRESCRIPTION_MEDICINES: "prescription_medicines",
  SUPPLEMENTS: "supplements",
  FIRST_AID: "first_aid",
});

export const MARKETPLACE_VERTICALS = Object.freeze({
  HEALTHCARE: "healthcare",
  ESSENTIALS: "essentials",
});

/**
 * Facilitator disclaimer applies to pharmacy / medicine catalogue and fresh produce.
 * @param {{ catalog_key?: string; marketplace_vertical?: string } | null | undefined} category
 */
export function shouldShowFacilitatorNote(category) {
  if (!category) return false;
  if (category.catalog_key === CATALOG_KEYS.FRESH_PRODUCE) return true;
  if (category.marketplace_vertical === MARKETPLACE_VERTICALS.HEALTHCARE) return true;
  const medKeys = new Set([
    CATALOG_KEYS.PRESCRIPTION_MEDICINES,
    CATALOG_KEYS.SUPPLEMENTS,
    CATALOG_KEYS.FIRST_AID,
  ]);
  if (medKeys.has(category.catalog_key)) return true;
  return false;
}
