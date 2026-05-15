import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  SUPPORTED_LOCALES,
} from "../i18n/config.js";
import { geoFetch, readStorefrontOverride, writeStorefrontOverride } from "../utils/geoFetch.js";

const StorefrontContext = createContext(null);

const DEFAULT_HERO = {
  badge: "KSA Store · Private access",
  title: "World's Luxury",
  titleAccent: "at Your Doorstep",
  subtitle:
    "A calmer, more considered marketplace — curated vendors, invisible logistics, and checkout worthy of the Gulf's most discerning clients.",
};

export function StorefrontProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("SA");
  const [countryName, setCountryName] = useState("Saudi Arabia");
  const [city, setCity] = useState("Riyadh");
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [locale, setLocale] = useState("en");
  const [flag, setFlag] = useState("🇸🇦");
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [overridden, setOverridden] = useState(false);
  const [detected, setDetected] = useState(null);
  const [fxRates, setFxRates] = useState(null);
  const [regions, setRegions] = useState([]);
  const [dailyEssentialsVendors, setDailyEssentialsVendors] = useState([]);

  const applyPayload = useCallback((d) => {
    const cur = String(d.currency || "").toUpperCase();
    if (SUPPORTED_CURRENCIES.includes(cur)) setCurrency(cur);
    const loc = String(d.locale || "").split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(loc)) {
      setLocale(loc);
      if (typeof document !== "undefined") document.documentElement.lang = loc;
    }
    setCountry(d.country || "SA");
    setCountryName(d.countryName || "Saudi Arabia");
    setCity(d.city || "");
    setFlag(d.flag || "🌍");
    setHero(d.hero || DEFAULT_HERO);
    setOverridden(Boolean(d.overridden));
    setDetected(d.detected || null);
    setFxRates(d.fxRates || null);
    setDailyEssentialsVendors(Array.isArray(d.dailyEssentialsVendors) ? d.dailyEssentialsVendors : []);
  }, []);

  const refreshContext = useCallback(async () => {
    setLoading(true);
    try {
      const res = await geoFetch("/api/client-context");
      const d = await res.json().catch(() => ({}));
      applyPayload(d);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, [applyPayload]);

  useEffect(() => {
    refreshContext();
    geoFetch("/api/client-context/regions")
      .then((r) => (r.ok ? r.json() : { regions: [] }))
      .then((d) => setRegions(Array.isArray(d.regions) ? d.regions : []))
      .catch(() => {});
  }, [refreshContext]);

  const setStorefrontOverride = useCallback(
    async ({ country: c, city: ct, currency: cur }) => {
      writeStorefrontOverride({ country: c, city: ct, currency: cur });
      try {
        const res = await geoFetch("/api/client-context/override", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: c, city: ct, currency: cur }),
        });
        const d = await res.json().catch(() => ({}));
        if (res.ok) applyPayload(d);
        else await refreshContext();
      } catch {
        await refreshContext();
      }
    },
    [applyPayload, refreshContext]
  );

  const clearStorefrontOverride = useCallback(async () => {
    writeStorefrontOverride(null);
    await refreshContext();
  }, [refreshContext]);

  const format = useCallback(
    (amountSar) => {
      const amount = Number(amountSar);
      if (!Number.isFinite(amount)) return "";
      const cur = currency || "SAR";
      if (cur === "SAR") return `${amount.toFixed(2)} SAR`;
      const rate = fxRates?.[cur];
      if (rate != null && rate > 0) {
        return `${(amount / rate).toFixed(2)} ${cur}`;
      }
      return `${amount.toFixed(2)} SAR`;
    },
    [currency, fxRates]
  );

  const locationLabel = useMemo(() => {
    const name = countryName || country;
    if (city && city !== name) return `${city}, ${name}`;
    return name;
  }, [country, countryName, city]);

  const value = useMemo(
    () => ({
      loading,
      country,
      countryName,
      city,
      currency,
      setCurrency,
      locale,
      setLocale,
      flag,
      hero,
      overridden,
      detected,
      locationLabel,
      dailyEssentialsVendors,
      regions,
      format,
      refreshContext,
      setStorefrontOverride,
      clearStorefrontOverride,
      supportedCurrencies: SUPPORTED_CURRENCIES,
    }),
    [
      loading,
      country,
      countryName,
      city,
      currency,
      locale,
      flag,
      hero,
      overridden,
      detected,
      locationLabel,
      dailyEssentialsVendors,
      regions,
      format,
      refreshContext,
      setStorefrontOverride,
      clearStorefrontOverride,
    ]
  );

  return (
    <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx) throw new Error("useStorefront must be used within StorefrontProvider");
  return ctx;
}

/** Back-compat alias for existing useCurrency() calls */
export function useCurrency() {
  return useStorefront();
}

export function CurrencyProvider({ children }) {
  return <StorefrontProvider>{children}</StorefrontProvider>;
}
