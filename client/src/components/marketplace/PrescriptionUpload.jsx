import { useMemo } from "react";

/**
 * Checkout helper: collect HTTPS document URLs for prescription review.
 * Wire `uploads` + `onUploadsChange` to POST /api/checkout/* as `prescriptionUploads`.
 *
 * @param {{ uploads: { url: string; originalName?: string }[]; onUploadsChange: (next: { url: string; originalName?: string }[]) => void; disabled?: boolean }} props
 */
export function PrescriptionUpload({ uploads, onUploadsChange, disabled = false }) {
  const rows = useMemo(() => (Array.isArray(uploads) ? uploads : []), [uploads]);

  const setRows = (next) => onUploadsChange?.(next);

  const addRow = () => setRows([...rows, { url: "", originalName: "" }]);

  const updateRow = (index, patch) => {
    setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white">Prescription documents</h3>
          <p className="mt-1 text-xs text-white/60 leading-relaxed">
            Add secure HTTPS links to uploaded prescriptions (e.g. from your clinic portal or cloud
            storage). The order is flagged for Grand Admin review before fulfilment.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={addRow}
          className="shrink-0 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/[0.1] disabled:opacity-40"
        >
          Add link
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-white/45">No documents added yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => (
            <li key={i} className="rounded-xl border border-white/[0.08] bg-black/20 p-3 space-y-2">
              <label className="block text-[11px] uppercase tracking-wider text-white/45">
                Document URL (https)
                <input
                  type="url"
                  disabled={disabled}
                  placeholder="https://"
                  value={row.url}
                  onChange={(e) => updateRow(i, { url: e.target.value.trim() })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="block text-[11px] uppercase tracking-wider text-white/45">
                Label (optional)
                <input
                  type="text"
                  disabled={disabled}
                  placeholder="e.g. Dr. Al-Fateh — Amoxicillin"
                  value={row.originalName || ""}
                  onChange={(e) => updateRow(i, { originalName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeRow(i)}
                  className="text-xs text-rose-300/90 hover:text-rose-200 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
