import { motion } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import {
  computeEstimatedFreshnessPercent,
  isGroceryFreshnessCategory,
  resolveShelfLifeHours,
} from "../../utils/catalogFreshness.js";
import { isJewelleryCategory, premiumBadgeLabel } from "../../utils/productCategoryUi.js";
import SourceBadge from "../marketplace/SourceBadge.jsx";

/** Tiny neutral blur placeholder (SVG) for VIP lazy-load cards */
const CARD_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 10'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%231a1f2e'/%3E%3Cstop offset='1' stop-color='%230d1117'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='8' height='10' fill='url(%23g)'/%3E%3C/svg%3E";

export default function ProductCard({
  title,
  price,
  tag,
  image,
  index = 0,
  lastPriceScrapedAt,
  stockStatus,
  category,
  perishable,
  vipGourmetBadge = false,
  gourmetTheme = false,
  jewelleryTheme = false,
  sourceType,
  sourcePlatform,
  originCountry,
  priceComparisonAvailable = false,
}) {
  const jewellery = jewelleryTheme || isJewelleryCategory(category);
  const premiumBadge = premiumBadgeLabel(category, vipGourmetBadge);
  const updatedLabel =
    lastPriceScrapedAt &&
    (() => {
      try {
        return new Date(lastPriceScrapedAt).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        });
      } catch {
        return null;
      }
    })();

  const shelfH = resolveShelfLifeHours({ category, perishable });
  const freshnessPct =
    isGroceryFreshnessCategory(category) && lastPriceScrapedAt && shelfH
      ? computeEstimatedFreshnessPercent(lastPriceScrapedAt, shelfH)
      : null;
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <motion.div
        className={
          jewellery
            ? "jewellery-card-vip transition-all duration-500 ease-vip group-hover:-translate-y-1"
            : `relative overflow-hidden rounded-2xl border shadow-glass backdrop-blur-xl transition-all duration-500 ease-vip group-hover:-translate-y-1 ${
                gourmetTheme
                  ? "border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.08] to-amber-500/[0.06] group-hover:border-amber-300/40 group-hover:shadow-[0_0_28px_rgba(52,211,153,0.2)]"
                  : "border-white/[0.08] bg-white/[0.04] group-hover:border-neon-cyan/35 group-hover:shadow-neon-strong"
              }`
        }
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          {image ? (
            <LazyLoadImage
              src={image}
              alt={title ? String(title).slice(0, 120) : "Product"}
              role="presentation"
              effect="blur"
              placeholderSrc={CARD_IMAGE_PLACEHOLDER}
              threshold={120}
              wrapperClassName="!absolute !inset-0 !block !h-full !w-full"
              className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${jewellery ? "jewellery-card-vip__image" : ""}`}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-charcoal-850 to-navy-900" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />
          {vipGourmetBadge ? (
            <span className="absolute left-3 top-3 rounded-full border border-amber-400/50 bg-gradient-to-r from-emerald-600/90 to-amber-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgba(251,191,36,0.35)] backdrop-blur-md">
              VIP Gourmet
            </span>
          ) : premiumBadge ? (
            <span
              className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                jewellery
                  ? "border-amber-300/60 bg-amber-950/70 text-amber-100 shadow-[0_0_14px_rgba(250,204,21,0.35)]"
                  : "border-white/20 bg-black/50 text-neon-cyan"
              }`}
            >
              {premiumBadge}
            </span>
          ) : tag ? (
            <span
              className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                gourmetTheme
                  ? "border-emerald-400/40 bg-emerald-950/60 text-emerald-200"
                  : "border-white/10 bg-black/40 text-neon-cyan"
              }`}
            >
              {tag}
            </span>
          ) : null}
          {sourceType || sourcePlatform ? (
            <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1.5">
              <SourceBadge
                sourceType={sourceType}
                sourcePlatform={sourcePlatform}
                originCountry={originCountry}
              />
              {priceComparisonAvailable ? (
                <span className="rounded-full border border-neon-violet/40 bg-neon-violet/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neon-violet backdrop-blur-md">
                  Price compare
                </span>
              ) : null}
            </div>
          ) : null}
          {freshnessPct != null ? (
            <div
              className={`absolute right-3 flex h-14 w-14 flex-col items-center justify-center rounded-full border border-emerald-400/30 bg-charcoal-950/75 text-center shadow-lg backdrop-blur-md ${
                sourceType || sourcePlatform ? "top-[4.75rem]" : "top-3"
              }`}
              title="Estimated freshness from last partner sync"
            >
              <span className="text-[10px] font-bold leading-none text-emerald-300">{freshnessPct}%</span>
              <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-wide text-white/50">
                fresh
              </span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              className="pointer-events-auto w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3 text-sm font-bold tracking-wide text-charcoal-950 shadow-lg shadow-neon-cyan/30 transition hover:brightness-110"
            >
              Quick Buy
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <h3 className="font-display text-base font-semibold tracking-tight text-white line-clamp-2">
            {title}
          </h3>
          <p
            className={`mt-2 font-sans text-lg font-semibold ${
              jewellery
                ? "bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent"
                : gourmetTheme
                  ? "bg-gradient-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent"
                  : "text-gradient-vip"
            }`}
          >
            {price}
          </p>
          {updatedLabel ? (
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-white/35">
              Price last updated · <time dateTime={lastPriceScrapedAt}>{updatedLabel}</time>
            </p>
          ) : null}
          {freshnessPct != null ? (
            <p className="mt-1 text-[10px] text-emerald-300/90">
              Estimated freshness · {freshnessPct}% (partner sync clock)
            </p>
          ) : null}
          {stockStatus && stockStatus !== "unknown" ? (
            <p className="mt-1 text-[10px] text-white/40">Partner stock: {stockStatus.replace("_", " ")}</p>
          ) : null}
        </div>
      </motion.div>
    </motion.article>
  );
}
