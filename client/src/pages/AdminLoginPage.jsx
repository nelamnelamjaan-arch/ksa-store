import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLoginPage() {
  const { setToken, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Kiran");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
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
      navigate("/admin/dashboard", { replace: true });
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
      <div className="glass-panel-strong mt-8 rounded-3xl p-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-cyan/90">
          Grand Admin
        </p>
        <h1 className="mt-2 text-center font-display text-2xl font-bold text-white">Super Admin</h1>
        <p className="mt-2 text-center text-sm text-white/55">
          Username <span className="text-white/80">Kiran</span> · frosted glass control centre
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
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3 text-sm font-bold text-charcoal-950 shadow-lg disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {err ? (
          <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
            {err}
          </p>
        ) : null}
      </div>
    </div>
  );
}
