const LIVE_SDK = "https://www.paypal.com/web-sdk/v6/core";
const SANDBOX_SDK = "https://www.sandbox.paypal.com/web-sdk/v6/core";

/**
 * Load PayPal JavaScript SDK v6 (core).
 * @param {{ mode?: 'live' | 'sandbox' }} [opts]
 */
export function loadPayPalV6Sdk(opts = {}) {
  const mode =
    opts.mode ||
    import.meta.env.VITE_PAYPAL_MODE ||
    (import.meta.env.PROD ? "live" : "sandbox");
  const src = mode === "live" ? LIVE_SDK : SANDBOX_SDK;

  return new Promise((resolve, reject) => {
    if (window.paypal?.createInstance) {
      resolve(window.paypal);
      return;
    }

    const existing = document.querySelector('script[data-paypal-v6="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.paypalV6 = "true";
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK v6"));
    document.head.appendChild(script);
  });
}

export function getPayPalClientId() {
  return import.meta.env.VITE_PAYPAL_CLIENT_ID || "";
}
