import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "../components/ui/ProductCard.jsx";
import CategoryNavBar from "../components/layout/CategoryNavBar.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import { geoFetch } from "../utils/geoFetch.js";
import ShoppableReels from "../components/reels/ShoppableReels.jsx";

/** High-margin featured verticals — homepage spotlight */
const PROFIT_FEATURED = [
  {
    id: "desk",
    title: "Aesthetic desk setups",
    margin: "~40% margin",
    blurb: "RGB lighting, glass mousepads, and premium workspace accents.",
    browse: "/browse?q=desk+setup",
    image:
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&w=800&q=80",
  },
  {
    id: "wearables",
    title: "Smart wearables",
    margin: "High search volume",
    blurb: "Global-edition watches — Pakistan & Middle East demand.",
    browse: "/browse?q=smart+watch",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=800&q=80",
  },
  {
    id: "skincare",
    title: "Imported skin care",
    margin: "Premium daily needs",
    blurb: "Korean beauty & K-beauty routines with luxury positioning.",
    browse: "/browse?q=korean+beauty",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&w=800&q=80",
  },
];

const HERO_POSTER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&w=1920&q=85";
const HERO_VIDEO =
  "https://assets.mixkit.co/videos/preview/mixkit-hallway-of-an-elegant-empty-building-with-chandeliers-4048-large.mp4";

const MOCK_PRODUCTS = [
  {
    title: "European Atelier — Silk evening drape",
    price: "1,249 SAR",
    tag: "Featured",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=800&q=80",
  },
  {
    title: "Swiss chronograph — midnight ceramic",
    price: "3,890 SAR",
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=800&q=80",
  },
  {
    title: "Private reserve — oud & amber parfum",
    price: "649 SAR",
    tag: "Limited",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&w=800&q=80",
  },
  {
    title: "Architectural sound — wireless sculpture",
    price: "2,100 SAR",
    tag: "Tech",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=800&q=80",
  },
];

function mapApiProduct(p, formatMoney) {
  const price =
    typeof formatMoney === "function" && p.ksaPrice != null
      ? formatMoney(p.ksaPrice)
      : p.ksaPrice != null
        ? `${p.ksaPrice} SAR`
        : "";
  return {
    _id: p._id,
    title: p.title,
    price,
    tag: "Featured",
    image: p.images?.[0] || "",
    lastPriceScrapedAt: p.last_price_scraped_at,
    stockStatus: p.storeStockStatus,
    category: p.category,
    sourceType: p.sourceType,
    sourcePlatform: p.source_platform,
    originCountry: p.origin_country,
    priceComparisonAvailable: p.priceComparisonAvailable,
  };
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const { format: formatMoney, hero, country } = useStorefront();
  const [videoFailed, setVideoFailed] = useState(false);
  const [featured, setFeatured] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    geoFetch("/api/products/featured?limit=8")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setFeatured(rows.map((p) => mapApiProduct(p, formatMoney)));
        }
      })
      .catch(() => {});
  }, [formatMoney, country]);

  return (
    <>
      <section className="relative -mt-[1px] min-h-[min(92vh,900px)] overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-charcoal-950">
          {!videoFailed && !reduceMotion && (
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-90"
              autoPlay
              muted
              loop
              playsInline
              poster={HERO_POSTER}
              onError={() => setVideoFailed(true)}
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
          )}
          {(videoFailed || reduceMotion) && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${HERO_POSTER})` }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-charcoal-950/75 to-charcoal-950" />
          <div className="absolute inset-0 bg-vip-glow opacity-90" aria-hidden />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.06)_0%,_transparent_55%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[min(92vh,900px)] max-w-5xl flex-col justify-center px-4 pb-24 pt-28 text-center sm:px-6 lg:px-8 lg:pt-32">
          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                })}
          >
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/55 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan shadow-[0_0_14px_#00e5ff]" />
              {hero?.badge || "KSA Store · Private access retail"}
            </p>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.05]">
              {hero?.title || "World's Luxury"}
              <br />
              <span className="text-gradient-vip">{hero?.titleAccent || "at Your Doorstep"}</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {hero?.subtitle ||
                "A calmer, more considered marketplace — curated vendors, invisible logistics, and a checkout experience worthy of the Gulf's most discerning clients."}
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.06] px-5 py-4 text-sm text-white/55 shadow-glass backdrop-blur-xl">
              Use the <span className="font-semibold text-white/80">global search</span> in the
              navigation bar to explore products, brands, and categories across every connected
              storefront.
            </div>
          </motion.div>
        </div>
      </section>

      <ShoppableReels />

      <motion.section
        className="relative z-10 border-b border-white/[0.06] bg-charcoal-925/80 py-16 backdrop-blur-sm"
        initial={reduceMotion ? false : { opacity: 0 }}
        whileInView={reduceMotion ? false : { opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              t: "Ghost fulfilment",
              d: "Source links and delivery intelligence stay in a vault for Grand Admin only.",
            },
            {
              t: "Triple revenue",
              d: "Markup, vendor commission, and featured placements — orchestrated in one ledger.",
            },
            {
              t: "Global polish",
              d: "Multi-country storefront with VIP glass UI — built to outshine mass-market bazaars.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel rounded-2xl p-6 text-left"
            >
              <div className="mb-3 h-px w-10 bg-gradient-to-r from-neon-cyan to-neon-violet opacity-80" />
              <h3 className="font-display text-lg font-semibold text-white">{item.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{item.d}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="relative z-10 mx-auto max-w-7xl border-b border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="mb-10 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-violet/90">
            Highest earning categories
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
            Featured for <span className="text-gradient-vip">maximum profit</span>
          </h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-3">
          {PROFIT_FEATURED.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                to={cat.browse}
                className="group glass-panel block overflow-hidden rounded-2xl transition hover:-translate-y-1"
              >
                <motion.div
                  className="aspect-[4/3] overflow-hidden bg-charcoal-900"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
                    loading="lazy"
                  />
                </motion.div>
                <motion.div
                  className="p-5"
                  initial={false}
                  whileHover={{ x: 2 }}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-cyan">
                    {cat.margin}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-white">{cat.title}</h3>
                  <p className="mt-2 text-sm text-white/50">{cat.blurb}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <CategoryNavBar />
        <motion.div
          className="mb-12 mt-10 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">
            Curated this week
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Top featured <span className="text-gradient-vip">selection</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50">
            Glass cards with instant checkout — hover to reveal Quick Buy. Inventory syncs from
            trusted global sources.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p._id || p.title} {...p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
