import { Link, useLocation } from "react-router-dom";

const CATEGORIES = [
  { label: "Jewellery", catalog_key: "jewellery", accent: "gold" },
  { label: "Shoes", catalog_key: "shoes", accent: "violet" },
  { label: "Makeup", catalog_key: "makeup", accent: "rose" },
  { label: "Men", catalog_key: "dresses_male", accent: "blue" },
  { label: "Women", catalog_key: "dresses_female", accent: "purple" },
  { label: "Kids", catalog_key: "dresses_kids", accent: "cyan" },
  { label: "Gourmet Food", to: "/gourmet", accent: "emerald" },
];

const accentClass = {
  gold: "border-amber-400/40 text-amber-200 hover:bg-amber-500/10 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]",
  rose: "border-pink-400/35 text-pink-200 hover:bg-pink-500/10 hover:shadow-[0_0_20px_rgba(244,114,182,0.2)]",
  emerald: "border-emerald-400/35 text-emerald-200 hover:bg-emerald-500/10 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]",
  violet: "border-violet-400/35 text-violet-200 hover:bg-violet-500/10",
  blue: "border-sky-400/35 text-sky-200 hover:bg-sky-500/10",
  purple: "border-purple-400/35 text-purple-200 hover:bg-purple-500/10",
  cyan: "border-cyan-400/35 text-cyan-200 hover:bg-cyan-500/10",
};

export default function CategoryNavBar() {
  const { pathname, search } = useLocation();
  const qs = new URLSearchParams(search);

  return (
    <nav
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      aria-label="Shop by category"
    >
      {CATEGORIES.map((c) => {
        const to = c.to || `/browse?catalog_key=${encodeURIComponent(c.catalog_key)}`;
        const active =
          c.to
            ? pathname === c.to
            : qs.get("catalog_key") === c.catalog_key;
        return (
          <Link
            key={c.label}
            to={to}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition ${
              accentClass[c.accent] || accentClass.gold
            } ${active ? "ring-1 ring-white/30 bg-white/10" : "bg-white/[0.03]"}`}
          >
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}
