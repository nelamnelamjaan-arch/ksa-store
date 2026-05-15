/**
 * External connectors: Rainforest (Amazon), Gemini (VIP copy), live FX (USD/EUR/SAR/AUD).
 * Falls back to mock FX from calculateKSAStorePrice when the currency API is unreachable.
 */

import { URL } from "url";
import { MOCK_FX_TO_SAR, convertToSAR } from "../../utils/pricing/calculateKSAStorePrice.js";
import { memoryCacheGet, memoryCacheSet } from "../cache/memoryCache.js";
import { flagImagesForReview } from "../../utils/imageWatermarkHeuristic.js";
import { resolveDomainRules } from "../automation/domainMap.js";

const FX_CACHE_KEY = "fx:sar_matrix";
const FX_TTL_MS = 60 * 60 * 1000;
const RF_CACHE_PREFIX = "rainforest:url:";
const RF_TTL_MS = 5 * 60 * 1000;
const VIP_CACHE_PREFIX = "gemini:vip:";
const VIP_TTL_MS = 24 * 60 * 60 * 1000;

/** @returns {Record<string, number>} Units of foreign currency → SAR per 1 unit (e.g. USD → 3.75 SAR) */
function mockRatesToSar() {
  const out = { SAR: 1 };
  for (const [cur, sarPerUnit] of Object.entries(MOCK_FX_TO_SAR)) {
    out[cur] = sarPerUnit;
  }
  return out;
}

/**
 * Frankfurter (ECB) — free, no API key. Builds SAR-per-unit for USD, EUR, AUD (+ GBP fallback).
 * Uses `from=SAR&to=USD,EUR,AUD` then inverts: 1 SAR = r USD → 1 USD = 1/r SAR.
 */
async function fetchLiveFxRatesToSAR() {
  const cached = memoryCacheGet(FX_CACHE_KEY);
  if (cached && typeof cached === "object") return cached;

  const targets = "USD,EUR,AUD";
  let ratesFromSar = null;
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=SAR&to=${targets}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      const r = data?.rates || {};
      const sarPerUnit = { SAR: 1 };
      for (const code of ["USD", "EUR", "AUD"]) {
        const v = Number(r[code]);
        if (v > 0) {
          sarPerUnit[code] = Math.round((1 / v) * 10000) / 10000;
        }
      }
      if (sarPerUnit.USD) ratesFromSar = sarPerUnit;
    }
  } catch {
    /* use mock */
  }

  if (!ratesFromSar) {
    ratesFromSar = mockRatesToSar();
    ratesFromSar._source = "mock";
  } else {
    ratesFromSar._source = "frankfurter";
  }

  memoryCacheSet(FX_CACHE_KEY, ratesFromSar, FX_TTL_MS);
  return ratesFromSar;
}

/**
 * Convert a price in `currency` (ISO) to SAR using live (cached) or mock rates.
 * @param {number} amount
 * @param {string} currency
 */
export async function convertForeignAmountToSAR(amount, currency) {
  const cur = String(currency || "USD")
    .toUpperCase()
    .trim();
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (cur === "SAR") return Math.round(n * 100) / 100;

  const map = await fetchLiveFxRatesToSAR();
  const rate = map[cur];
  if (rate != null && rate > 0) {
    return Math.round(n * rate * 100) / 100;
  }
  return convertToSAR(n, cur);
}

/**
 * Expose FX snapshot for admin responses (strips internal _source from spread if needed).
 */
export async function getFxRatesSnapshot() {
  const m = await fetchLiveFxRatesToSAR();
  const { _source, ...rates } = m;
  return { source: _source || "unknown", ratesToSAR: rates };
}

