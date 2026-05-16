import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { StorefrontProvider } from "./context/StorefrontContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import TrackOrderPage from "./pages/TrackOrderPage.jsx";
import CarrierTrackPage from "./pages/CarrierTrackPage.jsx";
import RefundPolicyPage from "./pages/RefundPolicyPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BrowsePage from "./pages/BrowsePage.jsx";
import GourmetPage from "./pages/GourmetPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PayPalCheckoutPage from "./pages/PayPalCheckoutPage.jsx";
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
const SellerLoginPage = lazy(() => import("./pages/SellerLoginPage.jsx"));
const SellerDashboardPage = lazy(() => import("./pages/SellerDashboardPage.jsx"));
const SellerShopPage = lazy(() => import("./pages/SellerShopPage.jsx"));

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
    <StorefrontProvider>
      <CookieConsent />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="track" element={<CarrierTrackPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="track-order/:id" element={<TrackOrderPage />} />
          <Route path="refund-policy" element={<RefundPolicyPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="browse" element={<BrowsePage />} />
          <Route path="gourmet" element={<GourmetPage />} />
          <Route path="concierge" element={<ConciergePage />} />
          <Route path="family" element={<FamilyNeedsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/paypal" element={<PayPalCheckoutPage />} />
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
          <Route
            path="seller/login"
            element={
              <AdminRouteSuspense>
                <SellerLoginPage />
              </AdminRouteSuspense>
            }
          />
          <Route
            path="seller/dashboard"
            element={
              <AdminRouteSuspense>
                <SellerDashboardPage />
              </AdminRouteSuspense>
            }
          />
          <Route path="shops/:slug" element={<SellerShopPage />} />
        </Route>
      </Routes>
    </StorefrontProvider>
  );
}
