import { Shop } from "../models/Shop.js";
import { Product, PRODUCT_STATUSES } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { importProductFromUrl } from "../services/productService.js";

async function getSellerShop(userId) {
  const shop = await Shop.findOne({ owner: userId }).lean();
  if (!shop) {
    const err = new Error("No shop linked to your account — contact Super Admin");
    err.status = 404;
    throw err;
  }
  if (!shop.isActive) {
    const err = new Error("Your shop is inactive");
    err.status = 403;
    throw err;
  }
  return shop;
}

export async function getSellerDashboard(req, res, next) {
  try {
    const shop = await getSellerShop(req.user._id);
    const shopId = shop._id;

    const [products, pendingCount, approvedCount, recentOrders] = await Promise.all([
      Product.find({ shop: shopId })
        .select("title slug ksaPrice status isActive createdAt images shopSlug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Product.countDocuments({
        shop: shopId,
        status: PRODUCT_STATUSES.PENDING,
      }),
      Product.countDocuments({
        shop: shopId,
        status: PRODUCT_STATUSES.APPROVED,
        isActive: true,
      }),
      Order.find({
        shop: shopId,
        "payment.status": "paid",
      })
        .select("ksaSerialGlobal totalSAR createdAt items payment")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    res.json({
      shop,
      stats: {
        pendingProducts: pendingCount,
        liveProducts: approvedCount,
        recentOrderCount: recentOrders.length,
      },
      recentProducts: products,
      recentOrders,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function listSellerProducts(req, res, next) {
  try {
    const shop = await getSellerShop(req.user._id);
    const filter = { shop: shop._id };
    if (req.query.status) {
      filter.status = String(req.query.status);
    }

    const products = await Product.find(filter)
      .select("title slug description ksaPrice originalPrice status isActive images sourceUrl shopSlug createdAt")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(req.query.limit) || 50, 100))
      .lean();

    res.json({ shop, products });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

export async function sellerImportProduct(req, res, next) {
  try {
    const { url, currency } = req.body ?? {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "url is required" });
    }

    const shop = await getSellerShop(req.user._id);

    const displayCurrency =
      currency || req.session?.currency || req.clientCurrency || req.money?.displayCurrency || "SAR";

    const result = await importProductFromUrl({
      productUrl: url.trim(),
      shopId: shop._id,
      createdBy: req.user._id,
      sellerId: req.user._id,
      displayCurrency,
      autoApprove: false,
    });

    res.status(201).json({
      message: "Product imported — pending Super Admin approval",
      product: result.product,
      preview: result.preview,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}
