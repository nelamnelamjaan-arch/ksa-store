import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ui/ProductCard.jsx";
import { productPath } from "../utils/productLink.js";

export default function GourmetPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/products?vertical=gourmet_food&limit=48");
        const data = await res.json().catch(() => []);
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-charcoal-950 to-amber-950/20"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8">
        <Link to="/" className="text-sm text-emerald-300/90 hover:underline">
          ← Home
        </Link>

        <header className="mt-8 border-b border-emerald-400/20 pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300/80">VIP Collection</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-transparent bg-gradient-to-r from-emerald-200 via-emerald-400 to-amber-200 bg-clip-text">
            Gourmet Food & Essentials
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
            Artisan, hand-picked, and exquisite — sourced via Rainforest (Amazon Fresh) and partner
            grocers. Local Express delivery keeps every order fresh. Prices include our 30% VIP margin.
          </p>
        </header>

        {loading ? (
          <p className="mt-12 text-sm text-emerald-200/50">Curating the gourmet aisle…</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Link key={p._id} to={productPath(p)} className="block">
                <ProductCard
                  title={p.title}
                  price={`${p.ksaPrice} SAR`}
                  tag={p.deliveryType === "Local Express" ? "Local Express" : "In stock"}
                  image={p.images?.[0]}
                  index={i}
                  lastPriceScrapedAt={p.last_price_scraped_at || p.updatedAt}
                  stockStatus={p.storeStockStatus}
                  category={p.category}
                  perishable={p.isPerishable ?? p.perishable}
                  vipGourmetBadge={p.vipGourmetBadge}
                  gourmetTheme
                />
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-emerald-400/20 bg-white/5 p-6 text-sm text-white/50 backdrop-blur-lg">
            No gourmet listings yet. Import food items from Amazon Fresh or Walmart Grocery via Magic
            Import.
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
