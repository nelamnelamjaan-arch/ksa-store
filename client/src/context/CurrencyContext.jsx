import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "../i18n/config.js";

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/client-context");
        const d = await res.json().catch(() => ({}));
        if (cancelled) return;
        const cur = String(d.currency || "").toUpperCase();
        if (SUPPORTED_CURRENCIES.includes(cur)) setCurrency(cur);
        const loc = String(d.locale || "").split("-")[0].toLowerCase();
        if (SUPPORTED_LOCALES.includes(loc)) {
          setLocale(loc);
          if (typeof document !== "undefined") {
            document.documentElement.lang = loc;
          }
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      locale,
      setLocale,
      supported: SUPPORTED_CURRENCIES,
    }),
    [currency, locale]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
