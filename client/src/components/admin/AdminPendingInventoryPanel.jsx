import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PRODUCT_STATUSES } from "../../constants/userRoles.js";
import { apiUrl } from "../../utils/apiUrl.js";

function StatusBadge({ status }) {
  if (status === PRODUCT_STATUSES.APPROVED) {
    return (
      <span className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-200 shadow-[0_0_10px_rgba(52,211,153,0.25)]">
        approved
      </span>
    );
  }
  if (status === PRODUCT_STATUSES.REJECTED) {
    return (
      <span className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-200">
        rejected
      </span>
    );
  }
  return (
    <span className="rounded-lg border border-amber-400/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]">
      pending
    </span>
  );
}

export default function AdminPendingInventoryPanel({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(apiUrl("/api/admin/products/pending?status=pending"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Could not load inventory");
        return;
      }
      setProducts(json.products || []);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproval(id, status) {
    setErr("");
    try {
      const res = await fetch(apiUrl(`/api/admin/products/${id}/approval`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Update failed");
        return;
      }
      await load();
    } catch {
      setErr("Network error");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-teal-500/[0.06] p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <h2 className="font-display text-lg font-semibold text-white">Pending Approval</h2>
      <p className="mt-1 text-xs text-white/50">
        Seller imports stay hidden until you approve. Amber = pending, emerald = live on storefront.
      </p>
      {err ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100/90">
          {err}
        </p>
      ) : null}
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-white/40">No pending products.</p>
        ) : (
          products.map((p) => (
            <motion.div
              key={p._id}
              layout
              className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 backdrop-blur-md"
            >
              <div className="flex flex-wrap gap-4">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-white">{p.title}</p>
                    <StatusBadge status={p.status || p.approvalStatus || "pending"} />
                  </div>
                  <p className="text-xs text-white/45">
                    {p.sellerId?.name || "Seller"} · {p.shop?.name || p.shopSlug}
                  </p>
                  <Link
                    to={`/products/${p.slug || p._id}`}
                    className="mt-1 inline-block text-[10px] text-neon-cyan hover:underline"
                  >
                    Preview
                  </Link>
                  {p.sourceUrl ? (
                    <a
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 ml-3 inline-block text-[10px] font-semibold text-amber-300 hover:underline"
                    >
                      Source URL (fulfil) →
                    </a>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setApproval(p._id, "approved")}
                    className="rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproval(p._id, "rejected")}
                    className="rounded-xl border border-white/15 px-4 py-2 text-xs text-white/60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
