import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "../../utils/apiUrl.js";

function StatusPill({ ok, label }) {
  return (
    <span
      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        ok
          ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
          : "border-amber-400/50 bg-amber-500/15 text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

function serviceLabel(service) {
  const map = {
    scraper: "Scraper",
    rainforest: "Rainforest",
    serpapi: "SerpApi",
    ai: "Gemini VIP",
    cloudinary: "Cloudinary",
    fixer: "Fixer.io",
    cron: "Cron (6h)",
  };
  return map[service] || service;
}

export default function AdminAutomationLogsPanel({ token }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setErr("");
    try {
      const res = await fetch(apiUrl("/api/admin/automation/logs?limit=60"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Could not load automation logs");
        return;
      }
      setPayload(json);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  async function runSyncNow() {
    setRunning(true);
    setErr("");
    try {
      const res = await fetch(apiUrl("/api/admin/automation/run-sync"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "Sync failed");
        return;
      }
      await load();
    } catch {
      setErr("Network error");
    } finally {
      setRunning(false);
    }
  }

  const st = payload?.status;
  const logs = payload?.logs || [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-violet-500/[0.06] p-6 shadow-[0_16px_56px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Automation Logs</h2>
          <p className="mt-1 text-xs text-white/50">
            Scraper, SerpApi/Rainforest, Gemini VIP, Cloudinary, Fixer.io — Auto-Pilot cron every 6h.
          </p>
        </div>
        <button
          type="button"
          onClick={runSyncNow}
          disabled={running}
          className="rounded-xl border border-violet-400/40 bg-violet-500/20 px-4 py-2 text-xs font-bold text-violet-100 hover:bg-violet-500/30 disabled:opacity-50"
        >
          {running ? "Syncing…" : "Run sync now"}
        </button>
      </motion.div>

      {st && (
        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill ok={st.scraper?.ok !== false} label={`Scraper · ${st.scraper?.lastMessage?.slice(0, 28) || "idle"}`} />
          <StatusPill ok={st.ai?.ok !== false} label={`AI · ${st.ai?.lastMessage?.slice(0, 28) || "idle"}`} />
          <StatusPill
            ok
            label={`Cron · checked ${st.cron?.productsChecked ?? 0} · hidden ${st.cron?.productsHidden ?? 0}`}
          />
        </div>
      )}

      {err && (
        <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100/90">
          {err}
        </p>
      )}

      <div className="mt-5 max-h-80 overflow-y-auto rounded-2xl border border-white/8 bg-black/25 p-3 font-mono text-[11px]">
        {loading && !logs.length ? (
          <p className="text-white/40">Loading logs…</p>
        ) : logs.length === 0 ? (
          <p className="text-white/40">No automation events yet. Import a product or enable cron.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((row) => (
              <li
                key={row.id}
                className={`rounded-lg px-2 py-1.5 ${
                  row.level === "error"
                    ? "bg-rose-500/10 text-rose-100/90"
                    : row.level === "warn"
                      ? "bg-amber-500/10 text-amber-100/85"
                      : "text-white/70"
                }`}
              >
                <span className="text-white/35">{new Date(row.at).toLocaleTimeString()}</span>{" "}
                <span className="text-violet-300/90">[{serviceLabel(row.service)}]</span> {row.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
