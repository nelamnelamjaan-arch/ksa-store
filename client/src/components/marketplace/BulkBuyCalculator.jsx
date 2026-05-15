import { useEffect, useState } from "react";

/** Heuristic packs per month by vertical (grocery vs pharmacy-style). */
function packsPerMonth(vertical, catalogKey) {
  const ck = String(catalogKey || "");
  if (vertical === "healthcare" || ck.includes("prescription") || ck.includes("supplement")) {
    return 2;
  }
  if (vertical === "essentials") return 30;
  return 12;
}

export default function BulkBuyCalculator({ category, unitPriceSAR, onPackQtyChange }) {
  const [months, setMonths] = useState(1);
  const vert = category?.marketplace_vertical || "";
  const ppm = packsPerMonth(vert, category?.catalog_key);
  const packs = Math.max(1, Math.ceil(months * ppm));
  const bulkDiscount = months >= 3 ? 0.05 : 0;
  const subtotal = packs * (Number(unitPriceSAR) || 0);
  const discounted = subtotal * (1 - bulkDiscount);

  useEffect(() => {
    onPackQtyChange?.(packs);
  }, [packs, onPackQtyChange]);

  if (!["healthcare", "essentials"].includes(vert)) return null;

  return (
    <section className="glass-panel rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold text-white">Bulk buy calculator</h2>
      <p className="mt-2 text-sm text-white/55">
        Slide to plan ahead — we estimate how many packs cover your household for groceries or
        long-run medicine cupboards.{" "}
        <span className="text-neon-cyan">3+ months earns an extra 5% off this line.</span>
      </p>
      <label className="mt-6 block text-xs font-medium uppercase tracking-wider text-white/45">
        Stock for · {months} month{months === 1 ? "" : "s"}
        <input
          type="range"
          min={1}
          max={6}
          step={1}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="mt-3 w-full accent-neon-cyan"
        />
      </label>
      <div className="mt-4 grid gap-2 text-sm text-white/80">
        <p>
          Estimated packs: <span className="font-semibold text-white">{packs}</span>
        </p>
        <p>
          List subtotal: <span className="text-white/50 line-through">{subtotal.toFixed(2)} SAR</span>
        </p>
        {bulkDiscount > 0 ? (
          <p>
            With 5% bulk rebate:{" "}
            <span className="text-lg font-semibold text-neon-cyan">{discounted.toFixed(2)} SAR</span>
          </p>
        ) : (
          <p className="text-white/50">Slide to 3+ months to unlock the 5% bulk rebate on this estimate.</p>
        )}
      </div>
    </section>
  );
}
