import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminCachePage() {
  const { token, user } = useAuth();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function clear() {
    setMsg("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || `Error ${res.status}`);
        return;
      }
      setMsg(data.message || "Cache cleared.");
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="flex flex-wrap gap-4">
        <Link to="/" className="text-sm text-neon-cyan hover:underline">
          ← Home
        </Link>
        <Link to="/admin/magic-import" className="text-sm text-neon-cyan hover:underline">
          Magic Import →
        </Link>
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Admin · Server cache</h1>
      <p className="mt-3 text-sm text-white/60">
        Clears in-memory AI listing cache on the API (Grand Admin JWT or legacy{" "}
        <code className="text-white/80">x-user-id</code>).
      </p>
      {!token && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Sign in with Google as Grand Admin to use Bearer auth, or use API tools with{" "}
          <code className="text-white/90">x-user-id</code>.
        </p>
      )}
      {user && (
        <p className="mt-4 text-xs text-white/45">
          Signed in as {user.email} ({user.role})
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={clear}
        className="mt-8 w-full rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-50"
      >
        {busy ? "Clearing…" : "Clear server AI cache"}
      </button>
      {msg && <p className="mt-4 text-sm text-white/80">{msg}</p>}
    </div>
  );
}
