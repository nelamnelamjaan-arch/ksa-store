import mongoose from "mongoose";
import {
  Product,
  PRODUCT_SOURCE_TYPES,
  ORIGIN_TYPES,
} from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Shop } from "../models/Shop.js";
import { PlatformSettings } from "../models/PlatformSettings.js";
import { fetchAmazonProductByUrl } from "./amazonService.js";
import { slugifyProductTitle, ensureUniqueProductSlug } from "../utils/productSlug.js";
import { bumpProductHttpCacheVersion } from "../middleware/productReadCache.js";
import { enqueueProductSeoJob } from "../queues/productQueues.js";
import { processProductSeoInBackground } from "./seo/productSeoJob.js";
import { convertToSAR } from "../utils/pricing/calculateKSAStorePrice.js";
import { convertSARTo } from "../utils/pricing/currencyConversion.js";

const MARKUP_PERCENT = 30;

const GEMINI_VIP_INSTRUCTION =
  "Rewrite this description for KSA Store. The tone must be VIP, minimalist, and luxury. Focus on premium quality and remove all mentions of Amazon.";

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function formatMoney(amount, currency) {
  const v = round2(amount);
  return `${v.toFixed(2)} ${currency}`;
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

/**
 * Step B — Gemini VIP rewrite (title + description).
 */
export async function rewriteAmazonDescriptionWithGemini(title, description) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    const err = new Error("GEMINI_API_KEY is not configured");
    err.status = 503;
    throw err;
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const userText = `${GEMINI_VIP_INSTRUCTION}

Original title:
${title}

Original description:
${description || "(no description provided)"}

Respond with STRICT JSON only: { "title": string, "description": string }`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = new Error(`Gemini rewrite failed (${res.status})`);
    err.status = 502;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = parseJsonObject(text);
  if (!parsed?.title) {
    const err = new Error("Gemini returned an invalid rewrite payload");
    err.status = 502;
    throw err;
  }

  return {
    title: String(parsed.title).trim(),
    description: String(parsed.description || "").trim(),
    source: "gemini",
  };
}

async function resolveImportCategory() {
  let category = await Category.findOne({ slug: "premium-home-living", parent: null }).lean();
  if (!category) category = await Category.findOne({ parent: null }).lean();
  if (!category) {
    const err = new Error("No categories in database — run seed");
    err.status = 500;
    throw err;
  }
  return category;
}

/**
 * Step C — FX to SAR, 30% margin, formatted SAR/PKR display prices.
 */
export function computeImportPricing(buyboxPrice, sourceCurrency) {
  const originalPriceSAR = convertToSAR(buyboxPrice, sourceCurrency);
  const ksaPrice = round2(originalPriceSAR * (1 + MARKUP_PERCENT / 100));
  const pkrPrice = round2(convertSARTo(ksaPrice, "PKR"));

  return {
    buyboxPrice,
    sourceCurrency: String(sourceCurrency || "USD").toUpperCase(),
    originalPriceSAR,
    ksaPrice,
    markupPercent: MARKUP_PERCENT,
    formatted: {
      originalSAR: formatMoney(originalPriceSAR, "SAR"),
      listSAR: formatMoney(ksaPrice, "SAR"),
      listPKR: formatMoney(pkrPrice, "PKR"),
    },
  };
}

/**
 * Magic Import: Rainforest → Gemini → markup → MongoDB Products.
 */
export async function importProductFromAmazonUrl({
  amazonUrl,
  shopId: bodyShopId,
  createdBy,
  displayCurrency,
}) {
  const settings = await PlatformSettings.getSingleton();
  const shopId = bodyShopId || settings.defaultImportShopId;
  if (!shopId) {
    const err = new Error(
      "Provide shopId in the body or set defaultImportShopId via PATCH /api/admin/settings/import-defaults"
    );
    err.status = 400;
    throw err;
  }
  if (!mongoose.isValidObjectId(String(shopId))) {
    const err = new Error("Invalid shopId");
    err.status = 400;
    throw err;
  }

  const shop = await Shop.findById(shopId).lean();
  if (!shop) {
    const err = new Error("Shop not found");
    err.status = 400;
    throw err;
  }

  const scraped = await fetchAmazonProductByUrl(amazonUrl);
  const ai = await rewriteAmazonDescriptionWithGemini(scraped.title, scraped.description);
  const pricing = computeImportPricing(scraped.price, scraped.currency);

  const preferredCurrency = String(displayCurrency || "SAR").toUpperCase();
  const listDisplay =
    preferredCurrency === "PKR" ? pricing.formatted.listPKR : pricing.formatted.listSAR;

  const category = await resolveImportCategory();
  const slug = await ensureUniqueProductSlug(slugifyProductTitle(ai.title));

  const product = new Product({
    title: ai.title,
    slug,
    description: ai.description,
    sourceUrl: scraped.sourceUrl,
    sourceType: PRODUCT_SOURCE_TYPES.AMAZON,
    originalPrice: pricing.originalPriceSAR,
    ksaPrice: pricing.ksaPrice,
    marginPercentApplied: MARKUP_PERCENT,
    category: category._id,
    shop: shopId,
    createdBy,
    images: scraped.images,
    isActive: true,
    origin_type: ORIGIN_TYPES.GLOBAL_SCRAPED,
    pricingMode: "platform",
    last_price_scraped_at: new Date(),
    automation: {
      scrapedFromUrl: scraped.sourceUrl,
      scrapedAt: new Date(),
      nativeAmount: scraped.price,
      nativeCurrency: scraped.currency,
      listingCountry: "US",
      fxRateToSAR: pricing.originalPriceSAR / (scraped.price || 1),
      regionalMarkupPercent: MARKUP_PERCENT,
      importConnector: "rainforest_api",
    },
  });

  product.$locals = { skipPriceRecalc: true };
  await product.save();

  bumpProductHttpCacheVersion();
  if (process.env.REDIS_URL) {
    enqueueProductSeoJob(product._id).catch(() => {});
  } else {
    processProductSeoInBackground(product._id).catch(() => {});
  }

  return {
    product: product.toObject(),
    preview: {
      title: ai.title,
      description: ai.description,
      images: scraped.images.slice(0, 6),
      asin: scraped.asin,
      sourceUrl: scraped.sourceUrl,
      pricing: {
        ...pricing,
        listDisplay,
        displayCurrency: preferredCurrency,
      },
      aiSource: ai.source,
    },
  };
}
