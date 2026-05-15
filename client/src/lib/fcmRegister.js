import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

function firebaseConfigFromEnv() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  };
}

function swUrlWithConfig(cfg) {
  const p = new URLSearchParams();
  Object.entries(cfg).forEach(([k, v]) => {
    if (v) p.set(k, String(v));
  });
  return `/firebase-messaging-sw.js?${p.toString()}`;
}

/**
 * @returns {Promise<string | null>}
 */
export async function getFcmDeviceToken() {
  const cfg = firebaseConfigFromEnv();
  if (!cfg.apiKey || !cfg.projectId) return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  const messaging = getMessaging(app);
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
  if (!vapidKey) return null;

  const reg = await navigator.serviceWorker.register(swUrlWithConfig(cfg), {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  return await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
}
