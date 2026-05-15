import mongoose from "mongoose";
import {
  Product,
  PRODUCT_SOURCE_TYPES,
  AGE_SEGMENTS,
  ORIGIN_TYPES,
} from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Shop } from "../models/Shop.js";
import { USER_ROLES } from "../models/User.js";
import { listAgeBasedRecommendations } from "../services/catalog/ageRecommendations.js";
import { deriveSourceVendorLabel } from "../utils/legal/sourceVendorLabel.js";
import { bumpProductHttpCacheVersion } from "../middleware/productReadCache.js";
import { slugifyProductTitle, ensureUniqueProductSlug } from "../utils/productSlug.js";
import { enqueueProductSeoJob } from "../queues/productQueues.js";
import { processProductSeoInBackground } from "../services/seo/productSeoJob.js";
import { importProductFromAmazonUrl } from "../services/productService.js";

const CAT_POPULATE =
  "name slug group marketplace_vertical catalog_key parent requires_prescription_review default_freshness_hours";

async function findProductLeanByParam(param) {
  const raw = String(param || "").trim();
  if (!raw) return null;
  if (mongoose.isValidObjectId(raw)) {
    const byId = await Product.findById(raw)
      .populate("category", CAT_POPULATE)
      .populate("shop", "name slug owner")
      .lean();
    if (byId) return byId;
  }
  return Product.findOne({ slug: raw.toLowerCase() })
    .populate("category", CAT_POPULATE)
    .populate("shop", "name slug owner")
    .lean();
}

function parseSourceType(value) {
  if (!value) return PRODUCT_SOURCE_TYPES.OTHER;
  const v = String(value).toLowerCase();
  return Object.values(PRODUCT_SOURCE_TYPES).includes(v)
    ? v
    : PRODUCT_SOURCE_TYPES.OTHER;
}

