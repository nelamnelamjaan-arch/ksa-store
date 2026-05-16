import { useState } from "react";
import { Link } from "react-router-dom";
import { productPath } from "../../utils/productLink.js";
import { apiUrl } from "../../utils/apiUrl.js";

export default function VisualSearchPanel() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [labels, setLabels] = useState([]);
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  async function search() {
    setMsg("");
    if (!file) {
      setMsg("Choose a photo first.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(apiUrl("/api/search/visual"), {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || "Visual search failed");
        setProducts([]);
        setLabels([]);
        return;
      }
      setLabels(Array.isArray(data.labels) ? data.labels : []);
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Visual search</p>
      <p className="mt-1 text-xs text-white/50">
        Google Vision labels → catalogue match (server key: GOOGLE_CLOUD_VISION_API_KEY).
      </p>
      <input
        type="file"
        accept="image/*"
        className="mt-3 block w-full text-xs text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={search}
        className="mt-3 w-full rounded-xl border border-neon-violet/40 bg-neon-violet/10 py-2 text-xs font-semibold text-neon-violet transition hover:bg-neon-violet/20 disabled:opacity-40"
      >
        {busy ? "Scanning…" : "Find similar products"}
      </button>
      {msg ? <p className="mt-2 text-xs text-amber-100/90">{msg}</p> : null}
      {labels.length > 0 ? (
        <p className="mt-3 text-[10px] text-white/40">Labels: {labels.slice(0, 8).join(" · ")}</p>
      ) : null}
      {products.length > 0 ? (
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
          {products.map((p) => (
            <li key={p._id}>
              <Link to={productPath(p)} className="text-neon-cyan hover:underline">
                {p.title}
              </Link>{" "}
              <span className="text-white/40">· {p.ksaPrice} SAR</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
