import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function RefundPolicyPage() {
  return (
    <motion.article
      className="mx-auto max-w-3xl px-4 py-16 sm:px-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">Legal</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-white">Refund policy</h1>
      <p className="mt-2 text-sm text-white/45">Last updated: May 2026</p>

      <motion.div
        className="glass-panel mt-10 space-y-6 rounded-2xl p-8 text-sm leading-relaxed text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <section>
          <h2 className="font-display text-lg font-semibold text-white">Facilitator model</h2>
          <p className="mt-2">
            KSA Store acts as a licensed facilitator. Your order is fulfilled by named partner
            retailers (e.g. Nahdi, Carrefour, or verified global suppliers). Refunds follow partner
            return windows where applicable.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-white">Eligible refunds</h2>
          <ul className="mt-2 list-inside list-disc space-y-2">
            <li>Item not received within the quoted delivery window (after investigation).</li>
            <li>Significantly not as described — with photo evidence within 48 hours of delivery.</li>
            <li>Regulated pharmacy orders rejected at prescription review — full refund before dispatch.</li>
            <li>Duplicate charge or payment error — verified within 5 business days.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-white">Non-refundable</h2>
          <p className="mt-2">
            Perishable gourmet items after dispatch, custom-imported goods already sourced, and
            digital concierge services once delivered.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-white">How to request</h2>
          <p className="mt-2">
            Email{" "}
            <a href="mailto:nelamnelamjaan@gmail.com" className="text-neon-cyan hover:underline">
              nelamnelamjaan@gmail.com
            </a>{" "}
            with your order number and reason. Most cases resolve within 7–14 business days.
          </p>
        </section>
      </motion.div>

      <p className="mt-8 text-center text-sm text-white/40">
        <Link to="/terms" className="text-neon-cyan hover:underline">
          Terms of service
        </Link>
        {" · "}
        <Link to="/contact" className="text-neon-cyan hover:underline">
          Contact
        </Link>
      </p>
    </motion.article>
  );
}
