import { useMemo } from "react";

function availabilityUrl(status) {
  const s = String(status || "").toLowerCase();
  if (s === "out_of_stock") return "https://schema.org/OutOfStock";
  if (s === "in_stock") return "https://schema.org/InStock";
  return "https://schema.org/InStock";
}

/**
 * Injects Schema.org Product JSON-LD for Google rich results (price, availability, etc.).
 */
export default function ProductJsonLd({ product }) {
  const jsonLd = useMemo(() => {
    if (!product?._id) return null;
    const site =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_PUBLIC_SITE_URL) ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const slug = product.slug && String(product.slug).trim();
    const pathSeg = slug ? encodeURIComponent(slug) : String(product._id);
    const url = `${String(site).replace(/\/$/, "")}/products/${pathSeg}`;
    const img = Array.isArray(product.images) ? product.images.filter(Boolean).slice(0, 8) : [];
    const price = Number(product.ksaPrice);
    const name = String(product.seo?.metaTitle || product.title || "Product").slice(0, 110);
    const desc = String(product.seo?.metaDescription || product.description || name).slice(0, 500);

    const offers = {
      "@type": "Offer",
      url,
      priceCurrency: "SAR",
      availability: availabilityUrl(product.storeStockStatus),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: product.shop?.name || "KSA Store Partner",
      },
    };
    if (Number.isFinite(price) && price > 0) {
      offers.price = price.toFixed(2);
    }

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description: desc,
      sku: String(product._id),
      url,
      image: img.length ? img : undefined,
      brand: {
        "@type": "Brand",
        name: "KSA Store",
      },
      offers,
    };
  }, [product]);

  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
