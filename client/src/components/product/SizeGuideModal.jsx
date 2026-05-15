import { motion, AnimatePresence } from "framer-motion";

const SIZE_ROWS = [
  { us: "XS", uk: "6", eu: "34", cm: "82–86" },
  { us: "S", uk: "8", eu: "36", cm: "86–90" },
  { us: "M", uk: "10", eu: "38", cm: "90–94" },
  { us: "L", uk: "12", eu: "40", cm: "94–98" },
  { us: "XL", uk: "14", eu: "42", cm: "98–102" },
  { us: "XXL", uk: "16", eu: "44", cm: "102–106" },
];

const SHOE_ROWS = [
  { us: "6", uk: "5.5", eu: "39", cm: "24.5" },
  { us: "7", uk: "6.5", eu: "40", cm: "25.5" },
  { us: "8", uk: "7.5", eu: "41", cm: "26.5" },
  { us: "9", uk: "8.5", eu: "42", cm: "27.5" },
  { us: "10", uk: "9.5", eu: "43", cm: "28.5" },
  { us: "11", uk: "10.5", eu: "44", cm: "29.5" },
];

/**
 * @param {{ open: boolean, onClose: () => void, mode?: 'fashion' | 'shoes' }} props
 */
export default function SizeGuideModal({ open, onClose, mode = "fashion" }) {
  const rows = mode === "shoes" ? SHOE_ROWS : SIZE_ROWS;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-neon-cyan/5"
            />
            <motion.div className="relative border-b border-white/10 px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon-cyan/80">
                VIP Fit
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Size Guide</h2>
              <p className="mt-1 text-xs text-white/45">US · UK · EU · CM</p>
            </motion.div>
            <motion.div className="relative max-h-[60vh] overflow-auto px-4 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/40">
                    <th className="pb-3 text-left font-semibold">US</th>
                    <th className="pb-3 text-center font-semibold">UK</th>
                    <th className="pb-3 text-center font-semibold">EU</th>
                    <th className="pb-3 text-right font-semibold">CM</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.us} className="border-t border-white/[0.06]">
                      <td className="py-3 font-medium text-white">{row.us}</td>
                      <td className="py-3 text-center text-white/75">{row.uk}</td>
                      <td className="py-3 text-center text-white/75">{row.eu}</td>
                      <td className="py-3 text-right text-neon-cyan/90">{row.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
            <motion.div className="relative border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