function escapeRegex(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createProduct(req, res, next) {
  try {
    if (req.user.role !== USER_ROLES.VENDOR_ADMIN) {
      return res.status(403).json({ message: "Only shop owners can list products" });
    }

    const {
      title,
      description = "",
      sourceUrl,
      sourceType,
      originalPrice,
      categoryId,
      shopId,
      images = [],
      age_segment,
      origin_type,
      service_cities,
      area_hint,
      perishable,
      freshness_expires_at,
      requires_prescription,
      source_vendor_label,
      source_store_name,
    } = req.body ?? {};

    if (!title || !sourceUrl || originalPrice === undefined || !categoryId || !shopId) {
      return res.status(400).json({
        message:
          "title, sourceUrl, originalPrice, categoryId, and shopId are required",
      });
    }

    const price = Number(originalPrice);
    if (Number.isNaN(price) || price < 0) {
      return res.status(400).json({ message: "originalPrice must be a non-negative number" });
    }

    if (!mongoose.isValidObjectId(categoryId) || !mongoose.isValidObjectId(shopId)) {
      return res.status(400).json({ message: "Invalid categoryId or shopId" });
    }

    const [category, shop] = await Promise.all([
      Category.findById(categoryId).lean(),
      Shop.findById(shopId).lean(),
    ]);

    if (!category) return res.status(400).json({ message: "Category not found" });
    if (!shop) return res.status(400).json({ message: "Shop not found" });

    if (String(shop.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only add products to your own shop" });
    }

    let ageSeg = AGE_SEGMENTS.ALL;
    if (age_segment && Object.values(AGE_SEGMENTS).includes(String(age_segment))) {
      ageSeg = String(age_segment);
    }
    let origin = ORIGIN_TYPES.GLOBAL_SCRAPED;
    if (origin_type && Object.values(ORIGIN_TYPES).includes(String(origin_type))) {
      origin = String(origin_type);
    }
    const cities = Array.isArray(service_cities)
      ? service_cities.map((s) => String(s).trim()).filter(Boolean)
      : [];
    let freshAt = null;
    if (freshness_expires_at) {
      const d = new Date(freshness_expires_at);
      if (!Number.isNaN(d.getTime())) freshAt = d;
    }

    const baseSlug = slugifyProductTitle(String(title).trim());
    const urlSlug = await ensureUniqueProductSlug(baseSlug);

    const product = await Product.create({
      title: String(title).trim(),
      slug: urlSlug,
      description: String(description ?? "").trim(),
      sourceUrl: String(sourceUrl).trim(),
      sourceType: parseSourceType(sourceType),
      originalPrice: price,
      ksaPrice: 0,
      category: categoryId,
      shop: shopId,
      createdBy: req.user._id,
      images: Array.isArray(images) ? images.map(String) : [],
      age_segment: ageSeg,
      origin_type: origin,
      service_cities: cities,
      area_hint: area_hint != null ? String(area_hint).trim() : "",
      perishable: Boolean(perishable),
      freshness_expires_at: freshAt,
      requires_prescription: Boolean(requires_prescription),
      source_vendor_label:
        source_vendor_label != null ? String(source_vendor_label).trim().slice(0, 160) : "",
      source_store_name:
        source_store_name != null ? String(source_store_name).trim().slice(0, 160) : "",
    });

    const populated = await Product.findById(product._id)
      .populate("category", CAT_POPULATE)
      .populate("shop", "name slug")
      .lean();

    const queuedSeo = await enqueueProductSeoJob(product._id);
    if (!queuedSeo) processProductSeoInBackground(product._id);

    await bumpProductHttpCacheVersion("product-created");
    return res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

export async function listFeaturedProducts(req, res, next) {
  try {
    const now = new Date();
    const products = await Product.find({
      isActive: true,
      featuredUntil: { $gt: now },
    })
      .populate("category", CAT_POPULATE)
      .populate("shop", "name slug")
      .sort({ featuredUntil: -1 })
      .limit(Math.min(Number(req.query.limit) || 24, 48))
      .lean();

    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function listAgeRecommendations(req, res, next) {
  try {
    const rows = await listAgeBasedRecommendations({
      age_segment: req.query.age_segment,
      city: req.query.city,
      vertical: req.query.vertical,
      limit: req.query.limit,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req, res, next) {
  try {
    const filter = { isActive: true };
    const andClauses = [];

    if (req.query.shopId && mongoose.isValidObjectId(req.query.shopId)) {
      filter.shop = req.query.shopId;
    }
    if (req.query.categoryId && mongoose.isValidObjectId(req.query.categoryId)) {
      filter.category = req.query.categoryId;
    } else if (req.query.vertical || req.query.catalog_key) {
      let ids = null;
      if (req.query.vertical) {
        ids = await Category.find({
          marketplace_vertical: String(req.query.vertical).toLowerCase(),
        }).distinct("_id");
      }
      if (req.query.catalog_key) {
        const ck = String(req.query.catalog_key).toLowerCase();
        const ckIds = await Category.find({ catalog_key: ck }).distinct("_id");
        if (ids === null) ids = ckIds;
        else {
          const allowed = new Set(ckIds.map(String));
          ids = ids.filter((id) => allowed.has(String(id)));
        }
      }
      if (!ids?.length) {
        return res.json([]);
      }
      filter.category = { $in: ids };
    }

    if (req.query.age_segment) {
      const ag = String(req.query.age_segment).toLowerCase();
      andClauses.push({
        $or: [{ age_segment: ag }, { age_segment: AGE_SEGMENTS.ALL }],
      });
    }

    if (req.query.origin_type && Object.values(ORIGIN_TYPES).includes(String(req.query.origin_type))) {
      filter.origin_type = String(req.query.origin_type);
    }

    if (req.query.city) {
      const city = String(req.query.city).trim();
      const rx = new RegExp(`^${escapeRegex(city)}$`, "i");
      andClauses.push({
        $or: [
          { origin_type: ORIGIN_TYPES.GLOBAL_SCRAPED },
          {
            origin_type: ORIGIN_TYPES.LOCAL_VENDOR,
            service_cities: { $elemMatch: { $regex: rx } },
          },
        ],
      });
    }

    if (andClauses.length) {
      filter.$and = andClauses;
    }

    const products = await Product.find(filter)
      .populate("category", CAT_POPULATE)
      .populate("shop", "name slug")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(req.query.limit) || 50, 100))
      .lean();

    res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await findProductLeanByParam(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    const source_vendor_display = deriveSourceVendorLabel(product);
    res.json({ ...product, source_vendor_display });
  } catch (err) {
    next(err);
  }
}

/** Cheaper local_vendor SKUs in the same vertical as the anchor global listing */
export async function getLocalAlternatives(req, res, next) {
  try {
    const anchor = await findProductLeanByParam(req.params.id);
    if (!anchor) return res.status(404).json({ message: "Product not found" });

    if (anchor.origin_type !== ORIGIN_TYPES.GLOBAL_SCRAPED) {
      return res.json({
        anchorId: anchor._id,
        anchorPrice: anchor.ksaPrice,
        reason: "not_global",
        alternatives: [],
      });
    }

    const vert = anchor.category?.marketplace_vertical;
    const catIds = vert
      ? await Category.find({ marketplace_vertical: vert }).distinct("_id")
      : [anchor.category?._id || anchor.category].filter(Boolean);

    const anchorPrice = Number(anchor.ksaPrice);
    if (!Number.isFinite(anchorPrice) || anchorPrice <= 0) {
      return res.json({
        anchorId: anchor._id,
        anchorPrice: anchor.ksaPrice,
        reason: "invalid_anchor_price",
        alternatives: [],
      });
    }

    const alternatives = await Product.find({
      isActive: true,
      storeStockStatus: { $ne: "out_of_stock" },
      origin_type: ORIGIN_TYPES.LOCAL_VENDOR,
      _id: { $ne: anchor._id },
      category: { $in: catIds },
      ksaPrice: { $lt: anchorPrice },
    })
      .populate("category", CAT_POPULATE)
      .populate("shop", "name slug")
      .sort({ ksaPrice: 1 })
      .limit(8)
      .lean();

    res.json({
      anchorId: anchor._id,
      anchorPrice: anchor.ksaPrice,
      alternatives,
    });
  } catch (err) {
    next(err);
  }
}

/** Kiran only: Magic Import — POST /api/products/import */
export async function importProduct(req, res, next) {
  try {
    const { url, shopId, currency } = req.body ?? {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "url is required (Amazon product page URL)" });
    }

    const result = await importProductFromAmazonUrl({
      amazonUrl: url.trim(),
      shopId,
      createdBy: req.user._id,
      displayCurrency: currency || req.money?.displayCurrency,
    });

    res.status(201).json({
      message: "Product imported to KSA Store",
      product: result.product,
      preview: result.preview,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

/** @deprecated Use `importProduct` — POST /api/products/import */
export const importAmazonProduct = importProduct;
