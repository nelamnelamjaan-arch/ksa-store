import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { productPath } from "../../utils/productLink.js";
import { useStorefront } from "../../context/StorefrontContext.jsx";
import { geoFetch } from "../../utils/geoFetch.js";

const STOCK_REEL_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-wearing-a-dress-in-a-clothing-store-39874-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-in-front-of-a-mirror-3980-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-smart-watch-with-a-black-strap-40316-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-person-holding-a-smartphone-with-a-green-screen-34530-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-neon-lit-room-4028-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-cup-of-coffee-1259-large.mp4",
];

const FALLBACK_REELS = [
  {
    _id: "reel-1",
    title: "Silk evening drape — European atelier",
    ksaPrice: 1249,
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&w=800&q=80",
    ],
  },
  {
    _id: "reel-2",
    title: "Swiss chronograph — midnight ceramic",
    ksaPrice: 3890,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&w=800&q=80",
    ],
  },
  {
    _id: "reel-3",
    title: "Korean beauty serum — glass skin ritual",
    ksaPrice: 649,
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&w=800&q=80",
    ],
  },
  {
    _id: "reel-4",
    title: "Architectural sound — wireless sculpture",
    ksaPrice: 2100,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=800&q=80",
    ],
  },
];

const SWIPE_THRESHOLD = 64;

function mapProductToReel(product, index, formatMoney) {
  const price =
    typeof formatMoney === "function" && product.ksaPrice != null
      ? formatMoney(product.ksaPrice)
      : product.ksaPrice != null
        ? `${product.ksaPrice} SAR`
        : "";
  const generated = product.videoUrl && String(product.videoUrl).startsWith("https://");
  return {
    id: product._id || `reel-${index}`,
    title: product.title || "Featured product",
    price,
    videoUrl: generated
      ? product.videoUrl
      : STOCK_REEL_VIDEOS[index % STOCK_REEL_VIDEOS.length],
    poster: product.images?.[0] || "",
    href: productPath(product),
  };
}

function ReelSlide({ reel, isActive, reduceMotion, onSwipe }) {
  const videoRef = useRef(null);
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      const play = el.play();
      if (play?.catch) play.catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive]);

  return (
    <motion.article
      className="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden bg-charcoal-950"
      drag={reduceMotion ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.14}
      onDragEnd={(_e, info) => onSwipe?.(info)}
      initial={false}
      animate={
        isActive
          ? { scale: 1, filter: "brightness(1)" }
          : { scale: 0.98, filter: "brightness(0.85)" }
      }
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {videoOk && reel.videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={reel.videoUrl}
          poster={reel.poster || undefined}
          muted
          loop
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onError={() => setVideoOk(false)}
        />
      ) : (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${reel.poster})` }}
          animate={isActive && !reduceMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal-950/55 via-transparent to-charcoal-950/95"
        animate={{ opacity: isActive ? 1 : 0.75 }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 p-4 pb-6 sm:p-5"
        initial={false}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.9, y: 6 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
      >
        <div className="glass-panel-strong rounded-2xl border border-white/[0.14] p-4 shadow-glass-lg backdrop-blur-[28px]">
          <motion.div className="flex items-start gap-3">
            {reel.poster ? (
              <img
                src={reel.poster}
                alt={reel.title}
                className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neon-cyan/90">
                Shoppable reel
              </p>
              <h3 className="mt-1 line-clamp-2 font-display text-base font-semibold leading-snug text-white">
                {reel.title}
              </h3>
              {reel.price ? (
                <p className="mt-1 font-mono text-sm text-neon-cyan">{reel.price}</p>
              ) : null}
            </div>
          </motion.div>

          <motion.div
            className="mt-4"
            initial={isActive ? { opacity: 0, y: 12 } : false}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, type: "spring", stiffness: 420, damping: 26 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={reel.href}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet py-3.5 text-sm font-bold uppercase tracking-wider text-charcoal-950 shadow-[0_0_28px_rgba(0,229,255,0.35)]"
              >
                Buy now
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.article>
  );
}

export default function ShoppableReels({ className = "" }) {
  const reduceMotion = useReducedMotion();
  const { format: formatMoney, country } = useStorefront();
  const [reels, setReels] = useState(() =>
    FALLBACK_REELS.map((p, i) => mapProductToReel(p, i, null))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const slideRefs = useRef([]);

  useEffect(() => {
    geoFetch("/api/products/featured?limit=10")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (Array.isArray(rows) && rows.length > 0) {
          setReels(rows.map((p, i) => mapProductToReel(p, i, formatMoney)));
        }
      })
      .catch(() => {});
  }, [formatMoney]);

  const goTo = useCallback(
    (next) => {
      setActiveIndex(() => {
        const clamped = Math.max(0, Math.min(reels.length - 1, next));
        const el = slideRefs.current[clamped];
        if (el) {
          el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
        return clamped;
      });
    },
    [reels.length, reduceMotion]
  );

  const handleSwipe = useCallback(
    (info) => {
      if (info.offset.y < -SWIPE_THRESHOLD || info.velocity.y < -350) {
        goTo(activeIndex + 1);
      } else if (info.offset.y > SWIPE_THRESHOLD || info.velocity.y > 350) {
        goTo(activeIndex - 1);
      }
    },
    [activeIndex, goTo]
  );

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          const idx = Number(entry.target.dataset.index);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      { root, threshold: [0.6, 0.85] }
    );

    slideRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [reels.length]);

  if (!reels.length) return null;

  return (
    <section
      className={`relative z-10 border-b border-white/[0.06] bg-charcoal-950 py-16 sm:py-20 ${className}`}
      aria-label="Shoppable reels"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 text-center sm:mb-10"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan/90">
            Shop while you scroll
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            Shoppable <span className="text-gradient-vip">reels</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/50">
            Swipe up for the next drop — glass overlay, one-tap checkout on every clip.
          </p>
        </motion.div>

        <motion.div
          className="relative mx-auto w-full max-w-[420px]"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? false : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-4 rounded-[2.25rem] bg-gradient-to-b from-neon-cyan/25 via-transparent to-neon-violet/20 blur-2xl"
            animate={reduceMotion ? false : { opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <motion.div
            className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.12] bg-charcoal-900/90 p-1.5 shadow-glass-lg"
            whileHover={reduceMotion ? {} : { y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <div
              ref={scrollRef}
              className="reels-scroll relative h-[min(85vh,640px)] snap-y snap-mandatory overflow-y-auto overflow-x-hidden rounded-[1.35rem] bg-black"
            >
              {reels.map((reel, i) => (
                <div
                  key={reel.id}
                  ref={(el) => {
                    slideRefs.current[i] = el;
                  }}
                  data-index={i}
                  className="h-[min(85vh,640px)] snap-start snap-always"
                >
                  <ReelSlide
                    reel={reel}
                    isActive={i === activeIndex}
                    reduceMotion={reduceMotion}
                    onSwipe={handleSwipe}
                  />
                </div>
              ))}
            </div>

            <div
              className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2"
              aria-hidden={reels.length <= 1}
            >
              {reels.map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  aria-label={`Reel ${i + 1} of ${reels.length}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="rounded-full p-1.5"
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span
                    className={`block rounded-full transition-all ${
                      i === activeIndex
                        ? "h-5 w-1.5 bg-neon-cyan shadow-[0_0_10px_#00e5ff]"
                        : "h-1.5 w-1.5 bg-white/30"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.p
            className="mt-4 text-center text-[11px] font-medium uppercase tracking-[0.25em] text-white/35"
            animate={reduceMotion ? false : { opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            Swipe ↑ or scroll
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
