import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function Timeline({ events }) {
  if (!events?.length) return null;
  return (
    <ol className="relative mt-8 space-y-0 pl-2">
      <div
        className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-neon-cyan/60 via-neon-violet/40 to-transparent"
        aria-hidden
      />
      {events.map((ev, i) => (
        <motion.li
          key={ev.key || i}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="relative flex gap-4 pb-8 last:pb-0"
        >
          <span
            className={`relative z-10 mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
              ev.status === "active"
                ? "border-neon-cyan bg-neon-cyan/20 shadow-[0_0_16px_rgba(0,229,255,0.5)]"
                : ev.status === "completed"
                  ? "border-neon-cyan/50 bg-neon-cyan/10"
                  : "border-white/15 bg-charcoal-900"
            }`}
          >
            {ev.status === "completed" && (
              <span className="text-[10px] text-neon-cyan">✓</span>
            )}
            {ev.status === "active" && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
            )}
          </span>
          <motion.div
            className={`flex-1 rounded-2xl border px-4 py-3 backdrop-blur-xl ${
              ev.status === "active"
                ? "border-neon-cyan/30 bg-neon-cyan/[0.06] shadow-glass"
                : "border-white/[0.08] bg-white/[0.04]"
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-cyan/90">
              {ev.label}
            </p>
            <p className="mt-1 text-sm text-white/75">{ev.message}</p>
            {ev.location ? (
              <p className="mt-1 text-xs text-white/40">{ev.location}</p>
            ) : null}
            {ev.checkpointTime ? (
              <p className="mt-2 text-[11px] text-white/35">{formatTime(ev.checkpointTime)}</p>
            ) : null}
          </motion.div>
        </motion.li>
      ))}
    </ol>
  );
}

function TrackingResult({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-panel mt-8 overflow-hidden rounded-2xl border border-white/[0.08] p-6 shadow-glass backdrop-blur-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-neon-cyan">
          {data.carrierTag || "Processing"}
        </span>
        <span className="font-mono text-xs text-white/40">
          {data.ksaSerialGlobal || data.orderNumber}
        </span>
      </div>
      {data.trackingNumber ? (
        <p className="mt-4 text-sm text-white/60">
          Carrier:{" "}
          <span className="text-white/80">
            {data.carrier || data.courierCode || "International"}
          </span>
          {" · "}
          Tracking:{" "}
          <span className="font-mono text-neon-cyan/90">{data.trackingNumber}</span>
        </p>
      ) : (
        <p className="mt-4 text-sm text-white/50">
          Your parcel is being prepared — tracking will appear once dispatched from our global hub.
        </p>
      )}
      <Timeline events={data.timeline} />
      <p className="mt-6 text-center text-xs text-white/35">
        Need help?{" "}
        <Link to="/contact" className="text-neon-cyan hover:underline">
          Contact support
        </Link>
      </p>
    </motion.div>
  );
}

export default function TrackOrderPage() {
  const { id: routeId } = useParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  async function fetchTracking(url) {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Tracking lookup failed");
      setData(json);
    } catch (ex) {
      setErr(ex.message || "Could not load tracking");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!routeId?.trim()) return;
    setOrderNumber(routeId.trim());
    fetchTracking(`/api/tracking/${encodeURIComponent(routeId.trim())}`);
  }, [routeId]);

  async function handleTrack(e) {
    e.preventDefault();
    const q = orderNumber.trim();
    if (!q) {
      setErr("Enter your order number (e.g. KSA-… or KSA-GLOBAL-000042).");
      return;
    }
    const params = new URLSearchParams({ orderNumber: q });
    if (email.trim()) params.set("email", email.trim());
    await fetchTracking(`/api/tracking?${params}`);
  }

  const showLookupForm = !routeId;

  return (
    <motion.div
      className="mx-auto max-w-2xl px-4 py-16 sm:px-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">
        Global logistics
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
        Track your <span className="text-gradient-vip">order</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-white/50">
        Real-time carrier updates via AfterShip. No tracking number yet? We show a live VIP
        processing timeline automatically.
      </p>

      {showLookupForm ? (
        <form
          onSubmit={handleTrack}
          className="glass-panel mt-10 space-y-4 rounded-2xl border border-white/[0.08] p-6 shadow-glass backdrop-blur-2xl"
        >
          <label className="block text-left text-xs font-medium uppercase tracking-wider text-white/45">
            Order number
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="KSA-GLOBAL-000042 or KSA-…"
              className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white outline-none ring-neon-cyan/30 focus:ring-2"
              autoComplete="off"
            />
          </label>
          <label className="block text-left text-xs font-medium uppercase tracking-wider text-white/45">
            Email (optional verification)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white outline-none ring-neon-cyan/30 focus:ring-2"
            />
          </label>
          {err ? (
            <p className="text-sm text-red-400/90" role="alert">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-neon-cyan/90 to-neon-violet/80 py-3 text-sm font-semibold uppercase tracking-wider text-charcoal-950 transition hover:opacity-95 disabled:opacity-50"
          >
            {loading ? "Fetching status…" : "Track order"}
          </button>
        </form>
      ) : (
        <motion.div className="mt-10">
          {loading && !data ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-sm text-white/50 shadow-glass">
              Loading your shipment timeline…
            </div>
          ) : null}
          {err ? (
            <p className="glass-panel rounded-2xl p-6 text-center text-sm text-red-400/90" role="alert">
              {err}
              <Link to="/track-order" className="mt-4 block text-neon-cyan hover:underline">
                Look up by order number
              </Link>
            </p>
          ) : null}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {data ? <TrackingResult data={data} /> : null}
      </AnimatePresence>
    </motion.div>
  );
}
