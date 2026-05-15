import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Universal Magic Import — any product URL.
 *
 * @param {{
 *   token: string;
 *   displayCurrency?: string;
 *   importEndpoint?: string;
 *   loaderText?: string;
 *   successHint?: string;
 * }} props
 */
export default function MagicAmazonImportPanel({
  token,
  displayCurrency = "SAR",
  importEndpoint = "/api/products/import",
  loaderText = "AI is styling your product for the VIP collection…",
  successHint = "Status: Pending — approve in inventory when ready.",
}) {
  const [productUrl, setProductUrl] = useState("");
  const [categoryKey, setCategoryKey] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [productId, setProductId] = useState(null);
  const [progress, setProgress] = useState(0);

  async function importProduct() {
    setError("");
    setPreview(null);
    setProductId(null);
    if (!productUrl.trim()) {
      setError("Paste a product URL from any store.");
      return;
    }
    setPhase("loading");
    setProgress(8);
    const tick = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 4 + Math.random() * 6));
    }, 450);

    try {
      const res = await fetch(importEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: productUrl.trim(),
          currency: displayCurrency,
          ...(categoryKey ? { categoryKey } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      clearInterval(tick);
      if (!res.ok) {
        setPhase("idle");
        setProgress(0);
        setError(json.message || `Import failed (${res.status})`);
        return;
      }
      setProgress(100);
      setPhase("success");
      setProductUrl("");
      setPreview(json.preview || null);
      setProductId(json.product?._id || json.product?.id || null);
    } catch {
      clearInterval(tick);
      setPhase("idle");
      setProgress(0);
      setError("Network error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-lg">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-neon-cyan/10 blur-3xl"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-neon-violet/10 blur-3xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <h2 className="relative font-display text-lg font-semibold tracking-tight text-white">
        Magic Import
      </h2>
      <p className="relative mt-1 text-xs leading-relaxed text-white/50">
        Amazon → Rainforest API; other sites → axios + cheerio + Gemini VIP copy. Every price gets a
        30% margin in your display currency.
      </p>

      <div className="relative mt-4">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
          Category (optional)
        </label>
        <select
          value={categoryKey}
          onChange={(e) => setCategoryKey(e.target.value)}
          disabled={phase === "loading"}
          className="mt-1 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm text-white"
        >
          <option value="">Auto-detect</option>
          <option value="jewellery">Jewellery</option>
          <option value="makeup">Makeup</option>
          <option value="skincare">Skincare</option>
          <option value="shoes">Shoes</option>
          <option value="dresses_female">Women</option>
          <option value="dresses_male">Men</option>
          <option value="dresses_kids">Kids</option>
          <option value="gourmet">Gourmet Food</option>
          <option value="electronics">Electronics</option>
        </select>
      </div>

      <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          disabled={phase === "loading"}
          placeholder="https://any-store.com/product/…"
          className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/25 px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-white/30 backdrop-blur-md disabled:opacity-50"
        />
        <button
          type="button"
          disabled={phase === "loading"}
          onClick={importProduct}
          className={`shrink-0 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet px-7 py-3.5 text-sm font-bold text-charcoal-950 shadow-lg transition hover:brightness-110 disabled:opacity-40 ${
            phase === "loading" ? "ring-2 ring-neon-cyan/70 ring-offset-2 ring-offset-charcoal-950" : ""
          }`}
        >
          Magic Import
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="relative mt-5 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-lg"
          >
            <p className="text-sm font-medium text-cyan-100/95">{loaderText}</p>
            <div className="h-2 overflow-hidden rounded-full bg-black/40 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-teal-300 to-neon-violet shadow-[0_0_16px_rgba(0,229,255,0.55)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.35 }}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <p className="relative mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {error}
        </p>
      ) : null}

      <AnimatePresence>
        {phase === "success" && preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-lg"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">
              VIP preview · imported successfully
            </p>
            {successHint ? (
              <p className="mt-1 text-xs text-amber-200/80">{successHint}</p>
            ) : null}
            <h3 className="mt-2 font-display text-lg font-semibold text-white">{preview.title}</h3>
            <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-white/65">
              {preview.description}
            </p>

            <motion.div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-neon-cyan backdrop-blur-lg">
                {preview.pricing?.formatted?.markedUpDisplay ||
                  preview.pricing?.formatted?.finalPriceSAR ||
                  preview.pricing?.formatted?.listSAR}
              </span>
              <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/50 backdrop-blur-lg">
                +{preview.pricing?.markupPercent ?? 30}% markup
              </span>
              {preview.priceMissing ? (
                <span className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
                  Price missing at source — set manually
                </span>
              ) : null}
              {preview.status ? (
                <span className="rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-1.5 text-xs font-bold uppercase text-amber-200">
                  {preview.status}
                </span>
              ) : null}
            </motion.div>

            {preview.images?.length > 0 ? (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {preview.images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                ))}
              </div>
            ) : null}

            {productId ? (
              <Link
                to={`/products/${productId}`}
                className="mt-4 inline-block text-xs text-neon-cyan hover:underline"
              >
                View in storefront →
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
