/**
 * Glassmorphism facilitator / aggregator disclaimer (medicine & fresh produce).
 *
 * @param {{ partnerLabel?: string; className?: string }} props
 * — optional `partnerLabel` e.g. "Nahdi Pharmacy" from `source_vendor_display`
 */
export default function FacilitatorNote({ partnerLabel, className = "" }) {
  return (
    <aside
      className={`glass-panel rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl ${className}`}
      role="note"
      aria-label="Facilitator notice"
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="min-w-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/85">
            Independent aggregator
          </p>
          <p className="text-sm leading-relaxed text-white/82">
            KSA Store is an independent aggregator. This product is fulfilled by our licensed
            third-party partners. We ensure the best price and quality sourcing, but the original
            manufacturer/vendor remains responsible for product authenticity and warranty.
          </p>
          {partnerLabel ? (
            <p className="text-xs font-medium text-white/60">
              <span className="text-white/40">Partner storefront · </span>
              {partnerLabel}
            </p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
