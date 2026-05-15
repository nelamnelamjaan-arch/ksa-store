import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Glassmorphism Magic Import — POST /api/products/import (Kiran only).
 *
 * @param {{ token: string; displayCurrency?: string }} props
 */
export default function MagicAmazonImportPanel({ token, displayCurrency = "SAR" }) {
  const [amazonUrl, setAmazonUrl] = useState("");
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [productId, setProductId] = useState(null);

  async function importProduct() {
    setError("");
    setPreview(null);
    setProductId(null);
    if (!amazonUrl.trim()) {
      setError("Paste an Amazon product URL first.");
      return;
    }
    setPhase("loading");
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: amazonUrl.trim(),
          currency: displayCurrency,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPhase("idle");
        setError(json.message || `Import failed (${res.status})`);
        return;
      }
      setPhase("success");
      setAmazonUrl("");
      setPreview(json.preview || null);
      setProductId(json.product?._id || json.product?.id || null);
    } catch {
      setPhase("idle");
      setError("Network error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-violet-500/[0.07] p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
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
        Amazon → Rainforest scrape → Gemini VIP styling → 30% margin → catalogue.
      </p>

      <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          value={amazonUrl}
          onChange={(e) => setAmazonUrl(e.target.value)}
          disabled={phase === "loading"}
          placeholder="https://www.amazon.com/dp/…"
          className="min-w-0 flex-1 rounded-2xl border border-white/15 bg-black/25 px-4 py-3.5 text-sm text-white shadow-inner placeholder:text-white/30 backdrop-blur-md disabled:opacity-50"
        />
        <button
          type="button"
          disabled={phase === "loading"}
          onClick={importProduct}
          className="shrink-0 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet px-7 py-3.5 text-sm font-bold text-charcoal-950 shadow-lg transition hover:brightness-110 disabled:opacity-40"
        >
          Import Product
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="relative mt-5 flex items-center gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.08] px-4 py-4 backdrop-blur-md"
          >
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
            <span className="text-sm font-medium text-cyan-100/95">AI is styling your product…</span>
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
            className="relative mt-6 rounded-2xl border border-teal-500/25 bg-teal-500/[0.06] p-5 backdrop-blur-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200/90">
              Imported successfully
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-white">{preview.title}</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/65">
              {preview.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-neon-cyan">
                {preview.pricing?.formatted?.listSAR || preview.pricing?.listDisplay}
              </span>
              <span className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 font-mono text-white/80">
                {preview.pricing?.formatted?.listPKR}
              </span>
              <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/45">
                +{preview.pricing?.markupPercent ?? 30}% margin
              </span>
            </div>

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
