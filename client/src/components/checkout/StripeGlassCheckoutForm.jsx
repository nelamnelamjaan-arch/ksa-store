import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#22d3ee",
    colorBackground: "rgba(15, 23, 42, 0.35)",
    colorText: "#f8fafc",
    colorDanger: "#fb7185",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    borderRadius: "14px",
    spacingUnit: "3px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255,255,255,0.12)",
      backgroundColor: "rgba(0,0,0,0.25)",
      boxShadow: "none",
    },
    ".Label": {
      color: "rgba(248,250,252,0.75)",
    },
  },
};

function PaymentForm({ returnUrl, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
      if (error) {
        setErr(error.message || "Payment could not be completed.");
        return;
      }
      if (paymentIntent?.status === "succeeded") {
        window.location.assign(returnUrl);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <PaymentElement />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !stripe}
          className="min-w-[140px] flex-1 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
        >
          {busy ? "Processing…" : "Pay now"}
        </button>
        {onCancel ? (
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/85 backdrop-blur-md hover:bg-white/[0.08] disabled:opacity-40"
          >
            Back
          </button>
        ) : null}
      </div>
      {err ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/95">{err}</p>
      ) : null}
    </form>
  );
}

/**
 * Stripe Elements checkout with a glass-style panel (Tailwind wrapper + Stripe Appearance API).
 *
 * @param {{ publishableKey: string; clientSecret: string; returnUrl: string; onCancel?: () => void }} props
 */
export default function StripeGlassCheckoutForm({ publishableKey, clientSecret, returnUrl, onCancel }) {
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  if (!publishableKey || !clientSecret || !stripePromise) {
    return (
      <p className="text-sm text-amber-100/90">
        Payment form is not ready — missing Stripe keys or client secret.
      </p>
    );
  }

  return (
    <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 shadow-[0_12px_48px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
      <h3 className="text-sm font-semibold tracking-wide text-white">Secure card payment</h3>
      <p className="mt-1 text-xs text-white/50">
        Powered by Stripe. Your card details never touch our servers.
      </p>
      <div className="mt-5">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
            loader: "auto",
          }}
        >
          <PaymentForm returnUrl={returnUrl} onCancel={onCancel} />
        </Elements>
      </div>
    </div>
  );
}
