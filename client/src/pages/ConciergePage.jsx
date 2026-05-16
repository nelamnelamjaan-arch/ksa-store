import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productPath } from "../utils/productLink.js";
import { useAuth } from "../context/AuthContext.jsx";
import { apiUrl } from "../utils/apiUrl.js";

export default function ConciergePage() {
  const { token, user } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    if (!token || !user) {
      setErr("Please sign in to use the AI concierge.");
      return;
    }
    setErr("");
    const nextMsgs = [...messages, { role: "user", content: text }];
    setMessages(nextMsgs);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/concierge/chat"), {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: nextMsgs }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.message || `Request failed (${res.status})`);
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.assistant_message || "",
          meta: {
            bundle_title: data.bundle_title,
            follow_up: data.follow_up_question,
            hints: data.product_hints,
          },
        },
      ]);
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }, [headers, input, messages, token, user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Home
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold text-white">AI Shopping Concierge</h1>
      <p className="mt-2 text-sm text-white/55">
        One conversation for pharmacy, grocery, and electronics — powered by Gemini when configured on
        the server.
      </p>

      <div className="mt-8 space-y-4 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl">
        {messages.length === 0 ? (
          <p className="text-sm text-white/45">
            Try: “I need electrolytes, rice for the week, and wireless earbuds under 400 SAR.”
          </p>
        ) : (
          <ul className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <li
                key={`${i}-${m.role}`}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-8 bg-neon-cyan/15 text-white"
                    : "mr-8 border border-white/10 bg-charcoal-900/60 text-white/85"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.meta?.bundle_title ? (
                  <p className="mt-2 text-xs font-semibold text-neon-cyan/90">{m.meta.bundle_title}</p>
                ) : null}
                {m.meta?.follow_up ? (
                  <p className="mt-2 text-xs text-white/50">Follow-up: {m.meta.follow_up}</p>
                ) : null}
                {m.meta?.hints ? (
                  <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs text-white/55">
                    {["healthcare", "essentials", "luxury_electronics"].map((k) => {
                      const rows = m.meta.hints[k] || [];
                      if (!rows.length) return null;
                      return (
                        <div key={k}>
                          <p className="font-semibold uppercase tracking-wider text-white/40">{k}</p>
                          <ul className="mt-1 list-inside list-disc">
                            {rows.map((p) => (
                              <li key={p._id}>
                                <Link to={productPath(p)} className="text-neon-cyan hover:underline">
                                  {p.title}
                                </Link>{" "}
                                · {p.ksaPrice} SAR
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {err ? (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100/90">
            {err}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Describe your mixed basket…"
            className="min-h-[72px] flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35"
          />
          <button
            type="button"
            disabled={busy}
            onClick={send}
            className="h-11 shrink-0 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet px-6 text-sm font-bold text-charcoal-950 disabled:opacity-40"
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
