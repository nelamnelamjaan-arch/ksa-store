import { useState } from "react";
import { Link } from "react-router-dom";
import PayPalButton from "../components/checkout/PayPalButton.jsx";

/** Standalone PayPal Live checkout demo — SDK v6 */
export default function PayPalCheckoutPage() {
  const [amount, setAmount] = useState(100);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <Link to="/checkout" className="text-sm text-neon-cyan hover:underline">
        ← Checkout
      </Link>

      <div className="glass-panel-strong mt-8 rounded-3xl p-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-neon-cyan/90">
          PayPal Live
        </p>
        <h1 className="mt-2 text-center font-display text-2xl font-bold text-white">
          Pay with <span className="text-gradient-vip">PayPal</span>
        </h1>
        <p className="mt-3 text-center text-sm text-white/50">
          SDK v6 · USD · gold rectangle buttons · card enabled
        </p>

        <label className="mt-8 block text-xs font-medium uppercase tracking-wider text-white/45">
          Amount (USD)
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 100)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-neon-cyan/30"
          />
        </label>

        <div className="mt-8 flex justify-center">
          <PayPalButton amount={amount} currency="USD" />
        </div>
      </div>
    </div>
  );
}
