import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { chartColorForLabel } from "../../utils/productCategoryUi.js";

function StatCard({ label, value, sub, accent = "cyan" }) {
  const ring =
    accent === "gold"
      ? "border-amber-400/30 from-amber-500/10"
      : accent === "emerald"
        ? "border-emerald-400/30 from-emerald-500/10"
        : accent === "rose"
          ? "border-pink-400/30 from-pink-500/10"
          : "border-neon-cyan/30 from-neon-cyan/10";
  return (
    <div className={`rounded-2xl border bg-gradient-to-br to-transparent p-5 backdrop-blur-lg ${ring}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
      {sub ? <p className="mt-1 text-xs text-white/50">{sub}</p> : null}
    </div>
  );
}

function fmtSar(n) {
  return `${Number(n || 0).toFixed(2)} SAR`;
}

export default function AdminSalesAnalyticsPanel({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/analytics/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Could not load analytics");
        return;
      }
      setData(json);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const pieData = (data?.categoryBreakdownAllTime || []).map((c) => ({
    name: c.label,
    value: c.revenueSAR,
  }));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Sales Analytics</h2>
          <p className="mt-1 text-xs text-white/45">Auto-refresh every 30s · paid orders only</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {err ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {err}
        </p>
      ) : null}

      {loading && !data ? <p className="mt-8 text-sm text-white/40">Loading analytics…</p> : null}

      {data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total revenue" value={fmtSar(data.allTime?.revenueSAR)} />
            <StatCard
              label="Total profit (30%)"
              value={fmtSar(data.allTime?.profitSAR)}
              sub={`${data.allTime?.orderCount || 0} orders all-time`}
              accent="emerald"
            />
            <StatCard
              label="Profit sent to PayPal"
              value={fmtSar(data.allTime?.profitSentPayPalSAR)}
              sub={`${data.allTime?.profitSentPayPalCount || 0} payouts`}
              accent="gold"
            />
            <StatCard
              label="Last 24h profit"
              value={fmtSar(data.last24h?.profitSAR)}
              sub={`${data.last24h?.orderCount || 0} orders today`}
              accent="rose"
            />
          </div>

          {pieData.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-amber-400/20 bg-black/20 p-4 backdrop-blur-md">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-200/80">
                  Revenue by category
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={chartColorForLabel(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#111",
                          border: "1px solid rgba(212,175,55,0.3)",
                          borderRadius: 12,
                        }}
                        formatter={(v) => fmtSar(v)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-black/20 p-4 backdrop-blur-md">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-200/80">
                  Profit by category (24h)
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categoryBreakdown || []}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#888", fontSize: 9 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis tick={{ fill: "#888", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#111",
                          border: "1px solid rgba(52,211,153,0.3)",
                          borderRadius: 12,
                        }}
                        formatter={(v) => fmtSar(v)}
                      />
                      <Bar dataKey="profitSAR" radius={[6, 6, 0, 0]}>
                        {(data.categoryBreakdown || []).map((c) => (
                          <Cell key={c.label} fill={chartColorForLabel(c.label)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-white/40">No category sales yet.</p>
          )}

          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Fulfilment queue
            </h3>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3 text-right">Cost</th>
                    <th className="px-4 py-3 text-right">Sale</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.fulfillment || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-white/40">
                        No pending fulfilment orders.
                      </td>
                    </tr>
                  ) : (
                    data.fulfillment.map((row) => (
                      <tr key={row.orderId} className="border-b border-white/[0.06]">
                        <td className="px-4 py-3 font-mono text-xs text-white">{row.serial}</td>
                        <td className="px-4 py-3 text-white/70">{row.category}</td>
                        <td className="px-4 py-3 text-right text-white/55">{fmtSar(row.costPriceSAR)}</td>
                        <td className="px-4 py-3 text-right text-white">{fmtSar(row.salePriceSAR)}</td>
                        <td className="px-4 py-3 text-center">
                          {row.sourceUrl ? (
                            <a
                              href={row.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold uppercase text-amber-200 hover:bg-amber-500/20"
                            >
                              Fulfill now
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
