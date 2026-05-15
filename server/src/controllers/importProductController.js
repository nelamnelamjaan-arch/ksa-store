import { importProductFromAmazonUrl } from "../services/productService.js";

/**
 * POST /api/import-product
 * Body: { url: string, shopId?: string }
 */
export async function postImportProduct(req, res, next) {
  try {
    const { url, shopId } = req.body ?? {};
    if (!url || typeof url !== "string") {
      return res.status(400).json({ message: "url is required (Amazon product page URL)" });
    }

    const result = await importProductFromAmazonUrl({
      amazonUrl: url.trim(),
      shopId,
      createdBy: req.user._id,
      displayCurrency: req.body?.currency || req.money?.displayCurrency,
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
