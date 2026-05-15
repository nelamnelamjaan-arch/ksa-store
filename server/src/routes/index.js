import { Router } from "express";
import authRouter from "./auth.js";
import productsRouter from "./products.js";
import adminRouter from "./admin.js";
import categoriesRouter from "./categories.js";
import usersRouter from "./users.js";
import shopsRouter from "./shops.js";
import conciergeRouter from "./concierge.js";

import checkoutRouter from "./checkout.js";
import ordersRouter from "./orders.js";
import walletRouter from "./wallet.js";
import vendorRouter from "./vendor.js";
import alertsRouter from "./alerts.js";
import searchRouter from "./search.js";
import { getClientContext } from "../controllers/clientContextController.js";
import subscriptionsRouter from "./subscriptions.js";
import importRouter from "./import.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    name: "KSA Store API",
    version: "0.5.0",
    tiers: ["grand_admin", "vendor_admin", "customer"],
    docs: {
      products:
        "GET/POST /api/products, POST /api/products/import (Kiran · Magic Import), GET /api/products/featured",
      checkout:
        "POST /api/checkout/stripe | /api/checkout/stripe/payment-intent (PaymentIntent + Elements) | /api/checkout/crypto (optional prescriptionUploads[] https URLs)",
      subscriptions: "GET/POST /api/subscriptions (JWT)",
      recommendations: "GET /api/products/recommendations?age_segment=adults&city=Riyadh&vertical=healthcare",
      orders: "GET /api/orders (customer)",
      wallet: "GET /api/wallet, POST /api/wallet/withdraw (vendor)",
      vendor: "POST /api/vendor/products/:productId/boost",
      admin:
        "GET /api/admin/dashboard, GET /api/admin/stripe-payout, GET /api/admin/insights/profit-heatmap, GET /api/admin/insights/wastage, PATCH /api/admin/orders/:orderId/prescription-review, …",
      import:
        "POST /api/import-product (Kiran only) | POST /api/admin/import-from-url | Magic Import: POST /api/admin/magic-import/preview, …",
      webhooks: "POST /api/webhooks/stripe | /api/webhooks/coinbase",
      categories: "GET /api/categories",
      register: "POST /api/users/register",
      authGoogle: "POST /api/auth/google { credential }",
      authMe: "GET /api/auth/me (Authorization: Bearer …)",
      shops: "POST /api/shops (x-user-id: vendor)",
    },
  });
});

router.get("/client-context", getClientContext);
router.use("/alerts", alertsRouter);
router.use("/search", searchRouter);

router.use("/auth", authRouter);
router.use("/", importRouter);
router.use("/concierge", conciergeRouter);
router.use("/products", productsRouter);
router.use("/admin", adminRouter);
router.use("/categories", categoriesRouter);
router.use("/users", usersRouter);
router.use("/shops", shopsRouter);
router.use("/checkout", checkoutRouter);
router.use("/orders", ordersRouter);
router.use("/wallet", walletRouter);
router.use("/vendor", vendorRouter);
router.use("/subscriptions", subscriptionsRouter);

export default router;
