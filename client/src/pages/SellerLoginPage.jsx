import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SellerLoginPage() {
  const { setToken, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/seller-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || `Login failed (${res.status})`);
        return;
      }
      setToken(data.token);
      await refreshMe();
      navigate("/seller/dashboard", { replace: true });
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Home
      </Link>
      <div className="mt-8 rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.09] to-violet-500/[0.04] p-8 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <h1 className="font-display text-2xl font-bold text-white">Seller</h1>
        <p className="mt-2 text-sm text-white/55">
          Approved sellers only. Imports stay pending until Super Admin approves.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block text-xs text-white/50">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          <label className="block text-xs text-white/50">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
            />
          </label>
          {err ? <p className="text-sm text-rose-300/90">{err}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl border border-neon-violet/50 bg-gradient-to-r from-neon-violet/30 to-neon-cyan/20 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Enter seller dashboard"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-white/40">
          Super Admin?{" "}
          <Link to="/admin/login" className="text-neon-cyan hover:underline">
            Kiran login
          </Link>
        </p>
      </div>
    </div>
  );
}

