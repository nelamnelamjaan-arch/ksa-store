import { useState, useRef, useEffect } from "react";
import { useStorefront } from "../../context/StorefrontContext.jsx";

/** Quick region picker — syncs with traveler storefront override */
export default function CountrySwitcher() {
  const { regions, country, setStorefrontOverride } = useStorefront();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const list =
    regions.length > 0
      ? regions
      : [
          { code: "SA", label: "Saudi Arabia", flag: "🇸🇦", defaultCity: "Riyadh", currency: "SAR" },
          { code: "US", label: "United States", flag: "🇺🇸", defaultCity: "New York", currency: "USD" },
          { code: "TR", label: "Turkey", flag: "🇹🇷", defaultCity: "Istanbul", currency: "TRY" },
        ];

  const selected = list.find((c) => c.code === country) || list[0];

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm font-medium text-white/90 shadow-glass backdrop-blur-md transition hover:border-neon-cyan/30 hover:bg-white/[0.08]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select storefront region"
      >
        <span className="text-lg leading-none" aria-hidden>
          {selected.flag}
        </span>
        <span className="hidden max-w-[4.5rem] truncate sm:inline">{selected.code}</span>
        <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 z-[60] mt-2 min-w-[220px] overflow-hidden rounded-xl border border-white/[0.1] bg-charcoal-900/90 py-1 shadow-glass-lg backdrop-blur-2xl"
          role="listbox"
        >
          {list.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                role="option"
                aria-selected={selected.code === c.code}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/85 transition hover:bg-white/[0.06] hover:text-white"
                onClick={() => {
                  setStorefrontOverride({
                    country: c.code,
                    city: c.defaultCity,
                    currency: c.currency,
                  });
                  setOpen(false);
                }}
              >
                <span className="text-lg">{c.flag}</span>
                <span>{c.countryName || c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
