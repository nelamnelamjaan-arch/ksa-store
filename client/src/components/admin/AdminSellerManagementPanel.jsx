import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../utils/apiUrl.js";

const STATUS_OPTIONS = [
  { value: true, label: "Approve" },
  { value: false, label: "Pending" },
];

/**
 * @param {{ token: string }} props
 */
export default function AdminSellerManagementPanel({ token }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    username: "",
    password: "",
    shopName: "",
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(apiUrl("/api/admin/sellers"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Could not load sellers");
        return;
      }
      setSellers(json.sellers || []);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function createSeller(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(apiUrl("/api/admin/sellers"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, approve: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Create failed");
        return;
      }
      setForm({ email: "", name: "", username: "", password: "", shopName: "" });
      await load();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function patchStatus(id, isApproved) {
    setErr("");
    try {
      const res = await fetch(apiUrl(`/api/admin/sellers/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved }),
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
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-violet-500/[0.06] p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <h2 className="font-display text-lg font-semibold text-white">Seller Management</h2>
      <p className="mt-1 text-xs text-white/50">
        Create sellers, approve accounts, or block access. Approved sellers can import via their dashboard.
      </p>

      <form onSubmit={createSeller} className="mt-5 grid gap-3 sm:grid-cols-2">
        {["email", "name", "username", "password", "shopName"].map((key) => (
          <label key={key} className="block text-xs text-white/45 sm:col-span-1">
            {key === "shopName" ? "Shop name" : key.charAt(0).toUpperCase() + key.slice(1)}
            <input
              type={key === "password" ? "password" : key === "email" ? "email" : "text"}
              required
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white"
            />
          </label>
        ))}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-2xl border border-neon-cyan/50 bg-neon-cyan/15 px-6 py-2.5 text-sm font-bold text-neon-cyan shadow-[0_0_20px_rgba(0,229,255,0.25)] hover:bg-neon-cyan/25 disabled:opacity-40"
          >
            Add seller
          </button>
        </div>
      </form>

      {err ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100/90">
          {err}
        </p>
      ) : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-white/40">Loading sellers…</p>
        ) : sellers.length === 0 ? (
          <p className="text-sm text-white/40">No sellers yet.</p>
        ) : (
          sellers.map((s) => (
            <motion.div
              key={s.id}
              layout
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md"
            >
              <div>
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-white/45">
                  @{s.username || "—"} · {s.email}
                </p>
                {s.shop ? (
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-neon-cyan/80">
                    /shops/{s.shop.slug}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => patchStatus(s.id, opt.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      Boolean(s.isApproved) === opt.value
                        ? opt.value
                          ? "border border-emerald-400/50 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.3)]"
                          : "border border-amber-400/50 bg-amber-500/15 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                        : "border border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
