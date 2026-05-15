import mongoose from "mongoose";
import { PlatformSettings } from "./PlatformSettings.js";
import { Category } from "./Category.js";
import { computeListedPriceSAR } from "../services/pricing/listedPrice.js";
import { resolveEssentialsMargin } from "../services/pricing/essentialsPricing.js";

export const PRODUCT_SOURCE_TYPES = Object.freeze({
  AMAZON: "amazon",
  ALIEXPRESS: "aliexpress",
  DARAZ: "daraz",
  OTTO: "otto",
  WALMART: "walmart",
  NOON: "noon",
  ZALANDO: "zalando",
  ETSY: "etsy",
  OUNASS: "ounass",
  OTHER: "other",
});

export const AGE_SEGMENTS = Object.freeze({
  INFANTS: "infants",
  KIDS: "kids",
  ADULTS: "adults",
  SENIORS: "seniors",
  ALL: "all",
});

export const ORIGIN_TYPES = Object.freeze({
  GLOBAL_SCRAPED: "global_scraped",
  LOCAL_VENDOR: "local_vendor",
});

const watermarkFlagSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    suspectWatermark: { type: Boolean, default: true },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const automationSchema = new mongoose.Schema(
  {
    scrapedFromUrl: { type: String, default: "" },
    scrapedAt: { type: Date },
    nativeAmount: { type: Number },
    nativeCurrency: { type: String, default: "USD" },
    listingCountry: { type: String, default: "US" },
    fxRateToSAR: { type: Number },
    regionalMarkupPercent: { type: Number },
    watermarkFlags: { type: [watermarkFlagSchema], default: [] },
    usedPuppeteer: { type: Boolean, default: false },
    stockStatus: { type: String, default: "unknown" },
    importConnector: { type: String, default: "" },
    connectorMarkupLocked: { type: Boolean, default: false },
    /** Scraped retail banner name (e.g. Carrefour Saudi Arabia) */
    retail_partner_name: { type: String, default: "", trim: true },
    sourceUnavailable: { type: Boolean, default: false },
    sourceUnavailableReason: { type: String, default: "" },
    sourceUnavailableAt: { type: Date, default: null },
    sourceUnavailableHttpStatus: { type: Number, default: null },
    /** Scraped partner quantity when available — drives low-stock urgency UI when under 10 */
    partnerStockQty: { type: Number, default: null, min: 0 },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    /** AI / editorial SEO payload for product detail pages and headless storefronts */
    seo: { type: seoSchema, default: undefined },
    /** SEO-friendly path segment (unique). Public URL: /products/:slug */
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      index: true,
      maxlength: 120,
    },
    /** Original supplier / marketplace listing */
    sourceUrl: { type: String, required: true, trim: true },
    sourceType: {
      type: String,
      enum: Object.values(PRODUCT_SOURCE_TYPES),
      default: PRODUCT_SOURCE_TYPES.OTHER,
    },
    /** Price from source catalogue (before KSA margin) — for automation: SAR after FX, before regional markup */
    originalPrice: { type: Number, required: true, min: 0 },
    /** Selling price on KSA Store */
    ksaPrice: { type: Number, required: true, min: 0 },
    /** Margin % applied at last save (audit) */
    marginPercentApplied: { type: Number, default: 20, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    images: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    /** platform = global settings margin; automation = regional engine + FX */
    pricingMode: {
      type: String,
      enum: ["platform", "automation"],
      default: "platform",
    },
    automation: { type: automationSchema, default: undefined },
    /** True when watermark heuristics fired — Grand Admin should review */
    automationReviewPending: { type: Boolean, default: false },
    /** KSA Store catalogue availability (synced from source listing) */
    storeStockStatus: {
      type: String,
      enum: ["in_stock", "out_of_stock", "unknown"],
      default: "in_stock",
    },
    lastSourceStockCheckAt: { type: Date, default: null },
    /** Homepage featured slot — set when vendor purchases a boost */
    featuredUntil: { type: Date, default: null },
    /** Universal Needs — life-stage merchandising & recommendations */
    age_segment: {
      type: String,
      enum: Object.values(AGE_SEGMENTS),
      default: AGE_SEGMENTS.ALL,
      index: true,
    },
    /** Sourcing model: scraped global catalogue vs hyper-local vendor stock */
    origin_type: {
      type: String,
      enum: Object.values(ORIGIN_TYPES),
      default: ORIGIN_TYPES.GLOBAL_SCRAPED,
      index: true,
    },
    /** Cities / areas where this SKU is eligible for same-day style fulfilment (local_vendor) */
    service_cities: { type: [String], default: [] },
    area_hint: { type: String, default: "", trim: true },
    perishable: { type: Boolean, default: false, index: true },
    /** Absolute expiry for “freshness timer” UI (perishables) */
    freshness_expires_at: { type: Date, default: null },
    /** Hourly stock heartbeat for local_vendor SKUs */
    last_vendor_stock_ping_at: { type: Date, default: null },
    /** Line-item Rx flag (category may also require review) */
    requires_prescription: { type: Boolean, default: false },
    /** Legal attribution: licensed partner / retail chain (e.g. "Nahdi Pharmacy") */
    source_vendor_label: { type: String, default: "", trim: true, maxlength: 160 },
    /** Display store name from scraper (may match source_vendor_label) */
    source_store_name: { type: String, default: "", trim: true, maxlength: 160 },
    /** When source price was last scraped (shown on product cards for volatile SKUs) */
    last_price_scraped_at: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ shop: 1, title: 1 });
