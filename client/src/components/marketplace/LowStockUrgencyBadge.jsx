import { useEffect, useState } from "react";

function formatCountdown(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Neon urgency when partner scraped quantity is under 10.
 */
export default function LowStockUrgencyBadge({ qty }) {
  const n = Number(qty);
  if (!Number.isFinite(n) || n >= 10) return null;

  const [sec, setSec] = useState(119);

  useEffect(() => {
    const id = setInterval(() => {
      setSec((t) => (t <= 0 ? 119 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="ksa-low-stock-neon mt-4 inline-flex flex-col gap-1 rounded-2xl border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-3 text-sm text-white shadow-[0_0_24px_rgba(0,229,255,0.35)]"
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-neon-cyan">
          Low stock
        </span>
        <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-[11px] text-white/90">
          Partner qty ≈ {n}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-white/60">
        High demand window · illustrative hold timer{" "}
        <span className="font-mono text-neon-cyan">{formatCountdown(sec)}</span>
      </p>
    </div>
  );
}
