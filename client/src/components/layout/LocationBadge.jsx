import { useState, useRef, useEffect } from "react";
import { useStorefront } from "../../context/StorefrontContext.jsx";

export default function LocationBadge() {
  const {
    loading,
    locationLabel,
    country,
    city,
    currency,
    overridden,
    detected,
    regions,
    setStorefrontOverride,
    clearStorefrontOverride,
    refreshContext,
  } = useStorefront();

  const [open, setOpen] = useState(false);
  const [pickCountry, setPickCountry] = useState(country);
  const [pickCity, setPickCity] = useState(city);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setPickCountry(country);
    setPickCity(city);
  }, [country, city]);

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function applyOverride() {
    setSaving(true);
    try {
      const region = regions.find((r) => r.code === pickCountry);
      await setStorefrontOverride({
        country: pickCountry,
        city: pickCity || region?.defaultCity,
        currency: region?.currency || currency,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function useDetected() {
    setSaving(true);
    try {
      await clearStorefrontOverride();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <span className="hidden h-9 w-28 animate-pulse rounded-full bg-white/5 sm:inline-block" />
    );
  }

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[240px] items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-1.5 text-left text-xs text-white/85 shadow-glass backdrop-blur-md transition hover:border-neon-cyan/35 hover:bg-white/[0.08]"
        aria-expanded={open}
        aria-label="Detected location and storefront override"
      >
        <span className="text-base leading-none" aria-hidden>
          📍
        </span>
        <span className="truncate">
          Currently in <span className="font-semibold text-neon-cyan/90">{locationLabel}</span>
        </span>
        {overridden ? (
          <span className="shrink-0 rounded bg-neon-violet/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-neon-violet">
            Manual
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[70] mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-white/[0.1] bg-charcoal-900/95 p-4 shadow-glass-lg backdrop-blur-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Traveler storefront
          </p>
          <p className="mt-2 text-sm text-white/70">
            Your account, wallet, and order history stay the same. Only prices, hero deals, and Daily
            Essentials sources change with location.
          </p>
          {detected ? (
            <p className="mt-2 text-xs text-white/45">
              IP detected: {detected.city ? `${detected.city}, ` : ""}
              {detected.countryName || detected.country}
            </p>
          ) : null}

          <label className="mt-4 block text-xs text-white/45">
            Ordering for someone else?
            <select
              value={pickCountry}
              onChange={(e) => {
                setPickCountry(e.target.value);
                const r = regions.find((x) => x.code === e.target.value);
                if (r?.defaultCity) setPickCity(r.defaultCity);
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            >
              {(regions.length ? regions : [{ code: country, countryName: locationLabel }]).map(
                (r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag ? `${r.flag} ` : ""}
                    {r.countryName} {r.currency ? `(${r.currency})` : ""}
                  </option>
                )
              )}
            </select>
          </label>
          <label className="mt-3 block text-xs text-white/45">
            City (optional)
            <input
              type="text"
              value={pickCity}
              onChange={(e) => setPickCity(e.target.value)}
              placeholder="Istanbul"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={applyOverride}
              className="rounded-xl bg-gradient-to-r from-neon-cyan/90 to-neon-violet/80 py-2.5 text-xs font-semibold uppercase tracking-wider text-charcoal-950 disabled:opacity-50"
            >
              {saving ? "Updating…" : "Use this location"}
            </button>
            {overridden ? (
              <button
                type="button"
                disabled={saving}
                onClick={useDetected}
                className="rounded-xl border border-white/10 py-2 text-xs text-white/70 hover:bg-white/5"
              >
                Reset to detected GPS / IP
              </button>
            ) : (
              <button
                type="button"
                onClick={() => refreshContext()}
                className="rounded-xl border border-white/10 py-2 text-xs text-white/50 hover:bg-white/5"
              >
                Refresh location
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
