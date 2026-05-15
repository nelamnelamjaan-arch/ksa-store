const PALETTE = {
  default: { border: "rgba(0, 229, 255, 0.22)", glow: "0 0 42px rgba(168, 85, 247, 0.12)" },
  grocery: { border: "rgba(45, 212, 191, 0.38)", glow: "0 0 48px rgba(34, 211, 238, 0.14)" },
  pharmacy: { border: "rgba(74, 222, 128, 0.38)", glow: "0 0 48px rgba(34, 197, 94, 0.14)" },
};

/**
 * Wraps a “mini-store” (Grocery vs Pharmacy) with a subtle glass accent while keeping the base UI.
 *
 * @param {object} props
 * @param {"default"|"grocery"|"pharmacy"} [props.variant]
 * @param {string} [props.title]
 * @param {import("react").ReactNode} props.children
 */
export function SectionGlassShell({ variant = "default", title, children }) {
  const t = PALETTE[variant] || PALETTE.default;
  return (
    <section
      className="glass-panel rounded-[28px] p-6 md:p-8 transition-[border-color,box-shadow] duration-500"
      style={{ borderColor: t.border, boxShadow: t.glow }}
    >
      {title ? <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2> : null}
      {children}
    </section>
  );
}
