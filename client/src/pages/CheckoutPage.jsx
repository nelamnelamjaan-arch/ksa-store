import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { PrescriptionUpload } from "../components/marketplace/PrescriptionUpload.jsx";
import FacilitatorNote from "../components/legal/FacilitatorNote.jsx";
import StripeGlassCheckoutForm from "../components/checkout/StripeGlassCheckoutForm.jsx";
import UniversalCheckoutGlass from "../components/checkout/UniversalCheckoutGlass.jsx";
import TrustBadges from "../components/trust/TrustBadges.jsx";

const emptyAddress = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "SA",
  phone: "",
};

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialShop = searchParams.get("shopId") || "";
  const initialProduct = searchParams.get("productId") || "";

  const [shopId, setShopId] = useState(initialShop);
  const [productId, setProductId] = useState(initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState(emptyAddress);
  const [prescriptionRows, setPrescriptionRows] = useState([]);
  const [facilitatorConsent, setFacilitatorConsent] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [redeemCoins, setRedeemCoins] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [intentPayload, setIntentPayload] = useState(null);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  async function placeOrderStripeHosted() {
    setMsg("");
    setIntentPayload(null);
    if (!token || !user) {
      setMsg("Please sign in with Google to complete checkout.");
      return;
    }
    if (!facilitatorConsent) {
      setMsg("Please confirm the facilitator acknowledgement before placing your order.");
      return;
    }
    if (!shopId.trim() || !productId.trim()) {
      setMsg("shopId and productId are required.");
      return;
    }

    const prescriptionUploads = prescriptionRows
      .filter((r) => typeof r.url === "string" && r.url.startsWith("https://"))
      .map((r) => ({ url: r.url.trim(), originalName: r.originalName || "" }));

    setBusy(true);
    try {
      localStorage.setItem(
        "ksa_quick_address_v1",
        JSON.stringify({
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2 || "",
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country,
          phone: address.phone || "",
        })
      );
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          shopId: shopId.trim(),
          items: [{ productId: productId.trim(), quantity }],
          deliveryAddress: address,
          prescriptionUploads,
          facilitatorConsent: true,
          ghostMode: ghostMode === true,
          redeemCoins: Math.max(0, Math.floor(Number(redeemCoins) || 0)),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || `Checkout failed (${res.status})`);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setMsg("No checkout URL returned.");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function prepareStripeElementsCheckout() {
    setMsg("");
    if (!token || !user) {
      setMsg("Please sign in with Google to complete checkout.");
      return;
    }
    if (!facilitatorConsent) {
      setMsg("Please confirm the facilitator acknowledgement before placing your order.");
      return;
    }
    if (!shopId.trim() || !productId.trim()) {
      setMsg("shopId and productId are required.");
      return;
    }

    const prescriptionUploads = prescriptionRows
      .filter((r) => typeof r.url === "string" && r.url.startsWith("https://"))
      .map((r) => ({ url: r.url.trim(), originalName: r.originalName || "" }));

    setBusy(true);
    try {
      localStorage.setItem(
        "ksa_quick_address_v1",
        JSON.stringify({
          fullName: address.fullName,
          line1: address.line1,
          line2: address.line2 || "",
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode || "",
          country: address.country,
          phone: address.phone || "",
        })
      );
      const res = await fetch("/api/checkout/stripe/payment-intent", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          shopId: shopId.trim(),
          items: [{ productId: productId.trim(), quantity }],
          deliveryAddress: address,
          prescriptionUploads,
          facilitatorConsent: true,
          ghostMode: ghostMode === true,
          redeemCoins: Math.max(0, Math.floor(Number(redeemCoins) || 0)),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || `Checkout failed (${res.status})`);
        return;
      }
      const pk = data.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!pk || !data.clientSecret) {
        setMsg("Stripe publishable key or client secret missing.");
        return;
      }
      setIntentPayload({
        clientSecret: data.clientSecret,
        publishableKey: pk,
        returnUrl: data.returnUrl || `/checkout/success?orderId=${data.orderId}`,
        display: data.display,
        stripeCharge: data.stripeCharge,
        totals: data.totals,
      });
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Checkout</h1>
      <p className="mt-2 text-sm text-white/55">
        Universal Checkout: PayPal, bank transfer (PK/KSA), or COD. Stripe card checkout is available below.
      </p>
      <TrustBadges className="mt-6" compact />

      <div className="mt-8 space-y-6">
        <FacilitatorNote className="mt-2" />

        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Order</h2>
          <label className="block text-xs text-white/50">
            Shop ID
            <input
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-white/50">
            Product ID
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-white/50">
            Quantity
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white">Delivery</h2>
          {Object.keys(address).map((key) => (
            <label key={key} className="block text-xs capitalize text-white/50">
              {key.replace(/([A-Z])/g, " $1")}
              <input
                value={address[key]}
                onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
          ))}
        </div>

        <PrescriptionUpload uploads={prescriptionRows} onUploadsChange={setPrescriptionRows} />

        <UniversalCheckoutGlass
          token={token}
          user={user}
          shopId={shopId}
          productId={productId}
          quantity={quantity}
          address={address}
          setAddress={setAddress}
          facilitatorConsent={facilitatorConsent}
          setFacilitatorConsent={setFacilitatorConsent}
        />

        <p className="text-center text-xs uppercase tracking-widest text-white/30">or pay with card</p>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <input
            type="checkbox"
            checked={ghostMode}
            onChange={(e) => setGhostMode(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-black/40 text-cyan-400"
          />
          <span className="text-sm leading-relaxed text-white/80">
            <span className="font-semibold text-white">Enable Ghost Mode</span> — after delivery, your
            vault address and prescription links are automatically anonymized in our database within 24
            hours.
          </span>
        </label>

        {token && user ? (
          <div className="glass-panel rounded-2xl p-5 space-y-3 border border-neon-cyan/20">
            <h2 className="text-sm font-semibold text-white">KSA Coins</h2>
            <p className="text-xs text-white/55">
              Balance: <span className="font-mono text-neon-cyan">{user.ksaCoins ?? 0}</span> coins ·
              Earn <span className="text-white/80">1%</span> of every paid order as coins. Redeem{" "}
              <span className="text-white/80">1 coin = 1 SAR</span> off this checkout (server caps at 50%
              of basket and your balance).
            </p>
            <label className="block text-xs text-white/50">
              Coins to redeem (optional)
              <input
                type="number"
                min={0}
                max={user.ksaCoins ?? 0}
                value={redeemCoins}
                onChange={(e) =>
                  setRedeemCoins(
                    Math.max(0, Math.min(user.ksaCoins ?? 0, Math.floor(Number(e.target.value) || 0)))
                  )
                }
                className="mt-1 w-full max-w-xs rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              />
            </label>
            <button
              type="button"
              className="text-xs text-neon-cyan/90 hover:underline"
              onClick={() => setRedeemCoins(user.ksaCoins ?? 0)}
            >
              Use maximum from balance
            </button>
          </div>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <input
            type="checkbox"
            checked={facilitatorConsent}
            onChange={(e) => setFacilitatorConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-black/40 text-cyan-400"
          />
          <span className="text-sm leading-relaxed text-white/80">
            I understand that KSA Store acts as a facilitator and my order will be fulfilled by a
            licensed partner store (e.g., Nahdi, Carrefour, etc.).
          </span>
        </label>

        {intentPayload?.display?.note ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-white/65">
            <span className="font-semibold text-white/90">Currency:</span> {intentPayload.display.note}
            <div className="mt-2 text-white/55">
              Charge:{" "}
              <span className="font-mono text-neon-cyan/90">
                {(intentPayload.stripeCharge?.amountMajorSAR ?? intentPayload.totals?.subtotalSAR ?? 0).toFixed(2)}{" "}
                {String(intentPayload.stripeCharge?.ledgerCurrency || "SAR").toUpperCase()}
              </span>
              {intentPayload.display?.formattedSubtotal ? (
                <>
                  {" "}
                  · Display:{" "}
                  <span className="font-mono text-white/80">{intentPayload.display.formattedSubtotal}</span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {intentPayload?.clientSecret ? (
          <StripeGlassCheckoutForm
            publishableKey={intentPayload.publishableKey}
            clientSecret={intentPayload.clientSecret}
            returnUrl={intentPayload.returnUrl}
            onCancel={() => setIntentPayload(null)}
          />
        ) : (
          <button
            type="button"
            disabled={busy || !facilitatorConsent}
            onClick={prepareStripeElementsCheckout}
            className="w-full rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3.5 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
          >
            {busy ? "Preparing payment…" : "Continue to card payment"}
          </button>
        )}

        {intentPayload ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setIntentPayload(null)}
            className="w-full text-center text-xs text-white/45 hover:text-white/70"
          >
            Cancel in-page payment (you can edit the form and start again)
          </button>
        ) : null}

        {!intentPayload ? (
          <button
            type="button"
            disabled={busy || !facilitatorConsent}
            onClick={placeOrderStripeHosted}
            className="w-full rounded-2xl border border-white/15 bg-white/[0.04] py-3 text-sm font-medium text-white/85 backdrop-blur-md hover:bg-white/[0.07] disabled:opacity-40"
          >
            Open Stripe-hosted checkout instead
          </button>
        ) : null}

        {msg ? (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/95">
            {msg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
