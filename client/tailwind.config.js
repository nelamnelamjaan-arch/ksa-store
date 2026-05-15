/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        charcoal: {
          950: "#050508",
          925: "#08090e",
          900: "#0c0d14",
          850: "#10121a",
          800: "#141824",
          750: "#1a1e2e",
        },
        navy: {
          950: "#030712",
          900: "#0a1628",
          850: "#0f1f3a",
          800: "#15284d",
          700: "#1c3562",
        },
        neon: {
          cyan: "#00e5ff",
          "cyan-dim": "#00b8d4",
          violet: "#a855f7",
          purple: "#c084fc",
          fuchsia: "#e879f9",
        },
      },
      backgroundImage: {
        "vip-grid":
          "linear-gradient(to bottom, rgba(5,5,8,0.4), rgba(5,5,8,0.92)), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(rgba(168,85,247,0.05) 1px, transparent 1px)",
        "vip-glow":
          "radial-gradient(ellipse 100% 80% at 50% -30%, rgba(0,229,255,0.18), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 10%, rgba(168,85,247,0.15), transparent 50%), radial-gradient(ellipse 60% 40% at 0% 30%, rgba(192,132,252,0.08), transparent 45%)",
        "mesh-noise":
          "radial-gradient(at 40% 20%, rgba(21,40,77,0.9) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(10,22,40,0.95) 0px, transparent 45%), radial-gradient(at 0% 50%, rgba(12,13,20,0.98) 0px, transparent 50%)",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.2)",
        "glass-lg":
          "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        neon: "0 0 32px rgba(0,229,255,0.25), 0 0 64px rgba(168,85,247,0.12)",
        "neon-strong":
          "0 0 40px rgba(0,229,255,0.45), 0 0 80px rgba(168,85,247,0.2), 0 0 120px rgba(232,121,249,0.08)",
      },
      animation: {
        "pulse-slow": "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        vip: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
