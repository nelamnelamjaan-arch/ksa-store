/**
 * Persist global Gemini scrape results into the Product collection.
 * Maps Jewellery / Gourmet / Makeup to existing category slugs; dedupes by title + source domain.
 */

import crypto from "crypto";
import {
  Product,
  ORIGIN_TYPES,
  PRODUCT_STATUSES,
  PRODUCT_SOURCE_TYPES,
} from "../models/Product.js";
import { resolveSourcePlatform } from "../utils/catalog/sourcePlatform.js";
import {
  convertForeignAmountToSAR,
  applyMarginSAR,
} from "../utils/apiManager.js";
import { slugifyProductTitle, ensureUniqueProductSlug } from "../utils/productSlug.js";
import { parseScrapedPrice } from "./scraping/scrapeNormalizer.js";
import { resolveScrapeCatalogContext } from "./scraping/scrapeCatalogContext.js";

const CONNECTOR_PREFIX = "global_scrape";

/** @type {Record<string, string>} */
const CATEGORY_SLUG_MAP = {
  Jewellery: "luxury-jewellery",
  Gourmet: "gourmet-food-essentials",
  Makeup: "luxury-makeup",
};

/**
 * @param {string} sourceDomain
 * @param {string} title
 */
function globalScrapeConnector(sourceDomain, title) {
  const key = `${sourceDomain}::${title}`.toLowerCase();
  const hash = crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
  return `${CONNECTOR_PREFIX}:${hash}`;
}

/**
 * @param {import('./geminiParser.js').GlobalParsedProduct} item
 * @param {{ pageUrl: string; siteName: string; category: string; scrapedAt: Date }} ctx
 */
export async function upsertGlobalScrapedProduct(item, ctx) {
  const ctxCatalog = await resolveScrapeCatalogContext();
  const slugKey = CATEGORY_SLUG_MAP[ctx.category] || CATEGORY_SLUG_MAP.Makeup;
  const category = await ctxCatalog.resolveCategory(slugKey);

  const title = String(item.title || "").trim();
  if (!title) {
    const err = new Error("Global scrape item missing title");
    err.status = 422;
    throw err;
  }

  const priceNative =
    typeof item.price === "number"
      ? item.price
      : parseScrapedPrice(String(item.price ?? ""));
  if (priceNative == null) {
    const err = new Error(`Could not parse price for "${title}"`);
    err.status = 422;
    throw err;
  }

  const currency = String(item.currency || "USD").toUpperCase();
  const sourceDomain = String(item.source_domain || "").trim();
  const pageUrl = String(ctx.pageUrl || "").trim();
  const imageUrl = String(item.image_url || "").trim();
  const images = imageUrl ? [imageUrl] : [];
  const connector = globalScrapeConnector(sourceDomain || ctx.siteName, title);

  const inStock =
    !item.stock_status ||
    /in.?stock|available|yes/i.test(String(item.stock_status));

  let product =
    (await Product.findOne({ "automation.importConnector": connector }).exec()) ||
    (await Product.findOne({ sourceUrl: pageUrl, title }).exec()) ||
    (sourceDomain
      ? await Product.findOne({ source_store_name: sourceDomain, title }).exec()
      : null);

  const originalPriceSAR = await convertForeignAmountToSAR(priceNative, currency);
  const ksaPrice = applyMarginSAR(originalPriceSAR, ctxCatalog.marginPercent);

  const autoApprove = process.env.GLOBAL_SCRAPE_AUTO_APPROVE === "true";
  const status = autoApprove ? PRODUCT_STATUSES.APPROVED : PRODUCT_STATUSES.PENDING;
  const isActive = autoApprove;

  const description = String(item.description || "").trim();

  if (product) {
    product.title = title;
    product.description = description || product.description;
    product.sourceUrl = pageUrl;
    product.source_url = pageUrl;
    product.source_platform = resolveSourcePlatform(
      PRODUCT_SOURCE_TYPES.OTHER,
      sourceDomain
    );
    product.sourceType = PRODUCT_SOURCE_TYPES.OTHER;
    product.source_store_name = sourceDomain || ctx.siteName;
    product.original_price_native = priceNative;
    product.original_currency = currency;
    product.originalPrice = originalPriceSAR;
    product.ksaPrice = ksaPrice;
    product.marginPercentApplied = ctxCatalog.marginPercent;
    product.last_price_scraped_at = new Date();
    product.lastSourceStockCheckAt = new Date();
    product.storeStockStatus = inStock ? "in_stock" : "out_of_stock";
    if (images.length) product.images = images;

    if (!product.automation) product.automation = {};
    product.automation.scrapedFromUrl = pageUrl;
    product.automation.scrapedAt = ctx.scrapedAt;
    product.automation.nativeAmount = priceNative;
    product.automation.nativeCurrency = currency;
    product.automation.importConnector = connector;
    product.automation.retail_partner_name = sourceDomain;
    product.markModified("automation");

    product.$locals = { skipPriceRecalc: true };
    await product.save();

    return { action: "updated", productId: product._id, title: product.title };
  }

  const slug = await ensureUniqueProductSlug(slugifyProductTitle(title));

  product = new Product({
    title,
    slug,
    description,
    sourceUrl: pageUrl,
    source_url: pageUrl,
    source_platform: resolveSourcePlatform(PRODUCT_SOURCE_TYPES.OTHER, sourceDomain),
    sourceType: PRODUCT_SOURCE_TYPES.OTHER,
    source_store_name: sourceDomain || ctx.siteName,
    original_price_native: priceNative,
    original_currency: currency,
    originalPrice: originalPriceSAR,
    ksaPrice,
    marginPercentApplied: ctxCatalog.marginPercent,
    category: category._id,
    shop: ctxCatalog.shopId,
    shopSlug: ctxCatalog.shopSlug,
    createdBy: ctxCatalog.createdBy,
    sellerId: ctxCatalog.createdBy,
    images,
    status,
    approvalStatus: status,
    isActive,
    storeStockStatus: inStock ? "in_stock" : "out_of_stock",
    origin_type: ORIGIN_TYPES.GLOBAL_SCRAPED,
    pricingMode: "automation",
    last_price_scraped_at: new Date(),
    automation: {
      scrapedFromUrl: pageUrl,
      scrapedAt: ctx.scrapedAt,
      nativeAmount: priceNative,
      nativeCurrency: currency,
      importConnector: connector,
      retail_partner_name: sourceDomain,
    },
  });

  product.$locals = { skipPriceRecalc: true };
  await product.save();

  return { action: "created", productId: product._id, title: product.title };
}
