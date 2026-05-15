import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

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
      <Footer />
    </div>
  );
}
