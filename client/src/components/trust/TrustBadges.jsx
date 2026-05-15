import { motion } from "framer-motion";

const BADGES = [
  { id: "ssl", label: "SSL Secured", icon: "🔒" },
  { id: "stripe", label: "Verified by Stripe", icon: "✓" },
  { id: "global", label: "Global Sourcing", icon: "🌐" },
];

export default function TrustBadges({ compact = false, className = "" }) {
  return (
    <motion.ul
      className={`flex flex-wrap items-center justify-center gap-3 ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Trust and security badges"
    >
      {BADGES.map((b, i) => (
        <motion.li
          key={b.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.35 }}
          className={
            compact
              ? "inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/50"
              : "inline-flex items-center gap-2 rounded-xl border border-neon-cyan/20 bg-neon-cyan/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 shadow-[0_0_24px_rgba(0,229,255,0.08)]"
          }
        >
          <span aria-hidden>{b.icon}</span>
          {b.label}
        </motion.li>
      ))}
    </motion.ul>
  );
}
