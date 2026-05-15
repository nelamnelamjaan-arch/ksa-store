import { convertSARTo } from "../utils/pricing/currencyConversion.js";

/**
 * Attaches helpers to convert canonical SAR amounts to the client display currency.
 * Run after `geoLocaleMiddleware`.
 */
export function currencyConversionMiddleware(req, _res, next) {
  const currency = req.clientCurrency || "SAR";

  req.money = {
    displayCurrency: currency,
    /** @param {number} amountSAR */
    convertFromSAR(amountSAR) {
      return convertSARTo(amountSAR, currency);
    },
    /** @param {number} amountSAR */
    format(amountSAR) {
      const v = convertSARTo(amountSAR, currency);
      return `${v.toFixed(2)} ${currency}`;
    },
  };

  next();
}
