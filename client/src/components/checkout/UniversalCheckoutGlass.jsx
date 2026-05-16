import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext.jsx";
import FacilitatorNote from "../legal/FacilitatorNote.jsx";
import TrustBadges from "../trust/TrustBadges.jsx";
import { apiUrl } from "../../utils/apiUrl.js";

const STAGES = [
  { key: "fetch", label: "Fetching Data…" },
  { key: "ai", label: "AI Styling…" },
  { key: "profit", label: "Calculating Profit…" },
  { key: "success", label: "Success!" },
];

function loadPayPalScript(clientId, currency) {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }
    const existing = document.querySelector('script[data-paypal-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", reject);
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    s.async = true;
    s.dataset.paypalSdk = "true";
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

/**
 * Universal Checkout — PayPal, bank transfer + receipt, COD.
 */
export default function UniversalCheckoutGlass({
  token,
  user,
  shopId,
  productId,
  quantity = 1,
  address,
  setAddress,
  facilitatorConsent,
  setFacilitatorConsent,
}) {
  const { currency: geoCurrency } = useCurrency();
  const [config, setConfig] = useState(null);
  const [method, setMethod] = useState("paypal");
  const [stageIndex, setStageIndex] = useState(-1);
  const [err, setErr] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [ksaSerial, setKsaSerial] = useState("");
  const [totals, setTotals] = useState(null);
  const [bankRef, setBankRef] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const paypalRef = useRef(null);
  const [paypalReady, setPaypalReady] = useState(false);

  const authHeaders = useCallback(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    fetch(apiUrl("/api/checkout/config"))
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);

  function runStageAnimation() {
    setStageIndex(0);
    const timers = [
      setTimeout(() => setStageIndex(1), 1200),
      setTimeout(() => setStageIndex(2), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }

  async function createOrder(paymentMethod) {
    const res = await fetch(apiUrl("/api/checkout/universal"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        shopId: shopId.trim(),
        items: [{ productId: productId.trim(), quantity }],
        deliveryAddress: address,
        paymentMethod,
        facilitatorConsent: true,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || `Checkout failed (${res.status})`);
    setOrderId(json.orderId);
    setKsaSerial(json.ksaSerialGlobal);
    setTotals(json.totals);
    return json;
  }

  async function submitCheckout() {
    setErr("");
    if (!token || !user) {
      setErr("Please sign in to checkout.");
      return;
    }
    if (!facilitatorConsent) {
      setErr("Please confirm the facilitator acknowledgement.");
      return;
    }
    if (!shopId?.trim() || !productId?.trim()) {
      setErr("Shop and product are required.");
      return;
    }

    const clearStages = runStageAnimation();

    try {
      if (method === "paypal") {
        const json = await createOrder("paypal");
        setStageIndex(2);
        const clientId = config?.paypalClientId || import.meta.env.VITE_PAYPAL_CLIENT_ID;
        if (!clientId) {
          setErr("PayPal Client ID not configured.");
          setStageIndex(-1);
          return;
        }
        const payCur = config?.paypalCurrency || "USD";
        const paypal = await loadPayPalScript(clientId, payCur);

        const createRes = await fetch(apiUrl("/api/checkout/paypal/create"), {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ orderId: json.orderId }),
        });
        const ppJson = await createRes.json().catch(() => ({}));
        if (!createRes.ok) throw new Error(ppJson.message || "PayPal create failed");

        if (paypalRef.current) paypalRef.current.innerHTML = "";
        await paypal.Buttons({
          createOrder: () => ppJson.paypalOrderId,
          onApprove: async (data) => {
            const cap = await fetch(apiUrl("/api/checkout/split-payment/capture"), {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeaders() },
              body: JSON.stringify({
                orderId: json.orderId,
                paypalOrderId: data.orderID,
              }),
            });
            const capJson = await cap.json().catch(() => ({}));
            if (!cap.ok) throw new Error(capJson.message || "Capture failed");
            setStageIndex(3);
            setPaypalReady(true);
          },
          onError: (e) => setErr(String(e?.message || "PayPal error")),
        }).render(paypalRef.current);
        setStageIndex(2);
        return;
      }

      if (method === "bank_transfer") {
        const json = await createOrder("bank_transfer");
        if (!receiptFile) {
          setErr("Upload your bank transfer receipt image.");
          setStageIndex(-1);
          return;
        }
        const fd = new FormData();
        fd.append("orderId", json.orderId);
        fd.append("bankReference", bankRef);
        fd.append("receipt", receiptFile);
        const up = await fetch(apiUrl("/api/checkout/bank-transfer"), {
          method: "POST",
          headers: authHeaders(),
          body: fd,
        });
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(upJson.message || "Receipt upload failed");
        setStageIndex(3);
        return;
      }

      if (method === "cod") {
        await createOrder("cod");
        setStageIndex(3);
      }
    } catch (e) {
      setErr(e.message || "Checkout failed");
      setStageIndex(-1);
    } finally {
      clearStages();
    }
  }

  const bank = config?.bankDetails;
  const activeStage = stageIndex >= 0 ? STAGES[stageIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-lg"
    >
      <div>
        <h2 className="font-display text-xl font-semibold text-white">Universal Checkout</h2>
        <p className="mt-1 text-xs text-white/50">
          Ledger in SAR (Fixer.io) · PayPal settles in USD for global buyers
        </p>
      </div>

      <FacilitatorNote className="text-xs" />
      <TrustBadges compact />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 backdrop-blur-md">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">VIP Shipping</p>
          <p className="mt-0.5 text-[11px] text-white/55">
            International door-to-door · tracked fulfilment from global partners
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-amber-300/40 px-3 py-1 text-[10px] font-bold uppercase text-amber-100">
          Included
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { id: "paypal", title: "PayPal / Card", sub: "International VIP" },
          { id: "bank_transfer", title: "Bank / Wallet", sub: "PK · JazzCash / SadaPay" },
          { id: "cod", title: "Cash on Delivery", sub: "Local trust" },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMethod(opt.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              method === opt.id
                ? "border-neon-cyan/50 bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                : "border-white/15 bg-black/20 hover:border-white/25"
            }`}
          >
            <p className="text-sm font-semibold text-white">{opt.title}</p>
            <p className="mt-1 text-[10px] text-white/45">{opt.sub}</p>
          </button>
        ))}
      </div>

      {method === "bank_transfer" && bank ? (
        <div className="rounded-2xl border border-white/15 bg-black/25 p-4 text-sm text-white/70">
          <p className="font-semibold text-white">{bank.pakistan?.title}</p>
          <ul className="mt-2 list-inside list-disc text-xs">
            {(bank.pakistan?.lines || []).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-4 font-semibold text-white">{bank.ksa?.title}</p>
          <ul className="mt-2 list-inside list-disc text-xs">
            {(bank.ksa?.lines || []).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <label className="mt-4 block text-xs text-white/50">
            Transfer reference (optional)
            <input
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mt-3 block text-xs text-white/50">
            Upload receipt
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-xs text-white/60"
            />
          </label>
        </div>
      ) : null}

      <label className="flex items-start gap-3 text-xs text-white/60">
        <input
          type="checkbox"
          checked={facilitatorConsent}
          onChange={(e) => setFacilitatorConsent(e.target.checked)}
          className="mt-0.5"
        />
        I understand KSA Store facilitates fulfilment via licensed partners.
      </label>

      <AnimatePresence mode="wait">
        {activeStage ? (
          <motion.div
            key={activeStage.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-3"
          >
            <p className="text-sm font-medium text-cyan-100">{activeStage.label}</p>
            <motion.div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet"
                animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {method === "paypal" ? <div ref={paypalRef} className="min-h-[45px]" /> : null}

      {totals ? (
        <p className="text-center font-mono text-sm text-neon-cyan">
          {totals.formatted?.display || totals.formatted?.sar}
        </p>
      ) : null}

      {err ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {err}
        </p>
      ) : null}

      {stageIndex === 3 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-center"
        >
          <p className="text-sm font-semibold text-emerald-200">Success!</p>
          <p className="mt-1 text-xs text-white/55">
            Order {ksaSerial || orderId}
            {method === "cod" || method === "bank_transfer"
              ? " — awaiting payment confirmation"
              : " — payment confirmed"}
          </p>
          <Link to="/account/orders" className="mt-3 inline-block text-xs text-neon-cyan hover:underline">
            View orders →
          </Link>
        </motion.div>
      ) : (
        <button
          type="button"
          onClick={submitCheckout}
          disabled={stageIndex >= 0 && stageIndex < 3 && method !== "paypal"}
          className="w-full rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3.5 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
        >
          {method === "paypal" && !paypalReady
            ? "Pay with PayPal · 30% profit auto-split"
            : "Complete checkout"}
        </button>
      )}
    </motion.div>
  );
}
