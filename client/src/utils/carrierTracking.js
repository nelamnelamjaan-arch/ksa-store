/** Official carrier tracking portals — no third-party API */
export const CARRIERS = Object.freeze([
  {
    id: "aramex",
    label: "Aramex",
    urlTemplate: "https://www.aramex.com/track/results?mode=0&ShipmentNumber={ID}",
  },
  {
    id: "dhl",
    label: "DHL",
    urlTemplate: "https://www.dhl.com/en/express/tracking.html?AWB={ID}",
  },
  {
    id: "fedex",
    label: "FedEx",
    urlTemplate: "https://www.fedex.com/fedextrack/?trknbr={ID}",
  },
  {
    id: "spl",
    label: "Saudi Post (SPL)",
    urlTemplate: "https://splonline.com.sa/en/track/?trackingnumber={ID}",
  },
]);

/**
 * @param {string} carrierId
 * @param {string} trackingId
 * @returns {string | null}
 */
export function buildCarrierTrackingUrl(carrierId, trackingId) {
  const id = String(trackingId || "").trim();
  if (!id) return null;

  const carrier = CARRIERS.find((c) => c.id === carrierId);
  if (!carrier) return null;

  return carrier.urlTemplate.replace("{ID}", encodeURIComponent(id));
}

/**
 * Premium hand-off: brief delay, then open the carrier site in a new tab.
 * @param {string} carrierId
 * @param {string} trackingId
 * @param {{ delayMs?: number }} [opts]
 */
export async function openCarrierTracking(carrierId, trackingId, opts = {}) {
  const url = buildCarrierTrackingUrl(carrierId, trackingId);
  if (!url) {
    throw new Error("Enter a valid tracking ID and select a carrier.");
  }

  const delayMs = opts.delayMs ?? 1000;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  window.open(url, "_blank", "noopener,noreferrer");
}
