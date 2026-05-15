import { useEffect, useMemo, useState } from "react";

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

function seededRange(seed, salt, min, max) {
  const x = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  const t = x - Math.floor(x);
  return min + Math.floor(t * (max - min + 1));
}

/**
 * Social proof strip — plausible live signals (not real telemetry).
 */
export default function LiveActivityBadge({ productId }) {
  const seed = useMemo(() => hashSeed(String(productId || "x")), [productId]);
  const [mode, setMode] = useState(0);
  const [viewers, setViewers] = useState(() => seededRange(seed, 1, 4, 28));
  const [sold, setSold] = useState(() => seededRange(seed, 2, 1, 14));

  useEffect(() => {
    const id = setInterval(() => {
      setMode((m) => (m + 1) % 2);
      setViewers(seededRange(seed, Date.now() % 997, 3, 32));
      setSold(seededRange(seed, (Date.now() >> 10) % 200, 1, 18));
    }, 22_000);
    return () => clearInterval(id);
  }, [seed]);

  const label =
    mode === 0 ? (
      <>
        <span className="font-semibold text-neon-cyan">{viewers}</span> people viewing this item
        right now
      </>
    ) : (
      <>
        <span className="font-semibold text-neon-violet">{sold}</span> bought from this listing
        today (KSA region model)
      </>
    );

  return (
    <div className="mt-4 max-w-full space-y-1">
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.12] bg-black/35 px-4 py-2 text-xs text-white/70 shadow-inner backdrop-blur-md">
      <span
        className="relative flex h-2 w-2 shrink-0"
        aria-hidden
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      <span className="leading-snug">{label}</span>
      </div>
      <p className="text-[10px] text-white/35">Illustrative demand signal — not live visitor telemetry.</p>
    </div>
  );
}
