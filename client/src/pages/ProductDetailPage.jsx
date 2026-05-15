import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FacilitatorNote from "../components/legal/FacilitatorNote.jsx";
import PriceAlertButton from "../components/marketplace/PriceAlertButton.jsx";
import BulkBuyCalculator from "../components/marketplace/BulkBuyCalculator.jsx";
import QuickBuyWallet from "../components/checkout/QuickBuyWallet.jsx";
import LiveActivityBadge from "../components/marketplace/LiveActivityBadge.jsx";
import LowStockUrgencyBadge from "../components/marketplace/LowStockUrgencyBadge.jsx";
import ProductWhatsAppFab from "../components/marketplace/ProductWhatsAppFab.jsx";
import ProductJsonLd from "../components/seo/ProductJsonLd.jsx";
import { productPath } from "../utils/productLink.js";
import { shouldShowFacilitatorNote } from "../utils/complianceCategory.js";
import {
  computeEstimatedFreshnessPercent,
  isGroceryFreshnessCategory,
  resolveShelfLifeHours,
} from "../utils/catalogFreshness.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [locals, setLocals] = useState([]);
  const [bulkQty, setBulkQty] = useState(1);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled) setErr(data.message || "Product not found");
          return;
        }
        if (!cancelled) setProduct(data);
      } catch {
        if (!cancelled) setErr("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!product || product.origin_type !== "global_scraped") {
      setLocals([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}/local-alternatives`);
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setLocals(Array.isArray(data.alternatives) ? data.alternatives : []);
      } catch {
        if (!cancelled) setLocals([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, product]);

  useEffect(() => {
    if (!product) return undefined;
    const prevTitle = document.title;
    const headTitle = String(product.seo?.metaTitle || product.title || "KSA Store").slice(0, 70);
    document.title = `${headTitle} | KSA Store`;

    const desc = String(
      product.seo?.metaDescription || product.description || headTitle
    ).slice(0, 170);
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", desc);

    const kws = Array.isArray(product.seo?.keywords) ? product.seo.keywords.join(", ") : "";
    let kwEl = document.querySelector('meta[name="keywords"]');
    if (kws) {
      if (!kwEl) {
        kwEl = document.createElement("meta");
        kwEl.setAttribute("name", "keywords");
        document.head.appendChild(kwEl);
      }
      kwEl.setAttribute("content", kws.slice(0, 500));
    }

    return () => {
      document.title = prevTitle;
    };
  }, [product]);

  const showLegal = product?.category && shouldShowFacilitatorNote(product.category);
  const partner = product?.source_vendor_display || "";

  const shelfH = product ? resolveShelfLifeHours(product) : null;
  const scrapedAt = product?.last_price_scraped_at || product?.updatedAt;
  const partnerStockQty = product?.automation?.partnerStockQty;
  const freshnessPct =
    product && isGroceryFreshnessCategory(product.category) && scrapedAt && shelfH
      ? computeEstimatedFreshnessPercent(scrapedAt, shelfH)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm text-neon-cyan hover:underline">
        ← Discover
      </Link>

      {loading && <p className="mt-8 text-sm text-white/50">Loading catalogue…</p>}
      {err && (
        <p className="mt-8 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
          {err}
        </p>
      )}

      {product && (
        <article className="mt-8 space-y-8">
          <ProductJsonLd product={product} />
          <header className="glass-panel-strong rounded-3xl p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Product</p>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {product.title}
            </h1>
            <LiveActivityBadge productId={product._id} />
            <LowStockUrgencyBadge qty={partnerStockQty} />
            {product.shop?.name && (
              <p className="mt-2 text-sm text-white/50">
                Offered via <span className="text-white/75">{product.shop.name}</span>
              </p>
            )}
            <p className="mt-6 text-3xl font-light text-white">
              {product.ksaPrice != null ? `${product.ksaPrice} SAR` : ""}
            </p>
            {freshnessPct != null ? (
              <p className="mt-3 text-sm text-emerald-300/90">
                Estimated freshness (grocery sync model): {freshnessPct}% — based on last catalogue
                refresh.
              </p>
            ) : null}
            {product.description ? (
              <p className="mt-6 text-sm leading-relaxed text-white/70">{product.description}</p>
            ) : null}
          </header>

          {showLegal ? <FacilitatorNote partnerLabel={partner || undefined} /> : null}

          {product.origin_type === "global_scraped" && locals.length > 0 ? (
            <section className="glass-panel rounded-3xl p-6">
              <h2 className="font-display text-lg font-semibold text-white">Local alternatives</h2>
              <p className="mt-2 text-sm text-white/50">
                Hyper-local vendor SKUs in the same aisle, priced below this global listing.
              </p>
              <ul className="mt-4 space-y-3">
                {locals.map((p) => (
                  <li key={p._id} className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link to={productPath(p)} className="text-sm text-neon-cyan hover:underline">
                      {p.title}
                    </Link>
                    <span className="text-sm font-semibold text-white/80">{p.ksaPrice} SAR</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <BulkBuyCalculator
            category={product.category}
            unitPriceSAR={product.ksaPrice}
            onPackQtyChange={setBulkQty}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <PriceAlertButton productId={product._id} />
            <QuickBuyWallet
              shopId={product.shop?._id || product.shop}
              productId={product._id}
              quantity={Math.max(1, bulkQty)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/checkout?shopId=${encodeURIComponent(product.shop?._id || "")}&productId=${encodeURIComponent(product._id)}`}
              className="inline-flex rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-violet px-6 py-3 text-sm font-bold text-charcoal-950 shadow-lg"
            >
              Proceed to checkout
            </Link>
          </div>
        </article>
      )}
      {product && <ProductWhatsAppFab productName={product.title} />}
    </div>
  );
}
