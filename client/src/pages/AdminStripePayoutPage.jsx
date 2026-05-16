import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isKiranGrandAdmin } from "../utils/kiranAdmin.js";
import { apiUrl } from "../utils/apiUrl.js";

function minorToMajor(amount, currency) {
  const c = String(currency || "usd").toLowerCase();
  const zero = ["jpy", "krw", "vnd"].includes(c) ? 0 : 2;
  const n = Number(amount) || 0;
  const div = zero === 0 ? 1 : 100;
  return (n / div).toFixed(zero);
}

export default function AdminStripePayoutPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token || !isKiranGrandAdmin(user)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/admin/stripe-payout"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(json.message || `Error ${res.status}`);
          return;
        }
        if (!cancelled) {
          setErr("");
          setData(json);
        }
      } catch {
        if (!cancelled) setErr("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  if (!token || !isKiranGrandAdmin(user)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap gap-4">
        <Link to="/admin/dashboard" className="text-sm text-neon-cyan hover:underline">
          ← Admin dashboard
        </Link>
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Stripe · Payout readiness</h1>
      <p className="mt-2 text-sm text-white/55">
        Live balance from Stripe. Connect Payoneer (or any bank) under Stripe → Settings → Bank accounts and
        payouts.
      </p>

      {err ? (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {err}
        </p>
      ) : null}

      {data ? (
        <div className="mt-8 space-y-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/45">Ready for payout</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {data.readyForPayout ? (
                    <span className="text-teal-300">Yes — positive available balance</span>
                  ) : (
                    <span className="text-white/60">No available balance</span>
                  )}
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Mode: {data.livemode ? "live" : "test"} · Scheduled payouts still follow your Stripe payout
                  settings.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-white">Available balances</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {(data.available || []).map((b, i) => (
                <li key={`a-${i}`} className="flex justify-between font-mono">
                  <span>{String(b.currency || "").toUpperCase()}</span>
                  <span>
                    {minorToMajor(b.amount, b.currency)} {String(b.currency || "").toUpperCase()}
                  </span>
                </li>
              ))}
              {(!data.available || data.available.length === 0) && (
                <li className="text-white/45">No available rows returned.</li>
              )}
            </ul>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-sm font-semibold text-white">Recent payouts</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {(data.recentPayouts || []).map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 font-mono text-xs text-white/75 last:border-0"
                >
                  <span>{p.id}</span>
                  <span>
                    {minorToMajor(p.amount, p.currency)} {String(p.currency || "").toUpperCase()} · {p.status}
                  </span>
                </li>
              ))}
              {(!data.recentPayouts || data.recentPayouts.length === 0) && (
                <li className="text-white/45">No recent payouts.</li>
              )}
            </ul>
          </div>

          {data.payoneerNote ? (
            <p className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs leading-relaxed text-white/70">
              {data.payoneerNote}
            </p>
          ) : null}
        </div>
      ) : !err ? (
        <p className="mt-8 text-sm text-white/45">Loading…</p>
      ) : null}
    </div>
  );
}
