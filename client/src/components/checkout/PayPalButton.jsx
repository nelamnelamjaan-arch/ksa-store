import { useEffect, useState } from "react";
import { loadPayPalV6Sdk, getPayPalClientId } from "../../utils/loadPayPalV6.js";
import { apiUrl } from "../../utils/apiUrl.js";

const PAYPAL_BTN_ID = "ksa-paypal-button";
const CARD_BTN_ID = "ksa-paypal-basic-card-button";

/**
 * PayPal Checkout — JavaScript SDK v6
 * Gold · rectangle · vertical · PayPal + debit/credit card.
 */
export default function PayPalButton({
  amount = 100,
  currency = "USD",
  onSuccess,
  onError,
}) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [captureId, setCaptureId] = useState("");

  useEffect(() => {
    let cancelled = false;
    const cleanups = [];

    async function init() {
      const clientId = getPayPalClientId();
      if (!clientId) {
        setStatus("error");
        setMessage("Set VITE_PAYPAL_CLIENT_ID in client/.env");
        return;
      }

      try {
        await loadPayPalV6Sdk();
        if (cancelled) return;

        if (typeof window.isBrowserSupportedByPayPal === "function") {
          if (!window.isBrowserSupportedByPayPal()) {
            setStatus("error");
            setMessage("Your browser is not supported by PayPal SDK v6.");
            return;
          }
        }

        const sdkInstance = await window.paypal.createInstance({
          clientId,
          components: ["paypal-payments", "paypal-guest-payments"],
          pageType: "checkout",
          locale: "en-US",
        });

        const eligible = await sdkInstance.findEligibleMethods({
          currencyCode: currency,
          amount: String(Number(amount).toFixed(2)),
        });

        const createOrder = async () => {
          const res = await fetch(apiUrl("/api/orders"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Number(amount), currency }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Failed to create PayPal order");
          return { orderId: data.id };
        };

        const captureOrder = async (orderId) => {
          const res = await fetch(
            apiUrl(`/api/orders/${encodeURIComponent(orderId)}/capture`),
            { method: "POST", headers: { "Content-Type": "application/json" } }
          );
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.message || "Capture failed");
          return data;
        };

        const sessionOptions = {
          async onApprove(data) {
            try {
              const captured = await captureOrder(data.orderId);
              if (cancelled) return;
              setCaptureId(captured.captureId || "");
              setMessage("Payment captured successfully.");
              setStatus("success");
              onSuccess?.({ ...data, ...captured });
            } catch (err) {
              if (cancelled) return;
              setStatus("error");
              setMessage(err.message || "Capture failed");
              onError?.(err);
            }
          },
          onCancel() {
            if (!cancelled) {
              setMessage("Payment cancelled.");
              setStatus("idle");
            }
          },
          onError(err) {
            if (cancelled) return;
            const msg = err?.message || "PayPal payment error";
            setMessage(msg);
            setStatus("error");
            onError?.(err instanceof Error ? err : new Error(msg));
          },
        };

        const bindClick = (el, session) => {
          if (!el || !session) return;
          el.removeAttribute("hidden");
          const handler = async () => {
            setStatus("processing");
            setMessage("");
            try {
              await session.start({ presentationMode: "auto" }, createOrder());
            } catch (err) {
              setStatus("error");
              setMessage(err.message || "Checkout failed");
              onError?.(err);
            }
          };
          el.addEventListener("click", handler);
          cleanups.push(() => el.removeEventListener("click", handler));
        };

        if (eligible.isEligible("paypal")) {
          const paypalSession = sdkInstance.createPayPalOneTimePaymentSession(sessionOptions);
          bindClick(document.getElementById(PAYPAL_BTN_ID), paypalSession);
        }

        if (eligible.isEligible("paypal")) {
          const guestSession = sdkInstance.createPayPalGuestOneTimePaymentSession(sessionOptions);
          bindClick(document.getElementById(CARD_BTN_ID), guestSession);
        }

        if (!cancelled) setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err.message || "PayPal SDK failed to load");
          onError?.(err);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [amount, currency, onSuccess, onError]);

  return (
    <div className="paypal-v6-checkout w-full max-w-md">
      <style>{`
        .paypal-v6-checkout .paypal-v6-stack {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        .paypal-v6-checkout paypal-button,
        .paypal-v6-checkout paypal-basic-card-container {
          width: 100%;
        }
        .paypal-v6-checkout paypal-button,
        .paypal-v6-checkout paypal-basic-card-button {
          --paypal-button-border-radius: 4px;
        }
      `}</style>

      <p className="mb-3 text-center text-xs text-white/50">
        PayPal · {Number(amount).toFixed(2)} {currency} · vertical · gold
      </p>

      <div className="paypal-v6-stack">
        <paypal-button id={PAYPAL_BTN_ID} type="pay" className="paypal-gold" hidden />
        <paypal-basic-card-container hidden>
          <paypal-basic-card-button id={CARD_BTN_ID} />
        </paypal-basic-card-container>
      </div>

      {status === "loading" ? (
        <p className="mt-4 text-center text-sm text-white/45">Loading PayPal SDK v6…</p>
      ) : null}
      {status === "processing" ? (
        <p className="mt-4 text-center text-sm text-neon-cyan">Processing payment…</p>
      ) : null}
      {message ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm backdrop-blur-md ${
            status === "error"
              ? "border-rose-500/30 bg-rose-500/10 text-rose-100/90"
              : status === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100/90"
                : "border-white/10 bg-white/5 text-white/60"
          }`}
          role="status"
        >
          {message}
          {captureId ? (
            <span className="mt-2 block font-mono text-[11px] text-white/50">
              Capture ID: {captureId}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
