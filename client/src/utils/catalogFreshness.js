/** Client-side mirror of grocery / essentials signals (keep in sync with server Category model). */
const ESSENTIALS_VERTICAL = "essentials";
const GROCERY_CATALOG_KEYS = new Set(["fresh_produce", "dairy", "bakery", "daily_essentials"]);

export function isGroceryFreshnessCategory(cat) {
  if (!cat) return false;
  if (String(cat.marketplace_vertical || "") === ESSENTIALS_VERTICAL) return true;
  return GROCERY_CATALOG_KEYS.has(String(cat.catalog_key || ""));
}

export function resolveShelfLifeHours(product) {
  const cat = product?.category;
  const h = cat?.default_freshness_hours;
  if (typeof h === "number" && h > 0) return h;
  if (product?.perishable) return 48;
  if (isGroceryFreshnessCategory(cat)) return 120;
  return null;
}

/**
 * @param {string | Date | null | undefined} scrapedAtIso
 * @param {number | null} shelfHours
 * @returns {number | null} 0–100 freshness score
 */
export function computeEstimatedFreshnessPercent(scrapedAtIso, shelfHours) {
  if (!shelfHours || shelfHours <= 0 || !scrapedAtIso) return null;
  const t0 = new Date(scrapedAtIso).getTime();
  if (Number.isNaN(t0)) return null;
  const elapsedH = (Date.now() - t0) / 3600000;
  const raw = 100 * (1 - elapsedH / shelfHours);
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}
