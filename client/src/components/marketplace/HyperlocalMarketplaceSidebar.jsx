import { NavLink } from "react-router-dom";

const aisles = [
  { label: "Daily Essentials", to: "/browse?catalog_key=daily_essentials", hint: "Pantry & household core" },
  { label: "Fresh Produce", to: "/browse?catalog_key=fresh_produce", hint: "Fruit & veg" },
  { label: "Pharmacy", to: "/browse?vertical=healthcare", hint: "Licensed partner catalogue" },
];

/**
 * Hyper-local dropship navigation (Carrefour / Nahdi / Panda style SKUs).
 */
export default function HyperlocalMarketplaceSidebar({ className = "" }) {
  return (
    <aside
      className={`glass-panel-strong rounded-3xl p-5 space-y-4 ${className}`}
      aria-label="Hyper-local marketplace"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-200/80">
          Hyper-local
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Daily aisles</h2>
        <p className="mt-1 text-xs text-white/50 leading-relaxed">
          Scraped partner pricing with live margin rules — no owned stock.
        </p>
      </div>
      <nav className="space-y-1">
        {aisles.map((a) => (
          <NavLink
            key={a.to}
            to={a.to}
            className={({ isActive }) =>
              `block rounded-xl border px-3 py-2.5 text-left transition ${
                isActive
                  ? "border-teal-400/35 bg-teal-500/10 text-white"
                  : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.04]"
              }`
            }
          >
            <span className="text-sm font-medium">{a.label}</span>
            <span className="mt-0.5 block text-[11px] text-white/40">{a.hint}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
