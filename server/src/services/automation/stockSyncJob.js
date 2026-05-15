import { Product } from "../../models/Product.js";
import { syncProductStockFromSource } from "./syncProductStock.js";

const BATCH = 25;

/** Call from a cron worker to refresh source availability across the catalogue. */
export async function syncAllProductStocksFromSources() {
  const products = await Product.find({
    isActive: true,
    sourceUrl: { $exists: true, $ne: "" },
  })
    .limit(BATCH)
    .sort({ lastSourceStockCheckAt: 1 });

  const results = [];
  for (const p of products) {
    const r = await syncProductStockFromSource(p);
    results.push({ id: p._id.toString(), ...r });
  }
  return results;
}
