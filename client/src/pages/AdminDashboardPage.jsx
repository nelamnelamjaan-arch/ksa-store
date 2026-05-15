import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { isKiranGrandAdmin } from "../utils/kiranAdmin.js";
import MagicAmazonImportPanel from "../components/admin/MagicAmazonImportPanel.jsx";
import SourceVendorBadge from "../components/legal/SourceVendorBadge.jsx";

export default function AdminDashboardPage() {
  const { token, user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  useEffect(() => {
    if (!token || !isKiranGrandAdmin(user)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(json.message || `Error ${res.status}`);
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-white/45">Loading…</div>
    );
  }

  if (!token || !isKiranGrandAdmin(user)) {
    return <Navigate to="/admin/login" replace />;
  }

  async function copyDelivery(text) {
    setCopyMsg("");
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("Copied delivery block.");
      setTimeout(() => setCopyMsg(""), 2500);
    } catch {
      setCopyMsg("Could not access clipboard.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap gap-4">
        <Link to="/" className="text-sm text-neon-cyan hover:underline">
          ← Home
        </Link>
        <Link to="/admin/magic-import" className="text-sm text-neon-cyan hover:underline">
          Magic Import (advanced) →
        </Link>
        <Link to="/admin/stripe-payout" className="text-sm text-neon-cyan hover:underline">
          Stripe payout →
        </Link>
      </div>

      <h1 className="mt-6 font-display text-2xl font-bold text-white">Grand Admin · Operations</h1>
      <p className="mt-2 text-sm text-white/55">
        Signed in as <span className="text-white/90">{user.name}</span> — hyper-local queue and catalogue tools.
      </p>

      <div className="mt-10">
        <MagicAmazonImportPanel token={token} displayCurrency={currency} />
      </div>

      {err && (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {err}
        </p>
      )}
      {copyMsg && <p className="mt-4 text-xs text-teal-200/90">{copyMsg}</p>}

      {data?.pendingDropshipOrders && data.pendingDropshipOrders.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-200/90">
            Pending checkout · Purchase on partner
          </h2>
          <ul className="space-y-4">
            {data.pendingDropshipOrders.map((o) => (
              <li key={o._id} className="glass-panel rounded-2xl border border-teal-500/15 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm text-white">{o.ksaSerialGlobal}</p>
                    <p className="mt-1 text-xs text-white/45">{o.shop?.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.purchaseUrl ? (
                      <a
                        href={o.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 px-4 py-2 text-xs font-bold text-charcoal-950"
                      >
                        Purchase now
                      </a>
                    ) : null}
                    {o.deliveryClipboard ? (
                      <button
                        type="button"
                        onClick={() => copyDelivery(o.deliveryClipboard)}
                        className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/90"
                      >
                        Copy customer details
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data?.recentOrders && (
        <section className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">Recent paid orders</h2>
          <ul className="space-y-4">
            {data.recentOrders.map((o) => (
              <li key={o._id} className="glass-panel rounded-2xl p-5">
                <p className="font-mono text-sm text-white">{o.ksaSerialGlobal}</p>
                <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-3">
                  {(o.items || []).map((line, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-white/75">{line.title}</span>
                      <SourceVendorBadge
                        label={line.source_store_name_snapshot || line.source_vendor_label_snapshot}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
