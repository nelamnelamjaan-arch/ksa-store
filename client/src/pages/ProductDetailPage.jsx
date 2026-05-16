import { useEffect, useState } from "react";
import SizeGuideModal from "../components/product/SizeGuideModal.jsx";
import {
  showsSizeGuide,
  hasQualityGuarantee,
  isJewelleryCategory,
  getCatalogKey,
  CATALOG_KEYS,
} from "../utils/productCategoryUi.js";
import { Link, useParams } from "react-router-dom";
import FacilitatorNote from "../components/legal/FacilitatorNote.jsx";
import PriceAlertButton from "../components/marketplace/PriceAlertButton.jsx";
import BulkBuyCalculator from "../components/marketplace/BulkBuyCalculator.jsx";
import QuickBuyWallet from "../components/checkout/QuickBuyWallet.jsx";
import LiveActivityBadge from "../components/marketplace/LiveActivityBadge.jsx";
import LowStockUrgencyBadge from "../components/marketplace/LowStockUrgencyBadge.jsx";
import ProductWhatsAppFab from "../components/marketplace/ProductWhatsAppFab.jsx";
import SourceBadge from "../components/marketplace/SourceBadge.jsx";
import ProductPriceComparison from "../components/marketplace/ProductPriceComparison.jsx";
import ProductJsonLd from "../components/seo/ProductJsonLd.jsx";
import { productPath } from "../utils/productLink.js";
import { shouldShowFacilitatorNote } from "../utils/complianceCategory.js";
import {
  computeEstimatedFreshnessPercent,
  isGroceryFreshnessCategory,
  resolveShelfLifeHours,
} from "../utils/catalogFreshness.js";
import { apiUrl } from "../utils/apiUrl.js";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [locals, setLocals] = useState([]);
  const [bulkQty, setBulkQty] = useState(1);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(apiUrl(`/api/products/${encodeURIComponent(id)}`));
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
        const res = await fetch(apiUrl(`/api/products/${encodeURIComponent(id)}/local-alternatives`));
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

    const ogTitle = String(product.seo?.ogTitle || headTitle).slice(0, 70);
    const ogDesc = String(product.seo?.ogDescription || desc).slice(0, 200);
    const ogImage =
      product.seo?.ogImageUrl || product.images?.[0] || "";
    const upsertMeta = (attr, key, content) => {
      if (!content) return;
      let node = document.querySelector(`meta[${attr}="${key}"]`);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.setAttribute("content", content);
    };
    upsertMeta("property", "og:type", "product");
    upsertMeta("property", "og:title", ogTitle);
    upsertMeta("property", "og:description", ogDesc);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", ogTitle);
    upsertMeta("name", "twitter:description", ogDesc);
    if (ogImage) upsertMeta("name", "twitter:image", ogImage);

    return () => {
      document.title = prevTitle;
    };
  }, [product]);

  const showLegal = product?.category && shouldShowFacilitatorNote(product.category);
  const partner = product?.source_vendor_display || "";
  const sizeGuide = product ? showsSizeGuide(product.category) : false;
  const sizeMode = getCatalogKey(product?.category) === CATALOG_KEYS.SHOES ? "shoes" : "fashion";
  const qualityBlock = product && hasQualityGuarantee(product.description, product.category);
  const jewellery = product && isJewelleryCategory(product.category);

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
          <header
            className={`rounded-3xl p-6 sm:p-8 ${jewellery ? "jewellery-card-vip" : "glass-panel-strong"}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Product</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(product.sourceType || product.source_platform) && (
                <SourceBadge
                  sourceType={product.sourceType}
                  sourcePlatform={product.source_platform}
                  originCountry={product.origin_country}
                />
              )}
              {product.original_price_native != null && product.original_currency ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/50 backdrop-blur-md">
                  Source price · {product.original_price_native} {product.original_currency}
                </span>
              ) : null}
            </div>
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
              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-white/70">
                {product.description}
              </p>
            ) : null}
            {qualityBlock ? (
              <div className="mt-6 rounded-2xl border border-pink-400/25 bg-pink-500/10 p-4 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-wider text-pink-200">VIP Quality Guarantee</p>
                <p className="mt-2 text-sm text-white/75">
                  100% Original & Certified. This premium product has undergone a luxury quality audit for KSA
                  Store.
                </p>
              </div>
            ) : null}
            {sizeGuide ? (
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="mt-6 rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-neon-cyan/40"
              >
                Size Guide
              </button>
            ) : null}
          </header>

          <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} mode={sizeMode} />

          {showLegal ? <FacilitatorNote partnerLabel={partner || undefined} /> : null}

          <ProductPriceComparison
            productId={product._id}
            enabled={product.priceComparisonAvailable || product.origin_type === "global_scraped"}
          />

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
