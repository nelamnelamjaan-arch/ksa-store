/**
 * Transparent attribution chip for order history & admin views.
 * @param {{ label: string; className?: string }} props
 */
export default function SourceVendorBadge({ label, className = "" }) {
  if (!label || !String(label).trim()) return null;
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/75 backdrop-blur-md ${className}`}
      title="Licensed partner attribution at time of purchase"
    >
      <span className="text-white/40">Sourced from</span>
      <span className="truncate font-semibold normal-case tracking-normal text-cyan-100/95">
        {label}
      </span>
    </span>
  );
}
