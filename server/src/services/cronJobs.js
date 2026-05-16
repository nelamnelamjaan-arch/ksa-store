/**
 * KSA Store scheduled jobs:
 * - Auto-Pilot price/stock sync every 6 hours (ENABLE_CRON_AUTOPILOT=true)
 * - Top-sellers price refresh every 24h (ENABLE_CRON_TOP_SELLERS_PRICE_REFRESH=true)
 * - Daily profit report email at 23:59 (ENABLE_DAILY_PROFIT_REPORT=true)
 * - Scheduled target scrape at midnight (ENABLE_SCRAPE_CRON=true, long-running host only)
 * - AI Gemini scrape at midnight (ENABLE_AI_SCRAPE_CRON=true, long-running host only)
 * - Global marketplace scrape at midnight (ENABLE_GLOBAL_SCRAPE_CRON=true, long-running host only)
 *
 * Also re-exported from server/src/utils/cronJobs.js
 */

import cron from "node-cron";
import { Product } from "../models/Product.js";
import { fetchSourcePriceStock } from "../utils/apiManager.js";
import { appendAutomationLog, updateCronStatus } from "./automation/automationLog.js";
import { bumpProductHttpCacheVersion } from "../middleware/productReadCache.js";
import { runDailyProfitReportJob } from "./reports/dailyProfitReportJob.js";
import {
  activeScrapedProductQuery,
  applySourcePriceSnapshotToProduct,
} from "./pricing/sourcePriceRefresh.js";
import { runTopSellingPriceRefreshJob } from "./pricing/topSellingPriceRefreshJob.js";
import { startScheduledScrapeCron } from "../jobs/scheduledScrapeCron.js";
import { startScheduledAiScrapeCron } from "../jobs/scheduledAiScrapeCron.js";
import { startGlobalScrapeCron } from "../jobs/globalScrapeCron.js";

let scheduled = false;
let topSellersScheduled = false;
let dailyReportScheduled = false;
let running = false;

export async function runAutoPilotSyncJob() {
  if (running) {
    appendAutomationLog({ service: "cron", level: "warn", message: "Skipped — previous run still active" });
    return { skipped: true };
  }

  running = true;
  const started = Date.now();
  let checked = 0;
  let updated = 0;
  let hidden = 0;
  let errors = 0;

  appendAutomationLog({ service: "cron", message: "6-hour Auto-Pilot sync started" });

  try {
    const products = await Product.find(activeScrapedProductQuery())
      .select("title sourceUrl originalPrice ksaPrice marginPercentApplied automation storeStockStatus status")
      .limit(500)
      .exec();

    for (const product of products) {
      checked += 1;
      const snap = await fetchSourcePriceStock(product.sourceUrl);
      if (!snap.ok) {
        errors += 1;
        continue;
      }

      try {
        const result = await applySourcePriceSnapshotToProduct(product, snap);
        if (result === "hidden") hidden += 1;
        else if (result === "updated") updated += 1;
      } catch (err) {
        errors += 1;
        appendAutomationLog({
          service: "cron",
          level: "error",
          message: `DB update failed: ${product.title} — ${err.message}`,
        });
      }

      await new Promise((r) => setTimeout(r, 800));
    }

    if (updated > 0 || hidden > 0) {
      await bumpProductHttpCacheVersion("autopilot-cron");
    }

    const durationMs = Date.now() - started;
    updateCronStatus({
      lastRunAt: new Date().toISOString(),
      lastDurationMs: durationMs,
      productsChecked: checked,
      productsUpdated: updated,
      productsHidden: hidden,
    });

    appendAutomationLog({
      service: "cron",
      message: `Auto-Pilot finished — checked ${checked}, updated ${updated}, hidden ${hidden}, errors ${errors}`,
      meta: { durationMs },
    });

    return { checked, updated, hidden, errors, durationMs };
  } finally {
    running = false;
  }
}

const CRON_TZ = process.env.CRON_TIMEZONE || "Asia/Riyadh";

/** Daily at 04:00 — refresh prices for best-selling SKUs */
const TOP_SELLERS_CRON = process.env.CRON_TOP_SELLERS_SCHEDULE || "0 4 * * *";

/**
 * Schedule Auto-Pilot (6h) + top-sellers (24h) + nightly profit report (23:59).
 */
export function startCronJobs() {
  if (process.env.ENABLE_CRON_AUTOPILOT === "true" && !scheduled) {
    cron.schedule(
      "0 */6 * * *",
      () => {
        runAutoPilotSyncJob().catch((err) => {
          appendAutomationLog({
            service: "cron",
            level: "error",
            message: `Auto-Pilot crash: ${err.message}`,
          });
        });
      },
      { timezone: CRON_TZ }
    );

    scheduled = true;
    console.log(`[cronJobs] Auto-Pilot every 6h (timezone: ${CRON_TZ})`);

    if (process.env.CRON_AUTOPILOT_RUN_ON_BOOT === "true") {
      setTimeout(() => {
        runAutoPilotSyncJob().catch(() => {});
      }, 15_000);
    }
  } else if (!scheduled) {
    console.log("[cronJobs] Auto-Pilot disabled (ENABLE_CRON_AUTOPILOT=true)");
  }

  if (process.env.ENABLE_CRON_TOP_SELLERS_PRICE_REFRESH === "true" && !topSellersScheduled) {
    cron.schedule(
      TOP_SELLERS_CRON,
      () => {
        runTopSellingPriceRefreshJob().catch((err) => {
          appendAutomationLog({
            service: "cron",
            level: "error",
            message: `Top-sellers price refresh crash: ${err.message}`,
          });
        });
      },
      { timezone: CRON_TZ }
    );

    topSellersScheduled = true;
    console.log(
      `[cronJobs] Top-sellers price refresh daily (${TOP_SELLERS_CRON}, timezone: ${CRON_TZ})`
    );

    if (process.env.CRON_TOP_SELLERS_RUN_ON_BOOT === "true") {
      setTimeout(() => {
        runTopSellingPriceRefreshJob().catch(() => {});
      }, 30_000);
    }
  } else if (!topSellersScheduled) {
    console.log(
      "[cronJobs] Top-sellers price refresh disabled (ENABLE_CRON_TOP_SELLERS_PRICE_REFRESH=true)"
    );
  }

  if (process.env.ENABLE_DAILY_PROFIT_REPORT === "true" && !dailyReportScheduled) {
    cron.schedule(
      "59 23 * * *",
      () => {
        runDailyProfitReportJob().catch((err) => {
          appendAutomationLog({
            service: "daily-report",
            level: "error",
            message: `Nightly report crash: ${err.message}`,
          });
        });
      },
      { timezone: CRON_TZ }
    );

    dailyReportScheduled = true;
    console.log(`[cronJobs] Daily profit report at 23:59 (timezone: ${CRON_TZ})`);
  } else if (!dailyReportScheduled) {
    console.log("[cronJobs] Daily profit report disabled (ENABLE_DAILY_PROFIT_REPORT=true)");
  }

  startScheduledScrapeCron();
  startScheduledAiScrapeCron();
  startGlobalScrapeCron();
}

export { runDailyProfitReportJob, runTopSellingPriceRefreshJob };
