import "dotenv/config";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { connectDb } from "./config/database.js";
import { ensureCatalogDefaults, seedDemoUsers } from "./config/seed.js";
import { ensureKiranAdmin } from "./config/ensureKiranAdmin.js";
import { closeBrowser } from "./services/automation/extractors/puppeteerFetcher.js";
import stripeWebhookHandler from "./webhooks/stripeWebhook.js";
import coinbaseWebhookHandler from "./webhooks/coinbaseWebhook.js";
import { geoLocaleMiddleware } from "./middleware/geoLocale.js";
import { currencyConversionMiddleware } from "./middleware/currencyConversion.js";
import { startLocalVendorStockHeartbeat } from "./services/automation/localVendorStockHeartbeat.js";
import { startGhostPurgeScheduler } from "./services/privacy/ghostPurgeScheduler.js";
import { startCronJobs } from "./services/cronJobs.js";
import { attachSocketIo } from "./socket/ioServer.js";
import { registerHourlyProductSyncJob } from "./queues/productQueues.js";
import { createKsaBullWorkers } from "./workers/productSync.processor.js";
import { sendRobotsTxt, sendSitemapXml } from "./controllers/seoPublicController.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));

app.get("/robots.txt", sendRobotsTxt);
app.get("/sitemap.xml", sendSitemapXml);

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);
app.post(
  "/api/webhooks/coinbase",
  express.raw({ type: "application/json" }),
  coinbaseWebhookHandler
);

app.use(express.json({ limit: "1mb" }));
app.use(geoLocaleMiddleware);
app.use(currencyConversionMiddleware);

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ksa-store-api" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
  });
});

async function bootstrap() {
  const connected = await connectDb();
  if (connected) {
    await ensureCatalogDefaults();
    await ensureKiranAdmin();
    if (process.env.SEED_DEMO === "true") {
      await seedDemoUsers();
    }
  }

  attachSocketIo(httpServer);

  if (process.env.ENABLE_BULL_SCHEDULER === "true") {
    try {
      await registerHourlyProductSyncJob();
    } catch (e) {
      console.warn("[BullMQ] scheduler registration failed:", e?.message || e);
    }
  }

  if (process.env.RUN_BULL_WORKER_IN_API === "true") {
    createKsaBullWorkers();
    console.warn(
      "[BullMQ] RUN_BULL_WORKER_IN_API is enabled — worker runs inside API process (dev only)."
    );
  }

  httpServer.listen(PORT, () => {
    console.log(`KSA Store API + WebSocket listening on http://localhost:${PORT}`);
    if (!connected) {
      console.warn("Start with MONGODB_URI for product and admin routes.");
    } else if (process.env.ENABLE_LOCAL_STOCK_HEARTBEAT === "true") {
      startLocalVendorStockHeartbeat();
      console.log("Local vendor stock heartbeat: hourly ping enabled.");
    }
    startGhostPurgeScheduler();
    startCronJobs();
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function shutdown() {
  try {
    await closeBrowser();
  } catch {
    /* ignore */
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
