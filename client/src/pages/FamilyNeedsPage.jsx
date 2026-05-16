import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productPath } from "../utils/productLink.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiUrl } from "../utils/apiUrl.js";

const emptyMember = () => ({
  relationship: "child",
  display_name: "",
  date_of_birth: "",
  age_years: "",
});

export default function FamilyNeedsPage() {
  const { token, user, refreshMe } = useAuth();
  const [rows, setRows] = useState([emptyMember()]);
  const [recs, setRecs] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    const fm = user?.family_members;
    if (Array.isArray(fm) && fm.length) {
      setRows(
        fm.map((m) => ({
          relationship: m.relationship || "other",
          display_name: m.display_name || "",
          date_of_birth: m.date_of_birth ? String(m.date_of_birth).slice(0, 10) : "",
          age_years: m.age_years != null ? String(m.age_years) : "",
        }))
      );
    }
  }, [user]);

  const loadRecs = useCallback(async () => {
    if (!token) return;
    setMsg("");
    try {
      const res = await fetch(apiUrl("/api/auth/family-needs"), { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || "Could not load recommendations");
        return;
      }
      setRecs(data);
    } catch {
      setMsg("Network error");
    }
  }, [headers, token]);

  useEffect(() => {
    if (token) void loadRecs();
  }, [token, loadRecs]);

  async function save() {
    if (!token) {
      setMsg("Sign in to save your household.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const family_members = rows
        .map((r) => ({
          relationship: r.relationship,
          display_name: r.display_name.trim(),
          date_of_birth: r.date_of_birth || undefined,
          age_years: r.age_years === "" ? undefined : Number(r.age_years),
        }))
        .filter((r) => r.display_name || r.date_of_birth || r.age_years != null);

      const res = await fetch(apiUrl("/api/auth/me"), {
        method: "PATCH",
        headers,
        body: JSON.stringify({ family_members }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.message || "Save failed");
        return;
      }
      await refreshMe();
      setMsg("Saved.");
      await loadRecs();
    } catch {
      setMsg("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">Family Needs</h1>
      <p className="mt-2 text-sm text-white/55">
        Add household members with ages or dates of birth. We surface essentials and care picks by life
        stage (babies 0–2, seniors 60+, and everyone between).
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white">Household</h2>
          <div className="mt-4 space-y-4">
            {rows.map((r, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2">
                <label className="block text-xs text-white/50">
                  Name
                  <input
                    value={r.display_name}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, display_name: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                  />
                </label>
                <label className="block text-xs text-white/50">
                  Relationship
                  <select
                    value={r.relationship}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, relationship: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                  >
                    {["self", "spouse", "child", "parent", "grandparent", "other"].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-white/50">
                  Date of birth (optional)
                  <input
                    type="date"
                    value={r.date_of_birth}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, date_of_birth: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                  />
                </label>
                <label className="block text-xs text-white/50">
                  Age (if no DOB)
                  <input
                    type="number"
                    min={0}
                    max={125}
                    value={r.age_years}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, age_years: e.target.value } : x))
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white"
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRows((p) => [...p, emptyMember()])}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-white/80"
            >
              Add member
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-5 py-2 text-xs font-bold text-charcoal-950 disabled:opacity-40"
            >
              Save profile
            </button>
          </div>
          {msg ? <p className="mt-3 text-sm text-amber-100/90">{msg}</p> : null}
        </section>

        <section className="glass-panel rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white">Recommendations</h2>
          {!recs ? (
            <p className="mt-4 text-sm text-white/45">Loading…</p>
          ) : recs.groups?.length ? (
            <div className="mt-4 space-y-6">
              {recs.groups.map((g, idx) => (
                <div key={idx}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    {g.member_label} · {g.headline}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {(g.products || []).map((p) => (
                      <li key={p._id}>
                        <Link to={productPath(p)} className="text-sm text-neon-cyan hover:underline">
                          {p.title}
                        </Link>
                        <span className="text-sm text-white/45"> — {p.ksaPrice} SAR</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/45">
              Save at least one family member with a name and age or date of birth to see picks here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
