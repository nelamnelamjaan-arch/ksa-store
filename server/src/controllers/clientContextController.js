/**
 * Geo + locale hints from `geoLocaleMiddleware` (IP-based unless overridden by headers/query).
 */
export function getClientContext(req, res) {
  res.json({
    country: req.detectedCountry || "SA",
    currency: req.clientCurrency || "SAR",
    locale: req.clientLocale || "en-SA",
  });
}
