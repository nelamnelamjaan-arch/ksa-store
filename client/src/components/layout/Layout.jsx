import { Outlet, Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-charcoal-950 bg-vip-glow">
      <div
        className="pointer-events-none fixed inset-0 bg-vip-grid bg-[length:56px_56px] opacity-[0.85]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-mesh-noise opacity-40 mix-blend-soft-light"
        aria-hidden
      />
      <Navbar />
      <main className="relative z-10 pb-28">
        <Outlet />
      </main>
      <footer className="relative z-10 border-t border-white/[0.07] bg-charcoal-950/80 py-10 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/35">KSA Store</p>
            <p className="mt-2 text-sm text-white/45">
              © {new Date().getFullYear()} · World&apos;s luxury at your doorstep
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wider text-white/45">
            <Link to="/about" className="transition hover:text-neon-cyan">
              About
            </Link>
            <Link to="/privacy" className="transition hover:text-neon-cyan">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-neon-cyan">
              Terms
            </Link>
            <Link to="/admin/cache" className="transition hover:text-neon-cyan">
              Admin cache
            </Link>
            <a
              href="mailto:nelamnelamjaan@gmail.com"
              className="transition hover:text-neon-cyan"
            >
              Support
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
