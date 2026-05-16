import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getFcmDeviceToken } from "../../lib/fcmRegister.js";
import { apiUrl } from "../../utils/apiUrl.js";

export default function PriceAlertButton({ productId }) {
  const { token } = useAuth();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe() {
    setMsg("");
    if (!token) {
      setMsg("Sign in first, then tap again.");
      return;
    }
    setBusy(true);
    try {
      const fcmToken = await getFcmDeviceToken();
      if (!fcmToken) {
        setMsg(
          "Push not ready — set VITE_FIREBASE_* keys, VAPID key, allow notifications, and use HTTPS (or localhost)."
        );
        return;
      }
      const res = await fetch(apiUrl("/api/alerts/price-watch"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, fcmToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || "Could not enable alerts");
        return;
      }
      setMsg("You’re subscribed. We’ll ping you if the price drops by 5% or more.");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-semibold text-white">Alert me on price drops</p>
      <p className="mt-1 text-xs text-white/50">
        FCM push when automated sync detects your watchlist SKU is at least 5% cheaper in SAR.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={subscribe}
        className="mt-3 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-2 text-xs font-semibold text-neon-cyan transition hover:bg-neon-cyan/20 disabled:opacity-40"
      >
        {busy ? "Working…" : "Enable push alerts"}
      </button>
      {msg ? <p className="mt-2 text-xs text-white/70">{msg}</p> : null}
    </div>
  );
}
