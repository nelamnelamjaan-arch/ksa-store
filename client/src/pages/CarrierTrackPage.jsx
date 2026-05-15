import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CARRIERS, openCarrierTracking } from "../utils/carrierTracking.js";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-neon-cyan/40 focus:ring-2 focus:ring-neon-cyan/25";

export default function CarrierTrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [carrierId, setCarrierId] = useState(CARRIERS[0].id);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setErr("");

    const id = trackingId.trim();
    if (!id) {
      setErr("Please enter your tracking ID.");
      return;
    }

    setLoading(true);
    try {
      await openCarrierTracking(carrierId, id, { delayMs: 1000 });
    } catch (ex) {
      setErr(ex.message || "Could not open tracking page.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-20"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">
        Shipment tracking
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Track your <span className="text-gradient-vip">parcel</span>
      </h1>
      <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-white/50">
        Enter your carrier tracking number — we&apos;ll open the official courier site in a new tab.
        No third-party APIs.
      </p>

      <form
        onSubmit={handleSearch}
        className="glass-panel-strong mt-10 space-y-5 rounded-3xl p-6 sm:p-8"
        noValidate
      >
        <label className="block text-left text-xs font-medium uppercase tracking-wider text-white/45">
          Tracking ID
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="e.g. 12345678901"
            className={inputClass}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
        </label>

        <label className="block text-left text-xs font-medium uppercase tracking-wider text-white/45">
          Carrier
          <select
            value={carrierId}
            onChange={(e) => setCarrierId(e.target.value)}
            className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff55'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            }}
            disabled={loading}
          >
            {CARRIERS.map((c) => (
              <option key={c.id} value={c.id} className="bg-charcoal-900 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </label>

        {err ? (
          <p className="text-sm text-rose-300/90" role="alert">
            {err}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider text-charcoal-950 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            className={`absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-violet transition ${
              loading ? "opacity-70" : "opacity-100 group-hover:brightness-110"
            }`}
          />
          <span
            className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet opacity-40 blur-lg transition ${
              loading ? "animate-pulse" : "group-hover:opacity-70"
            }`}
            aria-hidden
          />
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-charcoal-950/30 border-t-charcoal-950"
                  aria-hidden
                />
                Opening carrier…
              </>
            ) : (
              "Search"
            )}
          </span>
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-white/35">
        Looking up a KSA Store order?{" "}
        <Link to="/track-order" className="text-neon-cyan hover:underline">
          Track by order number
        </Link>
      </p>
    </motion.div>
  );
}
