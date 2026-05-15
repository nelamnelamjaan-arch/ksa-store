import geoip from "geoip-lite";

const COUNTRY_DEFAULTS = {
  US: { locale: "en-US", currency: "USD" },
  GB: { locale: "en-GB", currency: "GBP" },
  PK: { locale: "ur-PK", currency: "PKR" },
  SA: { locale: "ar-SA", currency: "SAR" },
  AE: { locale: "ar-AE", currency: "AED" },
  DE: { locale: "de-DE", currency: "EUR" },
  FR: { locale: "fr-FR", currency: "EUR" },
  IT: { locale: "it-IT", currency: "EUR" },
  ES: { locale: "es-ES", currency: "EUR" },
  NL: { locale: "nl-NL", currency: "EUR" },
  PL: { locale: "pl-PL", currency: "EUR" },
  KW: { locale: "ar-KW", currency: "AED" },
  QA: { locale: "ar-QA", currency: "AED" },
  BH: { locale: "ar-BH", currency: "AED" },
  OM: { locale: "ar-OM", currency: "AED" },
};

const FALLBACK = { locale: "en-SA", currency: "SAR", country: "SA" };

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff && typeof xff === "string") {
    return xff.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "";
}

/**
 * Detect country from IP and set preferred locale + display currency.
 * Override with query ?currency=USD&locale=en-US or headers X-KSA-Currency / X-KSA-Locale.
 */
export function geoLocaleMiddleware(req, res, next) {
  const ip = clientIp(req);
  let country = FALLBACK.country;
  if (ip && ip !== "::1" && ip !== "127.0.0.1") {
    const geo = geoip.lookup(ip);
    if (geo?.country) country = geo.country;
  }

  const defaults = COUNTRY_DEFAULTS[country] || FALLBACK;
  const qCur = req.query?.currency;
  const qLoc = req.query?.locale;
  const hCur = req.headers["x-ksa-currency"];
  const hLoc = req.headers["x-ksa-locale"];
  const accept = req.headers["accept-language"];

  const currency =
    (typeof qCur === "string" && qCur) ||
    (typeof hCur === "string" && hCur) ||
    defaults.currency;
  const locale =
    (typeof qLoc === "string" && qLoc) ||
    (typeof hLoc === "string" && hLoc) ||
    (typeof accept === "string" && accept.split(",")[0]?.trim()) ||
    defaults.locale;

  req.clientIp = ip;
  req.detectedCountry = country;
  req.clientLocale = String(locale).slice(0, 16);
  req.clientCurrency = String(currency).toUpperCase().slice(0, 4);

  res.setHeader("X-KSA-Detected-Country", country);
  res.setHeader("X-KSA-Client-Currency", req.clientCurrency);
  res.setHeader("X-KSA-Client-Locale", req.clientLocale);

  next();
}
