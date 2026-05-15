const STAGES = [
  { key: "placed", label: "Order placed" },
  { key: "sourcing", label: "Sourcing from partner" },
  { key: "qc", label: "Quality check" },
  { key: "delivery", label: "Out for delivery" },
];

/**
 * @param {{ step?: number; status?: string }} props
 * step 0–3 = progress through the four milestones; 4 = delivered / complete.
 */
export default function OrderVipTrackingBar({ step = 0, status }) {
  if (status === "cancelled") {
    return <p className="mt-2 text-xs text-rose-300/90">Order cancelled</p>;
  }

  const s = typeof step === "number" && step >= 0 ? Math.min(step, 4) : 0;
  const pct = Math.min(100, (s / 4) * 100);

  return (
    <div className="mt-4">
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-fuchsia shadow-[0_0_20px_rgba(0,229,255,0.45)] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-3 text-[11px] font-medium uppercase tracking-wide text-white/40 sm:grid-cols-4">
        {STAGES.map((st, i) => {
          const completed = i < s || s === 4;
          const current = s === i && s < 4;
          return (
            <li
              key={st.key}
              className={`rounded-lg border px-2 py-2 text-center ${
                current
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                  : completed
                    ? "border-white/15 text-white/80"
                    : "border-transparent text-white/35"
              }`}
            >
              {st.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
