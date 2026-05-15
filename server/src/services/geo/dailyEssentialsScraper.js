/**
 * Daily Essentials — regional vendor routing for travelers (US → TR, etc.).
 */
import { CATALOG_KEYS } from "../../models/Category.js";
import {
  getDailyEssentialsVendorHosts,
  hostnameMatchesRegionalVendor,
  resolveStorefront,
} from "./storefrontRegions.js";

export const DAILY_ESSENTIALS_CATALOG_KEY = CATALOG_KEYS.DAILY_ESSENTIALS;

/**
 * @param {string} countryCode ISO-2 storefront country
 */
export function getRegionalDailyEssentialsVendors(countryCode) {
  return resolveStorefront(countryCode).dailyEssentialsVendors;
}

/**
 * Prefer products scraped from the traveler's current country.
 * @param {object[]} products
 * @param {string} storefrontCountry
 */
export function sortProductsForStorefront(products, storefrontCountry) {
  const country = String(storefrontCountry || "SA").toUpperCase().slice(0, 2);
  return [...products].sort((a, b) => {
    const aLocal = listingCountryScore(a, country);
    const bLocal = listingCountryScore(b, country);
    if (bLocal !== aLocal) return bLocal - aLocal;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function listingCountryScore(product, country) {
  const lc = String(product?.automation?.listingCountry || "").toUpperCase();
  if (lc === country) return 2;
  try {
    const host = new URL(product?.sourceUrl || "").hostname;
    if (hostnameMatchesRegionalVendor(host, country)) return 2;
  } catch {
    /* ignore */
  }
  if (country === "SA" && !lc) return 1;
  return 0;
}

/**
 * When re-syncing stock, skip sources that don't match the active storefront region.
 * @param {object} product lean product with category populated or catalog_key
 * @param {string} storefrontCountry
 */
export function shouldSyncDailyEssentialsProduct(product, storefrontCountry) {
  const key = product?.category?.catalog_key || product?.catalog_key;
  if (key !== DAILY_ESSENTIALS_CATALOG_KEY) return true;

  const country = String(storefrontCountry || "SA").toUpperCase().slice(0, 2);
  const lc = String(product?.automation?.listingCountry || "").toUpperCase();
  if (lc === country) return true;

  try {
    const host = new URL(product.sourceUrl || "").hostname;
    return hostnameMatchesRegionalVendor(host, country);
  } catch {
    return country === "SA";
  }
}

/**
 * Pick default scrape host for automated daily-essentials imports in a region.
 * @param {string} countryCode
 */
export function primaryDailyEssentialsVendor(countryCode) {
  const vendors = getRegionalDailyEssentialsVendors(countryCode);
  return vendors[0] || null;
}
