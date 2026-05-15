import { STOREFRONT_OVERRIDE_KEY } from "../i18n/config.js";

export function readStorefrontOverride() {
  try {
    const raw = localStorage.getItem(STOREFRONT_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.country) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStorefrontOverride(override) {
  if (!override?.country) {
    localStorage.removeItem(STOREFRONT_OVERRIDE_KEY);
    return;
  }
  localStorage.setItem(STOREFRONT_OVERRIDE_KEY, JSON.stringify(override));
}

/** Headers sent on every API call so ipapi + Fixer follow traveler override */
export function storefrontHeaders(extra = {}) {
  const o = readStorefrontOverride();
  const headers = { ...extra };
  if (o?.country) headers["X-KSA-Country"] = o.country;
  if (o?.city) headers["X-KSA-City"] = o.city;
  if (o?.currency) headers["X-KSA-Currency"] = o.currency;
  return headers;
}

export function geoFetch(url, options = {}) {
  const headers = storefrontHeaders(options.headers || {});
  return fetch(url, { ...options, headers });
}
