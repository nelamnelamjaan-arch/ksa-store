import { useEffect, useState } from "react";
import { sourceMeta } from "./SourceBadge.jsx";

function formatSar(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })} SAR`;
}

/**
 * Cross-marketplace price table for the same normalized title fingerprint.
 */
export default function ProductPriceComparison({ productId, enabled = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!enabled || !productId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/scraper/compare/${encodeURIComponent(productId)}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(json.message || "Could not load comparison");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, enabled]);

  const rows = data?.alternates || [];
  const show =
    enabled &&
    (data?.priceComparisonAvailable || rows.length > 1 || (rows.length === 1 && data?.current));

  if (!enabled) return null;
  if (loading) {
    return (
      <section className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-white/45">Loading price comparison…</p>
      </section>
    );
  }
  if (err) return null;
  if (!show || rows.length < 1) return null;

  const currentPrice = data?.current?.ksaPrice;
  const cheapest = rows.reduce(
    (min, r) => (r.ksaPrice != null && r.ksaPrice < min ? r.ksaPrice : min),
    currentPrice ?? Infinity
  );

  return (
    <section className="glass-panel-strong rounded-3xl border border-white/[0.08] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neon-violet/90">
        Price comparison
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-white">
        Same product, different sources
      </h2>
      <p className="mt-2 text-sm text-white/50">
        We matched listings across global marketplaces by title. Prices include KSA Store margin
        and are stored in SAR.
      </p>

      <ul className="mt-6 space-y-3">
        {data.current ? (
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 px-4 py-3 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
                Your listing
              </span>
              <p className="mt-0.5 text-sm font-medium text-white">
                From {sourceMeta(data.current.sourceType).label}
                {data.current.origin_country ? ` · ${data.current.origin_country}` : ""}
              </p>
            </div>
            <span className="text-sm font-semibold text-white">{formatSar(data.current.ksaPrice)}</span>
          </li>
        ) : null}
        {rows.map((row, i) => {
          const meta = sourceMeta(row.sourceType || row.label);
          const label = row.source_platform || meta.label;
          const isBest = row.ksaPrice != null && row.ksaPrice === cheapest;
          return (
            <li
              key={`${row.sourceType}-${row.sourceUrl || i}`}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md ${
                isBest
                  ? "border-emerald-400/35 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-white">From {label}</p>
                {row.origin_country ? (
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    {row.origin_country}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatSar(row.ksaPrice)}</p>
                {isBest ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Best price
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
