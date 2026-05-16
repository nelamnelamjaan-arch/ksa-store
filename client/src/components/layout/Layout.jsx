import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

function isAdminShellPath(pathname) {
  return /^\/(admin|seller)(\/|$)/.test(pathname);
}

export default function Layout() {
  const { pathname } = useLocation();
  const adminShell = isAdminShellPath(pathname);

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-charcoal-950 ${
        adminShell ? "" : "bg-vip-glow"
      }`}
    >
      {!adminShell ? (
        <div
          className="pointer-events-none fixed inset-0 bg-vip-grid bg-[length:56px_56px] opacity-[0.85]"
          aria-hidden
        />
      ) : null}
      {!adminShell ? (
        <div
          className="pointer-events-none fixed inset-0 bg-mesh-noise opacity-40 mix-blend-soft-light"
          aria-hidden
        />
      ) : null}
      <Navbar />
      <main
        className={`relative z-10 ${adminShell ? "pb-12" : "pb-28"} ${
          adminShell ? "bg-charcoal-925/80" : ""
        }`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
