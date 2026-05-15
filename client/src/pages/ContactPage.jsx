import { motion } from "framer-motion";
import TrustBadges from "../components/trust/TrustBadges.jsx";

export default function ContactPage() {
  return (
    <motion.div
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">
        VIP support
      </p>
      <h1 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
        Contact <span className="text-gradient-vip">KSA Store</span>
      </h1>

      <TrustBadges className="mt-8" />

      <motion.div
        className="glass-panel mt-10 space-y-6 rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Email</p>
          <a
            href="mailto:nelamnelamjaan@gmail.com"
            className="mt-2 block text-lg font-medium text-neon-cyan transition hover:text-white"
          >
            nelamnelamjaan@gmail.com
          </a>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Physical support address
          </p>
          <address className="mt-2 not-italic text-sm leading-relaxed text-white/65">
            KSA Store Support Hub
            <br />
            Faisalabad, Punjab
            <br />
            Pakistan
          </address>
          <p className="mt-3 text-xs text-white/40">Hours: Monday–Saturday, 10:00–18:00 PKT</p>
        </motion.div>
        <div className="border-t border-white/[0.08] pt-6 text-sm text-white/50">
          <p>
            For order tracking, visit{" "}
            <a href="/track-order" className="text-neon-cyan hover:underline">
              Track order
            </a>
            . For refunds, see our{" "}
            <a href="/refund-policy" className="text-neon-cyan hover:underline">
              refund policy
            </a>
            .
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
