import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ConciergePage from "./pages/ConciergePage.jsx";
import FamilyNeedsPage from "./pages/FamilyNeedsPage.jsx";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage.jsx";
import CheckoutCancelPage from "./pages/CheckoutCancelPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import CookieConsent from "./components/legal/CookieConsent.jsx";

const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage.jsx"));
const AdminCachePage = lazy(() => import("./pages/AdminCachePage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const AdminStripePayoutPage = lazy(() => import("./pages/AdminStripePayoutPage.jsx"));
const MagicImportPage = lazy(() => import("./pages/MagicImportPage.jsx"));

function AdminRouteSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-24 text-center text-sm text-white/45">
          Loading admin…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <CookieConsent />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="concierge" element={<ConciergePage />} />
          <Route path="family" element={<FamilyNeedsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="checkout/cancel" element={<CheckoutCancelPage />} />
          <Route path="account/orders" element={<OrdersPage />} />
          <Route
            path="admin/login"
            element={
              <AdminRouteSuspense>
                <AdminLoginPage />
              </AdminRouteSuspense>
            }
          />
          <Route
            path="admin/cache"
            element={
              <AdminRouteSuspense>
                <AdminCachePage />
              </AdminRouteSuspense>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <AdminRouteSuspense>
                <AdminDashboardPage />
              </AdminRouteSuspense>
            }
          />
          <Route
            path="admin/stripe-payout"
            element={
              <AdminRouteSuspense>
                <AdminStripePayoutPage />
              </AdminRouteSuspense>
            }
          />
          <Route
            path="admin/magic-import"
            element={
              <AdminRouteSuspense>
                <MagicImportPage />
              </AdminRouteSuspense>
            }
          />
        </Route>
      </Routes>
    </CurrencyProvider>
  );
}
