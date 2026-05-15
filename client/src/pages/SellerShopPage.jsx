import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function SellerShopPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/shops/${encodeURIComponent(slug || "")}`);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(json.message || "Shop not found");
          return;
        }
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setErr("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-white/45">Loading shop…</div>
    );
  }

  if (err || !data?.shop) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-sm text-rose-200/90">{err || "Shop not found"}</p>
        <Link to="/browse" className="mt-4 inline-block text-sm text-neon-cyan hover:underline">
          Browse marketplace
        </Link>
      </div>
    );
  }

  const { shop, seller, products } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link to="/browse" className="text-sm text-neon-cyan hover:underline">
        ← Marketplace
      </Link>

      <header className="mt-6 rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.1] to-violet-500/[0.05] p-8 backdrop-blur-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-cyan/80">VIP Seller</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{shop.name}</h1>
        {seller?.name ? <p className="mt-2 text-sm text-white/50">Curated by {seller.name}</p> : null}
        {shop.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{shop.description}</p>
        ) : null}
      </header>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">Collection</h2>
        {products?.length ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/products/${p.slug || p._id}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md transition hover:border-neon-cyan/40"
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="aspect-square bg-white/[0.04]" />
                  )}
                  <div className="p-4">
                    <p className="line-clamp-2 font-medium text-white">{p.title}</p>
                    <p className="mt-2 font-mono text-sm text-neon-cyan">
                      {Number(p.ksaPrice).toFixed(2)} SAR
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-white/40">No approved products yet.</p>
        )}
      </section>
    </div>
  );
}
