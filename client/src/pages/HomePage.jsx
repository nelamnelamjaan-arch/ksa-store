import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "../components/ui/ProductCard.jsx";

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

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);

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
              KSA Store · Private access retail
            </p>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[3.5rem] lg:leading-[1.05]">
              World&apos;s Luxury
              <br />
              <span className="text-gradient-vip">at Your Doorstep</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              A calmer, more considered marketplace — curated vendors, invisible logistics,
              and a checkout experience worthy of the Gulf&apos;s most discerning clients.
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

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
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
          {MOCK_PRODUCTS.map((p, i) => (
            <ProductCard key={p.title} {...p} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
