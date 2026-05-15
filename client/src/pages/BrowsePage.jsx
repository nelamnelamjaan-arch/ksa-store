import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HyperlocalMarketplaceSidebar from "../components/marketplace/HyperlocalMarketplaceSidebar.jsx";
import ProductCard from "../components/ui/ProductCard.jsx";
import VisualSearchPanel from "../components/search/VisualSearchPanel.jsx";
import { productPath } from "../utils/productLink.js";

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const vertical = searchParams.get("vertical") || "";
  const catalogKey = searchParams.get("catalog_key") || "";

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (vertical) p.set("vertical", vertical);
    if (catalogKey) p.set("catalog_key", catalogKey);
    p.set("limit", "48");
    const s = p.toString();
    return s ? `?${s}` : "?limit=48";
  }, [vertical, catalogKey]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products${qs}`);
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
  }, [qs]);

  const title =
    catalogKey === "fresh_produce"
      ? "Fresh Produce"
      : catalogKey === "daily_essentials"
        ? "Daily Essentials"
        : vertical === "healthcare"
          ? "Pharmacy"
          : "Browse";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 lg:flex-row lg:px-8">
      <div className="shrink-0 lg:w-64">
        <HyperlocalMarketplaceSidebar />
        <div className="mt-6">
          <VisualSearchPanel />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <Link to="/" className="text-sm text-neon-cyan hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/50">
          Prices reflect partner sites; margin: groceries +15%, pharmacy +10%, luxury +30%.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-white/45">Loading catalogue…</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, i) => (
              <Link key={p._id} to={productPath(p)} className="block">
                <ProductCard
                  title={p.title}
                  price={`${p.ksaPrice} SAR`}
                  tag={p.storeStockStatus === "in_stock" ? "In stock" : "Check stock"}
                  image={p.images?.[0]}
                  index={i}
                  lastPriceScrapedAt={p.last_price_scraped_at || p.updatedAt}
                  stockStatus={p.storeStockStatus}
                  category={p.category}
                  perishable={p.perishable}
                />
              </Link>
            ))}
          </div>
        )}

        {!loading && products.length === 0 ? (
          <p className="mt-10 text-sm text-white/45">No listings match this aisle yet.</p>
        ) : null}
      </div>
    </div>
  );
}
