/**
 * Sleek minimalist “K” mark with neon gradient border — pure SVG/CSS.
 */
export default function LogoKSA({ className = "", size = 44 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="ksaLogoStroke" x1="4" y1="8" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00e5ff" />
          <stop offset="0.45" stopColor="#a855f7" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="ksaLogoFill" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.85" />
        </linearGradient>
        <filter id="ksaLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="13"
        stroke="url(#ksaLogoStroke)"
        strokeWidth="1.35"
        fill="rgba(255,255,255,0.04)"
        filter="url(#ksaLogoGlow)"
      />
      <path
        d="M16 14h3.2v20H16V14zm5.5 0L30 24l-8.5 10h3.8L33.5 24 25.3 14H21.5z"
        fill="url(#ksaLogoFill)"
      />
    </svg>
  );
}
