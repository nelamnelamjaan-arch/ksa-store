/** Client-side category UI helpers (mirrors server catalog keys). */

export const CATALOG_KEYS = {
  JEWELLERY: "jewellery",
  MAKEUP: "makeup",
  SKINCARE: "skincare",
  GOURMET_FOOD: "gourmet_food",
  SHOES: "shoes",
  DRESSES_FEMALE: "dresses_female",
  DRESSES_MALE: "dresses_male",
  DRESSES_KIDS: "dresses_kids",
  ELECTRONICS: "electronics",
};

export function getCatalogKey(category) {
  if (!category) return null;
  return category.catalog_key || category.catalogKey || null;
}

export function isJewelleryCategory(category) {
  return getCatalogKey(category) === CATALOG_KEYS.JEWELLERY;
}

export function isMakeupOrSkincare(category) {
  const k = getCatalogKey(category);
  return k === CATALOG_KEYS.MAKEUP || k === CATALOG_KEYS.SKINCARE || category?.group === "beauty";
}

export function showsSizeGuide(category) {
  const k = getCatalogKey(category);
  return (
    k === CATALOG_KEYS.SHOES ||
    k === CATALOG_KEYS.DRESSES_FEMALE ||
    k === CATALOG_KEYS.DRESSES_MALE ||
    k === CATALOG_KEYS.DRESSES_KIDS ||
    category?.group === "fashion"
  );
}

export function hasQualityGuarantee(description, category) {
  if (/100% Original & Certified/i.test(description || "")) return true;
  return isMakeupOrSkincare(category);
}

export function premiumBadgeLabel(category, vipGourmetBadge) {
  if (vipGourmetBadge) return "VIP Gourmet";
  if (isJewelleryCategory(category)) return "Heritage";
  if (isMakeupOrSkincare(category)) return "Premium";
  if (getCatalogKey(category) === CATALOG_KEYS.ELECTRONICS) return "Flagship";
  return null;
}

export const CATEGORY_CHART_COLORS = {
  Jewellery: "#d4af37",
  "Gourmet Food": "#34d399",
  Makeup: "#f9a8d4",
  Skincare: "#fda4af",
  Shoes: "#a78bfa",
  "Women's Fashion": "#c4b5fd",
  "Men's Fashion": "#93c5fd",
  "Kids' Fashion": "#7dd3fc",
  Electronics: "#22d3ee",
  "General / Other": "#94a3b8",
};

export function chartColorForLabel(label) {
  return CATEGORY_CHART_COLORS[label] || "#00e5ff";
}
