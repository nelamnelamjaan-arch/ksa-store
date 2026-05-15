import { PRODUCT_STATUSES } from "../../models/Product.js";
import {
  convertForeignAmountToSAR,
  applyMarginSAR,
  MARKUP_PERCENT,
} from "../../utils/apiManager.js";
import { appendAutomationLog } from "../automation/automationLog.js";

/** Live scraped listings with a monitorable source URL */
export function activeScrapedProductQuery() {
  return {
    isActive: true,
    status: PRODUCT_STATUSES.APPROVED,
    sourceUrl: { $exists: true, $ne: "" },
    origin_type: "global_scraped",
  };
}

/**
 * Apply a lightweight source snapshot (price + stock) to a product document.
 * @param {import("../../models/Product.js").Product} product
 * @param {{ priceCurrent: number; currency: string; stockStatus: string }} snapshot
 * @returns {Promise<"updated" | "hidden">}
 */
export async function applySourcePriceSnapshotToProduct(product, snapshot) {
  const margin =
    Number(product.marginPercentApplied) > 0 ? product.marginPercentApplied : MARKUP_PERCENT;

  const originalPriceSAR = await convertForeignAmountToSAR(
    snapshot.priceCurrent,
    snapshot.currency
  );
  product.originalPrice = originalPriceSAR;
  product.ksaPrice = applyMarginSAR(originalPriceSAR, margin);
  product.last_price_scraped_at = new Date();
  product.lastSourceStockCheckAt = new Date();
  product.storeStockStatus =
    snapshot.stockStatus === "in_stock"
      ? "in_stock"
      : snapshot.stockStatus === "out_of_stock"
        ? "out_of_stock"
        : "unknown";

  if (!product.automation) product.automation = {};
  product.automation.stockStatus = snapshot.stockStatus;
  product.automation.nativeAmount = snapshot.priceCurrent;
  product.automation.nativeCurrency = snapshot.currency;
  product.automation.scrapedAt = new Date();
  product.markModified("automation");

  if (snapshot.stockStatus === "out_of_stock") {
    product.status = PRODUCT_STATUSES.HIDDEN;
    product.approvalStatus = PRODUCT_STATUSES.HIDDEN;
    product.isActive = false;
    await product.save();
    appendAutomationLog({
      service: "cron",
      level: "warn",
      message: `Hidden (source OOS): ${product.title}`,
      meta: { productId: String(product._id) },
    });
    return "hidden";
  }

  await product.save();
  return "updated";
}
