import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { isApprovedSeller } from "../utils/sellerAccess.js";
import MagicAmazonImportPanel from "../components/admin/MagicAmazonImportPanel.jsx";
import { apiUrl } from "../utils/apiUrl.js";

export default function SellerDashboardPage() {
  const { token, user, loading } = useAuth();
  const { currency } = useCurrency();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token || !isApprovedSeller(user)) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/seller/dashboard"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(json.message || "Could not load dashboard");
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

  if (!token || !isApprovedSeller(user)) {
    return <Navigate to="/seller/login" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Storefront
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Seller Dashboard</h1>
      <p className="mt-2 text-sm text-white/55">
        {user.name} · {data?.shop?.name}
        {data?.shop?.slug ? (
          <>
            {" "}
            ·{" "}
            <Link to={`/shops/${data.shop.slug}`} className="text-neon-cyan hover:underline">
              View public shop
            </Link>
          </>
        ) : null}
      </p>

      {data?.stats ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Pending", data.stats.pendingProducts],
            ["Live", data.stats.liveProducts],
            ["Recent orders", data.stats.recentOrderCount],
          ].map(([label, val]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-md"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
              <p className="mt-1 font-mono text-xl text-white">{val}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        <MagicAmazonImportPanel
          token={token}
          displayCurrency={currency}
          importEndpoint="/api/seller/import"
          loaderText="AI is scanning the globe…"
          successHint="Submitted for Super Admin approval — not visible on the storefront yet."
        />
      </div>

      {err ? (
        <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {err}
        </p>
      ) : null}

      {data?.recentProducts?.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">Your products</h2>
          <ul className="mt-4 space-y-3">
            {data.recentProducts.map((p) => (
              <li
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md"
              >
                <span className="text-sm text-white/85">{p.title}</span>
                <span
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.approvalStatus === "approved"
                      ? "border border-teal-400/40 text-teal-200"
                      : p.approvalStatus === "rejected"
                        ? "border border-rose-400/40 text-rose-200"
                        : "border border-amber-400/40 text-amber-200"
                  }`}
                >
                  {p.status || p.approvalStatus}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
