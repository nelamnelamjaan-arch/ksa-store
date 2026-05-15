import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "ksa_store_cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.1] bg-charcoal-950/85 p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-5"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="text-sm leading-relaxed text-white/75">
          KSA Store uses cookies and local storage for session security, preferences, and performance
          analytics. By continuing you agree to our{" "}
          <Link to="/privacy" className="text-neon-cyan underline-offset-2 hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className="text-neon-cyan underline-offset-2 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            onClick={accept}
            className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.1]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-5 py-2.5 text-sm font-bold text-charcoal-950 shadow-lg shadow-neon-cyan/20 transition hover:brightness-110"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
