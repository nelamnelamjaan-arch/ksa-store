import mongoose from "mongoose";
import { Product } from "../../models/Product.js";
import { generateProductSeoWithGemini } from "./seoService.js";
import { bumpProductHttpCacheVersion } from "../../middleware/productReadCache.js";

/**
 * Load product + category, run Gemini SEO, persist `product.seo`, bump HTTP cache.
 * @param {string} productId
 */
export async function applyGeminiSeoToProduct(productId) {
  if (!mongoose.isValidObjectId(String(productId))) return { ok: false, reason: "bad_id" };

  const product = await Product.findById(productId).populate("category", "name slug marketplace_vertical catalog_key");
  if (!product) return { ok: false, reason: "not_found" };

  const cat = product.category;
  const seo = await generateProductSeoWithGemini({
    title: product.title,
    categoryName: cat?.name || "General",
    categorySlug: cat?.slug || "",
    verticalHint: cat?.marketplace_vertical || cat?.catalog_key || "",
  });

  if (!seo) {
    return { ok: false, reason: "no_seo" };
  }

  product.seo = {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords,
  };
  product.markModified("seo");
  await product.save();
  await bumpProductHttpCacheVersion("product-seo-gemini");
  return { ok: true, source: seo.source };
}

/**
 * Fire-and-forget when Bull queue is unavailable (dev without Redis).
 * @param {string} productId
 */
export function processProductSeoInBackground(productId) {
  void (async () => {
    try {
      const out = await applyGeminiSeoToProduct(productId);
      if (!out.ok && out.reason !== "no_seo") {
        console.warn("[productSeoJob] background SEO", productId, out);
      }
    } catch (e) {
      console.warn("[productSeoJob] background SEO failed", productId, e?.message || e);
    }
  })();
}
