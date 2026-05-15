import { useEffect, useMemo, useState } from "react";

const LIFE_STAGES = [
  { id: "infants", label: "Infants" },
  { id: "kids", label: "Kids" },
  { id: "adults", label: "Adults" },
  { id: "seniors", label: "Seniors" },
  { id: "all", label: "All ages" },
];

function formatRemaining(ms) {
  if (ms <= 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 48) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

/**
 * Universal Needs sidebar: life-stage filter + optional perishable freshness countdown.
 *
 * @param {object} props
 * @param {string} [props.selectedLifeStage]
 * @param {(id: string) => void} [props.onLifeStageChange]
 * @param {string | null} [props.freshnessExpiresAt] ISO expiry for perishable SKU
 * @param {"default"|"grocery"|"pharmacy"} [props.accent]
 * @param {() => void} [props.onSubscribeMonthly]
 */
export function ShopByLifeStageSidebar({
  selectedLifeStage = "adults",
  onLifeStageChange,
  freshnessExpiresAt = null,
  accent = "default",
  onSubscribeMonthly,
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!freshnessExpiresAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [freshnessExpiresAt]);

  const expiryMs = useMemo(() => {
    if (!freshnessExpiresAt) return null;
    const t = new Date(freshnessExpiresAt).getTime();
    return Number.isNaN(t) ? null : t - now;
  }, [freshnessExpiresAt, now]);

  const ring =
    accent === "pharmacy"
      ? "from-emerald-400/40 to-emerald-600/10"
      : accent === "grocery"
        ? "from-teal-300/45 to-cyan-600/10"
        : "from-neon-cyan/35 to-neon-purple/15";

  return (
    <aside className="glass-panel-strong rounded-3xl p-5 space-y-6 w-full max-w-xs">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Daily needs
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Shop by life stage</h2>
        <p className="mt-1 text-xs text-white/55 leading-relaxed">
          Tune recommendations for milk, diapers, paediatric care, or senior wellness.
        </p>
      </div>

      <nav className="space-y-1" aria-label="Life stage filter">
        {LIFE_STAGES.map((s) => {
          const active = selectedLifeStage === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onLifeStageChange?.(s.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-white/25 bg-white/[0.12] text-white shadow-[0_0_24px_rgba(0,229,255,0.12)]"
                  : "border-transparent bg-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <span>{s.label}</span>
              {active ? (
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {freshnessExpiresAt && expiryMs != null ? (
        <div
          className={`rounded-2xl border border-white/10 bg-gradient-to-br p-4 ${ring}`}
          role="status"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
            Freshness timer
          </p>
          <p className="mt-2 text-2xl font-light tabular-nums text-white">
            {formatRemaining(expiryMs)}
          </p>
          <p className="mt-1 text-[11px] text-white/55">
            Best consumed before{" "}
            <time dateTime={freshnessExpiresAt}>
              {new Date(freshnessExpiresAt).toLocaleString()}
            </time>
          </p>
        </div>
      ) : null}

      {onSubscribeMonthly ? (
        <button
          type="button"
          onClick={onSubscribeMonthly}
          className="w-full rounded-2xl border border-white/15 bg-white/[0.07] py-2.5 text-sm font-medium text-white/90 shadow-glass backdrop-blur-xl hover:bg-white/[0.11]"
        >
          Monthly subscription
        </button>
      ) : null}
    </aside>
  );
}
