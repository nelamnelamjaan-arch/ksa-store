import { Router } from "express";
import { requireUser, requireRoles } from "../middleware/auth.js";
import { requireKiranGrandAdmin } from "../middleware/kiranAdmin.js";
import { USER_ROLES } from "../models/User.js";
import {
  getDashboard,
  getSettings,
  patchGlobalMargin,
  patchImportDefaults,
  importProductFromUrl,
  getEarnings,
  getEarningsTimeseries,
  getOrderVault,
  postSyncProductStock,
  patchPlatformEconomics,
  postClearServerCache,
  getAdminNotifications,
  patchAdminNotificationRead,
  postMagicImportPreview,
  postMagicImportPreviewAsync,
  getMagicImportPreviewJob,
  postMagicImportCommit,
  getMagicImportInventory,
  postMagicImportSyncAllPrices,
  patchMagicImportProduct,
  getProfitHeatmap,
  getWastageInsights,
  patchOrderPrescriptionReview,
  getOrderHyperlocalContext,
  patchOrderDelivery,
  patchOrderVipTracking,
  getStripePayoutDashboard,
} from "../controllers/adminController.js";
import { syncAllProductStocksFromSources } from "../services/automation/stockSyncJob.js";

const router = Router();

router.use(requireUser);
router.use(requireRoles(USER_ROLES.GRAND_ADMIN));
router.use(requireKiranGrandAdmin);

router.get("/dashboard", getDashboard);
router.get("/stripe-payout", getStripePayoutDashboard);
router.get("/settings", getSettings);
router.patch("/settings/margin", patchGlobalMargin);
router.patch("/settings/import-defaults", patchImportDefaults);
router.post("/import-from-url", importProductFromUrl);
router.post("/magic-import/preview", postMagicImportPreview);
router.post("/magic-import/preview-async", postMagicImportPreviewAsync);
router.get("/magic-import/preview-jobs/:jobId", getMagicImportPreviewJob);
router.post("/magic-import/commit", postMagicImportCommit);
router.get("/magic-import/inventory", getMagicImportInventory);
router.post("/magic-import/sync-prices", postMagicImportSyncAllPrices);
router.patch("/magic-import/products/:id", patchMagicImportProduct);
router.get("/earnings/timeseries", getEarningsTimeseries);
router.get("/earnings", getEarnings);
router.get("/orders/:id/vault", getOrderVault);
router.post("/products/:id/source-stock", postSyncProductStock);
router.patch("/settings/platform", patchPlatformEconomics);
router.post("/cache/clear", postClearServerCache);
router.get("/notifications", getAdminNotifications);
router.patch("/notifications/:id/read", patchAdminNotificationRead);

router.get("/insights/profit-heatmap", getProfitHeatmap);
router.get("/insights/wastage", getWastageInsights);
router.patch("/orders/:orderId/prescription-review", patchOrderPrescriptionReview);
router.get("/orders/:orderId/hyperlocal-context", getOrderHyperlocalContext);
router.patch("/orders/:orderId/delivery", patchOrderDelivery);
router.patch("/orders/:orderId/vip-tracking", patchOrderVipTracking);

router.post("/automation/sync-stocks", async (_req, res, next) => {
  try {
    const batch = await syncAllProductStocksFromSources();
    res.json({ updated: batch.length, batch });
  } catch (e) {
    next(e);
  }
});

export default router;
