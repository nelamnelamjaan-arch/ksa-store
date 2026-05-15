import { Link, useSearchParams } from "react-router-dom";

export default function CheckoutCancelPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-white">Checkout cancelled</h1>
      <p className="mt-3 text-sm text-white/60">
        No charge was completed. You may return to checkout when ready.
        {orderId ? (
          <>
            {" "}
            Draft order: <span className="font-mono text-white/50">{orderId}</span>
          </>
        ) : null}
      </p>
      <Link to="/checkout" className="mt-8 inline-block text-sm text-neon-cyan hover:underline">
        Back to checkout →
      </Link>
    </div>
  );
}
