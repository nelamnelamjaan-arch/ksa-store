const SOURCE_META = {
  amazon: { label: "Amazon", className: "from-amber-500/90 to-orange-600/90" },
  walmart: { label: "Walmart", className: "from-blue-600/90 to-blue-800/90" },
  ebay: { label: "eBay", className: "from-red-500/90 to-yellow-500/90" },
  noon: { label: "Noon", className: "from-yellow-400/90 to-amber-500/90" },
  aliexpress: { label: "AliExpress", className: "from-orange-500/90 to-red-600/90" },
  daraz: { label: "Daraz", className: "from-orange-600/90 to-pink-600/90" },
  zalando: { label: "Zalando", className: "from-neutral-600/90 to-neutral-800/90" },
  flipkart: { label: "Flipkart", className: "from-blue-500/90 to-indigo-700/90" },
  otto: { label: "Otto", className: "from-red-600/90 to-red-800/90" },
  etsy: { label: "Etsy", className: "from-orange-500/80 to-rose-600/80" },
  generic: { label: "Global", className: "from-neon-cyan/80 to-neon-violet/80" },
};

export function sourceMeta(sourceType) {
  const key = String(sourceType || "generic").toLowerCase();
  return SOURCE_META[key] || SOURCE_META.generic;
}

function resolveLabel(sourcePlatform, sourceType) {
  if (sourcePlatform && String(sourcePlatform).trim()) {
    return String(sourcePlatform).trim();
  }
  return sourceMeta(sourceType).label;
}

/** Glassmorphism source pill — "From Amazon", "From Noon", … */
export default function SourceBadge({
  sourceType,
  sourcePlatform,
  originCountry,
  className = "",
}) {
  const label = resolveLabel(sourcePlatform, sourceType);
  const meta = sourceMeta(sourceType);

  return (
    <span
      className={`inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg backdrop-blur-xl ${className}`}
      title={`Sourced from ${label}${originCountry ? ` · ${originCountry}` : ""}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br ${meta.className}`}
        aria-hidden
      />
      <span className="truncate">
        From <span className="font-bold">{label}</span>
      </span>
      {originCountry ? (
        <span className="shrink-0 rounded bg-white/10 px-1 font-mono text-[8px] text-white/70">
          {originCountry}
        </span>
      ) : null}
    </span>
  );
}
