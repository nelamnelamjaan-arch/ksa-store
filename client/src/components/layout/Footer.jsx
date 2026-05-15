import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import TrustBadges from "../trust/TrustBadges.jsx";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-charcoal-950/90 py-14 backdrop-blur-md">
      <motion.div
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <TrustBadges className="mb-10" />

        <motion.div
          className="grid gap-10 border-t border-white/[0.06] pt-10 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">KSA Store</p>
            <p className="mt-3 text-sm leading-relaxed text-white/45">
              Premium global marketplace — curated sourcing, VIP fulfilment, and transparent
              partner retail across Saudi Arabia and beyond.
            </p>
          </motion.div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-cyan/80">Shop</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-white/50">
              <Link to="/browse" className="transition hover:text-neon-cyan">
                Browse catalogue
              </Link>
              <Link to="/gourmet" className="transition hover:text-neon-cyan">
                Gourmet
              </Link>
              <Link to="/track" className="transition hover:text-neon-cyan">
                Track shipment
              </Link>
              <Link to="/track-order" className="transition hover:text-neon-cyan">
                Track KSA order
              </Link>
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-cyan/80">Legal</p>
            <nav className="mt-4 flex flex-col gap-2 text-sm text-white/50">
              <Link to="/about" className="transition hover:text-neon-cyan">
                About
              </Link>
              <Link to="/privacy" className="transition hover:text-neon-cyan">
                Privacy
              </Link>
              <Link to="/terms" className="transition hover:text-neon-cyan">
                Terms
              </Link>
              <Link to="/refund-policy" className="transition hover:text-neon-cyan">
                Refund policy
              </Link>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-cyan/80">Contact</p>
            <div className="mt-4 space-y-2 text-sm text-white/50">
              <a
                href="mailto:nelamnelamjaan@gmail.com"
                className="block transition hover:text-neon-cyan"
              >
                nelamnelamjaan@gmail.com
              </a>
              <p className="leading-relaxed">
                Support hub — Faisalabad, Punjab, Pakistan
                <br />
                <span className="text-white/35">Mon–Sat · 10:00–18:00 PKT</span>
              </p>
              <Link to="/contact" className="inline-block text-neon-cyan/90 transition hover:text-neon-cyan">
                Full contact page →
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} KSA Store · World&apos;s luxury at your doorstep
          </p>
          <Link
            to="/admin/cache"
            className="text-xs font-medium uppercase tracking-wider text-white/30 transition hover:text-neon-cyan"
          >
            Admin cache
          </Link>
        </div>
      </motion.div>
    </footer>
  );
}