function parseJsonObject(text) {
  const trimmed = String(text || "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

const VIP_SYSTEM = `You are the senior copy chief for KSA Store, an ultra-premium global marketplace.
Rewrite the title and description in a VIP, editorial tone: confident, minimal hype, museum-quality language.
Rules:
- Remove ANY reference to external retailers (Amazon, Walmart, Noon, Otto, eBay, etc.).
- No URLs, no "imported from", no seller platform names.
- Output STRICT JSON only: { "title": string, "description": string, "metaTitle": string (<=60 chars), "metaDescription": string (<=155 chars), "keywords": string[] (5-12 SEO keywords) }.`;

/**
 * Gemini-only VIP rewrite (connector path). Falls back to null if no API key / error.
 * @param {{ title: string, description: string, sourceHint?: string }} input
 */
export async function rewriteProductCopyVipGemini(input) {
  const title0 = String(input?.title || "").trim();
  const desc0 = String(input?.description || "").trim();
  const hint = input?.sourceHint ? `\nChannel (never mention): ${input.sourceHint}` : "";

  const key = `${VIP_CACHE_PREFIX}${title0}\n${desc0}`;
  const cached = memoryCacheGet(key);
  if (cached?.title) return { ...cached, source: "cache" };

  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const userBlock = `${VIP_SYSTEM}\n\nOriginal title:\n${title0}\n\nOriginal description:\n${desc0}${hint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userBlock }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.warn("[apiManager/Gemini VIP]", res.status, errText.slice(0, 200));
    return null;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const raw = parseJsonObject(text);
  if (!raw) return null;

  const title = String(raw.title || "").trim() || title0;
  const description = String(raw.description || "").trim() || desc0;
  const metaTitle = String(raw.metaTitle || title).trim().slice(0, 60);
  const metaDescription = String(raw.metaDescription || description).trim().slice(0, 155);
  const kw = Array.isArray(raw.keywords) ? raw.keywords.map((k) => String(k).trim()).filter(Boolean) : [];
  const keywords = [...new Set(kw)].slice(0, 12);
  const out = {
    title,
    description,
    seo: { metaTitle, metaDescription, keywords },
    source: "gemini_vip",
  };
  memoryCacheSet(key, out, VIP_TTL_MS);
  return out;
}

function isAmazonHostname(host) {
  return String(host || "")
    .toLowerCase()
    .includes("amazon.");
}

/**
 * Rainforest API — structured Amazon product data.
 * @see https://www.rainforestapi.com/docs/product-data-api/overview
 * @param {string} productUrl
 * @returns {Promise<null | Awaited<ReturnType<typeof shapeRainforestToScrape>>>}
 */
export async function fetchAmazonProductRainforest(productUrl) {
  const apiKey = process.env.RAINFOREST_API_KEY;
  let hostname = "";
  try {
    hostname = new URL(productUrl).hostname;
  } catch {
    return null;
  }
  if (!apiKey || !isAmazonHostname(hostname)) return null;

  const ck = `${RF_CACHE_PREFIX}${productUrl}`;
  const hit = memoryCacheGet(ck);
  if (hit) return hit;

  const qs = new URLSearchParams({
    api_key: apiKey,
    type: "product",
    url: productUrl,
  });
  const res = await fetch(`https://api.rainforestapi.com/request?${qs.toString()}`);
  if (!res.ok) {
    console.warn("[apiManager/Rainforest]", res.status);
    return null;
  }
  const data = await res.json();
  if (data?.request_info?.success === false || data?.error) {
    console.warn("[apiManager/Rainforest]", data?.error || data?.message);
    return null;
  }

  const shaped = shapeRainforestToScrape(productUrl, data);
  if (shaped) memoryCacheSet(ck, shaped, RF_TTL_MS);
  return shaped;
}

/**
 * Map Rainforest JSON to the same shape as scrapeProductFromUrl (subset).
 */
function shapeRainforestToScrape(productUrl, data) {
  const p = data?.product;
  if (!p) return null;

  const title = String(p.title || "").trim() || "Imported product";
  let description = "";
  if (typeof p.description === "string") description = p.description;
  else if (p.feature_bullets && Array.isArray(p.feature_bullets)) {
    description = p.feature_bullets.map((b) => String(b)).join("\n");
  }

  let priceCurrent = null;
  let currency = "USD";
  const buy = p.buybox_winner || p.buybox || {};
  const priceObj = buy.price || p.price || p.pricing || {};
  if (priceObj?.value != null) priceCurrent = Number(priceObj.value);
  else if (priceObj?.raw != null) {
    const raw = String(priceObj.raw).replace(/[^0-9.,]/g, "").replace(",", ".");
    priceCurrent = Number.parseFloat(raw);
  }
  if (priceCurrent == null || Number.isNaN(priceCurrent)) return null;
  if (priceObj?.currency) currency = String(priceObj.currency).toUpperCase();

  const images = [];
  const main = p.main_image?.link || p.main_image;
  if (typeof main === "string") images.push(main);
  else if (main?.link) images.push(main.link);
  if (Array.isArray(p.images)) {
    for (const im of p.images) {
      const link = typeof im === "string" ? im : im?.link;
      if (link && !images.includes(link)) images.push(link);
    }
  }
  if (Array.isArray(p.image_urls)) {
    for (const link of p.image_urls) {
      if (link && !images.includes(link)) images.push(link);
    }
  }

  const hostname = new URL(productUrl).hostname;
  const rules = resolveDomainRules(hostname);
  let stockStatus = "unknown";
  const avail = String(p.availability?.raw || p.availability?.type || "").toLowerCase();
  if (avail.includes("in stock") || avail.includes("instock")) stockStatus = "in_stock";
  else if (avail.includes("out of stock") || avail.includes("unavailable")) stockStatus = "out_of_stock";

  let stockQty = null;
  const qtyRaw = p.stock_quantity ?? buy.max_order_quantity ?? p.inventory ?? buy.inventory_quantity;
  if (qtyRaw != null && Number.isFinite(Number(qtyRaw)) && Number(qtyRaw) >= 0) {
    stockQty = Math.min(99999, Math.floor(Number(qtyRaw)));
  }

  const { cleanUrls, flags } = flagImagesForReview(images);

  return {
    title,
    description,
    priceCurrent,
    currency,
    images: cleanUrls,
    stockStatus,
    stockQty,
    sourceUrl: productUrl,
    hostname,
    sourceType: rules.sourceType,
    defaultCountry: rules.defaultCountry,
    categorySlug: rules.categorySlug,
    pricingGroup: rules.pricingGroup,
    watermarkFlags: flags,
    usedPuppeteer: false,
    retailPartnerName: "",
    _connector: "rainforest",
  };
}
