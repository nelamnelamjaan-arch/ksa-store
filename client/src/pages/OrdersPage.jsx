import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import SourceVendorBadge from "../components/legal/SourceVendorBadge.jsx";
import OrderVipTrackingBar from "../components/orders/OrderVipTrackingBar.jsx";

export default function OrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          if (!cancelled) setErr(data.message || "Could not load orders");
          return;
        }
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setErr("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-white/60">Sign in to view your order history.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-neon-cyan hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Order history</h1>
      <p className="mt-2 text-sm text-white/55">
        Each line shows the licensed partner attribution captured at checkout.
      </p>

      {err && (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {err}
        </p>
      )}

      <ul className="mt-8 space-y-5">
        {orders.map((o) => (
          <li key={o._id} className="glass-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-sm text-white/90">{o.ksaSerialGlobal || o.orderNumber}</p>
              <span className="text-xs uppercase tracking-wider text-white/40">{o.status}</span>
            </div>
            <p className="mt-1 text-xs text-white/45">
              {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
            </p>
            <OrderVipTrackingBar step={o.vip_tracking_step ?? 0} status={o.status} />
            <ul className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
              {(o.items || []).map((line, idx) => (
                <li key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">{line.title}</p>
                    <p className="text-xs text-white/45">
                      ×{line.quantity} · {line.lineTotal} SAR
                    </p>
                  </div>
                  <SourceVendorBadge label={line.source_vendor_label_snapshot} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {orders.length === 0 && !err ? (
        <p className="mt-10 text-center text-sm text-white/45">No orders yet.</p>
      ) : null}
    </div>
  );
}
