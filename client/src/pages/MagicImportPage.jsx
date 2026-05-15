import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import { isKiranGrandAdmin } from "../utils/kiranAdmin.js";

const STEPS = [
  "Fetching Data…",
  "AI Rewriting Description…",
  "Converting Currency & Adding Margin…",
  "Uploading Images to KSA Cloud…",
];

function formatSar(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(2)} SAR`;
}

export default function MagicImportPage() {
  const { token, user, loading: authLoading } = useAuth();
  const authHeaders = useMemo(() => {
    const h = { "Content-Type": "application/json" };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, [token]);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [editTitle, setEditTitle] = useState("");
  const [editKsaPrice, setEditKsaPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [defaultShopId, setDefaultShopId] = useState("");
  const [shopIdInput, setShopIdInput] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [bgJobId, setBgJobId] = useState(null);
  const [realtimePct, setRealtimePct] = useState(0);
  const socketRef = useRef(null);

  const loadInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const res = await fetch("/api/admin/magic-import/inventory?limit=200", { headers: authHeaders });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setInventory(data.items || []);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [authHeaders]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", { headers: authHeaders });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.defaultImportShopId) {
        setDefaultShopId(String(data.defaultImportShopId));
        setShopIdInput(String(data.defaultImportShopId));
      }
    } catch {
      /* ignore */
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!token || !isKiranGrandAdmin(user)) return;
    loadInventory();
    loadSettings();
  }, [token, user, loadInventory, loadSettings]);

  useEffect(() => {
    if (!loading) return;
    setStepIdx(0);
    const id = setInterval(() => {
      setStepIdx((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1200);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  async function runPreview() {
    setBgJobId(null);
    setRealtimePct(0);
    setError("");
    setPreview(null);
    setWarnings([]);
    setLoading(true);
    setStepIdx(0);
    try {
      const res = await fetch("/api/admin/magic-import/preview", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || `Preview failed (${res.status})`);
        setLoading(false);
        return;
      }
      const p = data.preview;
      setPreview(p);
      setCategories(data.categories || []);
      setWarnings(data.warnings || []);
      setEditTitle(p.title || "");
      setEditKsaPrice(String(p.ksaPrice ?? ""));
      setEditCategoryId(p.categoryId || "");
      setEditActive(true);
      setStepIdx(STEPS.length - 1);
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function runPreviewRealtime() {
    setError("");
    setPreview(null);
    setWarnings([]);
    setBgJobId(null);
    setRealtimePct(0);
    setLoading(true);
    setStepIdx(0);
    socketRef.current?.disconnect();
    socketRef.current = null;
    try {
      const res = await fetch("/api/admin/magic-import/preview-async", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || `Async preview unavailable (${res.status})`);
        setLoading(false);
        return;
      }
      const jobId = data.jobId;
      setBgJobId(jobId);

      const socketRoot = import.meta.env.VITE_SOCKET_URL || window.location.origin;
      const socket = io(socketRoot, {
        path: "/socket.io",
        transports: ["websocket"],
        autoConnect: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("auth", token);
      });

      socket.on("magic-import-progress", (payload) => {
        if (String(payload?.jobId) !== String(jobId)) return;
        setRealtimePct(Math.min(100, Number(payload.progress) || 0));
        if (payload.done && payload.result?.preview) {
          const r = payload.result;
          const p = r.preview;
          setPreview(p);
          setCategories(r.categories || []);
          setWarnings(r.warnings || []);
          setEditTitle(p.title || "");
          setEditKsaPrice(String(p.ksaPrice ?? ""));
          setEditCategoryId(p.categoryId || "");
          setEditActive(true);
          setStepIdx(STEPS.length - 1);
          setLoading(false);
          socket.disconnect();
        }
        if (payload.done && payload.error) {
          setError(payload.error || "Preview failed");
          setLoading(false);
          socket.disconnect();
        }
      });
    } catch (e) {
      setError(e.message || "Network error");
      setLoading(false);
    }
  }

  async function publish() {
    if (!preview) return;
    setPublishing(true);
    setError("");
    const sid = shopIdInput.trim() || defaultShopId;
    if (!sid) {
      setError("Set Default Import Shop in admin settings, or paste a Shop ObjectId.");
      setPublishing(false);
      return;
    }
    try {
      const overrides = {
        title: editTitle.trim(),
        ksaPrice: editKsaPrice === "" ? undefined : Number(editKsaPrice),
        categoryId: editCategoryId || undefined,
        isActive: editActive,
      };
      const res = await fetch("/api/admin/magic-import/commit", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          shopId: sid,
          preview,
          overrides,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || `Publish failed (${res.status})`);
        return;
      }
      setPreview(null);
      setUrl("");
      await loadInventory();
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setPublishing(false);
    }
  }

  async function runSyncPrices() {
    setSyncing(true);
    setSyncResult(null);
    setError("");
    try {
      const res = await fetch("/api/admin/magic-import/sync-prices", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ limit: 40 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Sync failed");
        return;
      }
      setSyncResult(data);
      await loadInventory();
    } catch (e) {
      setError(e.message || "Network error");
    } finally {
      setSyncing(false);
    }
  }

  async function toggleRowActive(row, nextActive) {
    try {
      await fetch(`/api/admin/magic-import/products/${row.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isActive: nextActive }),
      });
      await loadInventory();
    } catch {
      /* ignore */
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-white/50">
        Loading session…
      </div>
    );
  }

  if (!token || !isKiranGrandAdmin(user)) {
    return <Navigate to="/admin/login" replace />;
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan/90">Grand Admin</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Magic Import
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            Paste any global product URL. Preview AI copy and pricing, adjust, then publish. Inventory
            and bulk price sync stay in sync with source listings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/cache"
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md transition hover:bg-white/[0.08]"
          >
            Server cache
          </Link>
          <Link to="/" className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-white/55">
            Storefront
          </Link>
        </div>
      </header>

      <section className="glass-panel-strong relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-cyan/10 blur-3xl" aria-hidden />
        <label className="block text-xs font-semibold uppercase tracking-wider text-white/45">
          Import from URL
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.com/… · noon.com · walmart.com · otto.de …"
            className="min-h-[52px] flex-1 rounded-2xl border border-white/[0.12] bg-charcoal-900/40 px-4 py-3 text-sm text-white shadow-inner backdrop-blur-xl placeholder:text-white/30 focus:border-neon-cyan/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/30 sm:text-[15px]"
          />
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-stretch">
            <button
              type="button"
              disabled={loading || !url.trim()}
              onClick={runPreview}
              className="rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-3 text-sm font-bold tracking-tight text-charcoal-950 shadow-lg shadow-neon-cyan/25 transition hover:brightness-110 disabled:opacity-40 sm:px-8"
            >
              {loading && !bgJobId ? "Working…" : "Preview (inline)"}
            </button>
            <button
              type="button"
              disabled={loading || !url.trim()}
              onClick={runPreviewRealtime}
              title="Runs on the worker queue; live progress over WebSockets"
              className="rounded-2xl border border-neon-cyan/35 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-neon-cyan/95 backdrop-blur-md transition hover:bg-white/[0.08] disabled:opacity-40 sm:px-8"
            >
              {loading && bgJobId ? `${Math.round(realtimePct)}%` : "Preview (background)"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/35">
          Default shop:{" "}
          <span className="font-mono text-white/55">{defaultShopId || "not set — use field below"}</span>
        </p>
        <input
          type="text"
          value={shopIdInput}
          onChange={(e) => setShopIdInput(e.target.value)}
          placeholder="Override Shop MongoDB id (optional)"
          className="mt-2 w-full max-w-xl rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-white/80 placeholder:text-white/25"
        />
      </section>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-8 rounded-3xl border border-white/[0.1] bg-charcoal-900/50 p-8 backdrop-blur-2xl"
          >
            <div className="mx-auto mb-8 h-14 w-14 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
            {bgJobId ? (
              <div className="mx-auto mb-8 max-w-md">
                <div className="mb-2 flex justify-between text-xs font-medium text-white/50">
                  <span>Worker queue</span>
                  <span>{Math.round(realtimePct)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.min(100, realtimePct)}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-[11px] text-white/35">Live updates via Socket.io (no refresh).</p>
              </div>
            ) : null}
            <ul className="mx-auto max-w-md space-y-4">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={`flex items-center gap-3 text-sm transition ${i <= stepIdx ? "text-white" : "text-white/30"}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i < stepIdx
                        ? "bg-neon-cyan/25 text-neon-cyan"
                        : i === stepIdx
                          ? "bg-gradient-to-br from-neon-cyan to-neon-violet text-charcoal-950 shadow-neon-cyan/30 shadow-lg"
                          : "border border-white/15 bg-white/[0.03] text-white/35"
                    }`}
                  >
                    {i < stepIdx ? "✓" : i + 1}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100/90">
          {error}
        </div>
      )}

      {preview && !loading && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 rounded-3xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-glass backdrop-blur-2xl sm:p-8"
        >
          <h2 className="font-display text-lg font-semibold text-white">Preview before live</h2>
          <p className="mt-1 text-xs text-white/45">Adjust title, list price (SAR), or category, then publish.</p>

          {warnings.length > 0 && (
            <ul className="mt-4 space-y-1 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
              {warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-white/40">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white focus:border-neon-cyan/40 focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">
                    KSA list price (SAR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editKsaPrice}
                    onChange={(e) => setEditKsaPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-sm text-white focus:border-neon-cyan/40 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-white/35">
                    COGS (SAR): {formatSar(preview.originalPriceSAR)} · Suggested margin:{" "}
                    {preview.profitMarginPercent}%
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-white/40">Category</label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white focus:border-neon-cyan/40 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded border-white/20 bg-charcoal-900 text-neon-cyan focus:ring-neon-cyan/40"
                />
                Active on storefront when published
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  disabled={publishing}
                  onClick={publish}
                  className="rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-2.5 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
                >
                  {publishing ? "Publishing…" : "Publish to catalogue"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setWarnings([]);
                  }}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:bg-white/[0.05]"
                >
                  Discard preview
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Source</p>
              <a
                href={preview.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 break-all text-xs text-neon-cyan hover:underline"
              >
                {preview.sourceUrl}
              </a>
              <dl className="mt-4 space-y-2 text-xs text-white/55">
                <div className="flex justify-between gap-2">
                  <dt>Native price</dt>
                  <dd className="font-mono text-white/80">
                    {preview.nativeAmount} {preview.nativeCurrency}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>FX source</dt>
                  <dd>{preview.fxLiveSource}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>AI</dt>
                  <dd>{preview.aiListingSource}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Scrape</dt>
                  <dd>{preview.importConnector}</dd>
                </div>
              </dl>
              {preview.images?.[0] && (
                <div
                  className="mt-4 aspect-square max-h-48 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${preview.images[0]})` }}
                />
              )}
            </div>
          </div>
        </motion.section>
      )}

      <section className="mt-14">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold text-white">Live import inventory</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={syncing || inventoryLoading}
              onClick={runSyncPrices}
              className="rounded-xl border border-neon-cyan/35 bg-neon-cyan/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-cyan transition hover:bg-neon-cyan/20 disabled:opacity-40"
            >
              {syncing ? "Syncing prices…" : "Sync all prices"}
            </button>
            <button
              type="button"
              disabled={inventoryLoading}
              onClick={loadInventory}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.05]"
            >
              Refresh
            </button>
          </div>
        </div>
        {syncResult && (
          <p className="mb-3 text-xs text-white/50">
            Updated {syncResult.updated} product(s) from live sources (batch size {syncResult.results?.length || 0}).
          </p>
        )}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Original SAR</th>
                  <th className="px-4 py-3 font-medium">KSA price</th>
                  <th className="px-4 py-3 font-medium">Margin %</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {inventoryLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/45">
                      Loading…
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-white/45">
                      No automation imports yet.
                    </td>
                  </tr>
                ) : (
                  inventory.map((row) => (
                    <tr key={row.id} className="border-b border-white/[0.05] text-white/80 last:border-0">
                      <td className="max-w-[200px] px-4 py-3">
                        <span className="line-clamp-2 font-medium text-white">{row.title}</span>
                        <p className="mt-0.5 text-[10px] uppercase text-white/35">{row.sourceType}</p>
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="line-clamp-2 break-all text-xs text-neon-cyan/90 hover:underline"
                        >
                          {row.sourceUrl}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{formatSar(row.originalPriceSAR)}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gradient-vip">
                        {formatSar(row.ksaPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{row.profitMarginPercent}%</td>
                      <td className="px-4 py-3">
                        {row.isActive ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleRowActive(row, !row.isActive)}
                          className="text-xs font-medium text-neon-cyan hover:underline"
                        >
                          {row.isActive ? "Hide" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
