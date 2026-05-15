import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../context/AuthContext.jsx";

const LS_KEY = "ksa_quick_address_v1";

export default function QuickBuyWallet({ shopId, productId, quantity = 1 }) {
  const { token } = useAuth();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const run = useCallback(async () => {
    setMsg("");
    if (!token) {
      setMsg("Sign in to use 1-tap wallet checkout.");
      return;
    }
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      setMsg(
        "Save a delivery address once on the Checkout page (we store it locally for express pay)."
      );
      return;
    }
    let deliveryAddress;
    try {
      deliveryAddress = JSON.parse(raw);
    } catch {
      setMsg("Saved address is invalid — re-save from Checkout.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/checkout/stripe/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId,
          items: [{ productId, quantity }],
          deliveryAddress,
          facilitatorConsent: true,
          ghostMode: false,
          redeemCoins: 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || `Checkout failed (${res.status})`);
        return;
      }
      const publishableKey = data.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey || !data.clientSecret) {
        setMsg("Stripe publishable key or client secret missing.");
        return;
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        setMsg("Could not load Stripe.js");
        return;
      }

      const amount = Math.round(Number(data.totals?.subtotalSAR || 0) * 100);
      if (!Number.isFinite(amount) || amount <= 0) {
        setMsg("Invalid order amount.");
        return;
      }

      const pr = stripe.paymentRequest({
        country: "SA",
        currency: "sar",
        total: { label: `KSA Store ${data.ksaSerialGlobal || ""}`, amount },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      const can = await pr.canMakePayment();
      if (!can) {
        setMsg("Apple Pay / Google Pay not available in this browser — use standard checkout.");
        return;
      }

      pr.on("paymentmethod", async (ev) => {
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          data.clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: true }
        );
        if (error) {
          ev.complete("fail");
          setMsg(error.message || "Payment failed");
          return;
        }
        ev.complete("success");
        if (paymentIntent?.status === "succeeded") {
          window.location.href = data.returnUrl || "/checkout/success";
        }
      });

      await pr.show();
    } catch (e) {
      setMsg(e?.message || "Network error");
    } finally {
      setBusy(false);
    }
  }, [productId, quantity, shopId, token]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-semibold text-white">1-Click · Apple / Google Pay</p>
      <p className="mt-1 text-xs text-white/50">
        Uses your last saved address (Checkout page) and Stripe PaymentIntents — no cart hop.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-2.5 text-xs font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
      >
        {busy ? "Preparing…" : "Pay with Wallet"}
      </button>
      {msg ? <p className="mt-2 text-xs text-amber-100/90">{msg}</p> : null}
    </div>
  );
}