productSchema.index({ category: 1 });
productSchema.index({ automationReviewPending: 1 });
productSchema.index({ storeStockStatus: 1 });
productSchema.index({ featuredUntil: 1, isActive: 1 });
productSchema.index({ "automation.sourceUnavailable": 1, isActive: 1 });
productSchema.index({ age_segment: 1, isActive: 1 });
productSchema.index({ origin_type: 1, service_cities: 1 });

productSchema.pre("validate", async function computeKsaPrice(next) {
  try {
    if (this.$locals?.skipPriceRecalc === true) {
      if (this.automation?.regionalMarkupPercent != null) {
        this.marginPercentApplied = this.automation.regionalMarkupPercent;
      }
      return next();
    }

    const settings = await PlatformSettings.getSingleton();
    const vat = settings.defaultVatPercent ?? 15;
    const ship = settings.defaultShippingSAR ?? 0;

    let categoryLean = null;
    if (this.category) {
      categoryLean = await Category.findById(this.category)
        .select("marketplace_vertical catalog_key")
        .lean();
    }
    const essentials = resolveEssentialsMargin(categoryLean);
    const wastageFeePercent = essentials.wastageFeePercent ?? 0;

    if (this.pricingMode === "automation") {
      let margin;
      if (
        this.automation?.connectorMarkupLocked &&
        typeof this.automation.regionalMarkupPercent === "number" &&
        !Number.isNaN(this.automation.regionalMarkupPercent) &&
        this.automation.regionalMarkupPercent >= 0
      ) {
        margin = this.automation.regionalMarkupPercent;
      } else if (essentials.markupPercent != null) {
        margin = essentials.markupPercent;
      } else {
        margin =
          typeof settings.globalMarkupPercentage === "number" &&
          !Number.isNaN(settings.globalMarkupPercentage)
            ? settings.globalMarkupPercentage
            : settings.globalProfitMarginPercent ?? 20;
        if (this.automation) {
          this.automation.regionalMarkupPercent = margin;
        }
      }
      this.marginPercentApplied = margin;
      const { total } = computeListedPriceSAR({
        sourcePriceSAR: this.originalPrice,
        markupPercent: margin,
        vatPercent: vat,
        shippingFlatSAR: ship,
        wastageFeePercent,
      });
      this.ksaPrice = total;
    } else {
      const margin =
        essentials.markupPercent != null
          ? essentials.markupPercent
          : settings.globalProfitMarginPercent;
      this.marginPercentApplied = margin;
      const { total } = computeListedPriceSAR({
        sourcePriceSAR: this.originalPrice,
        markupPercent: margin,
        vatPercent: vat,
        shippingFlatSAR: ship,
        wastageFeePercent,
      });
      this.ksaPrice = total;
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
