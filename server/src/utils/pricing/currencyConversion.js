import { MOCK_FX_TO_SAR, convertToSAR } from "./calculateKSAStorePrice.js";

export { convertToSAR };

/**
 * Convert SAR amount to target currency using mock inverse rates.
 * @param {number} amountSAR
 * @param {string} targetCurrency
 */
export function convertSARTo(amountSAR, targetCurrency) {
  const cur = String(targetCurrency || "SAR").toUpperCase();
  if (cur === "SAR") return Math.round(amountSAR * 100) / 100;
  const rateToSar = MOCK_FX_TO_SAR[cur] ?? MOCK_FX_TO_SAR.USD;
  const inTarget = amountSAR / rateToSar;
  return Math.round(inTarget * 100) / 100;
}
