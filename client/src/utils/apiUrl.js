/**
 * API base for fetch/socket.
 * - Unset `VITE_API_URL`: relative `/api/...` (Vite dev proxy; Vercel client rewrites in prod).
 * - Set `VITE_API_URL`: direct calls to that origin (no trailing slash), e.g.
 *   `https://ksa-store-server-67sq.vercel.app` — server must allow this client in `CLIENT_ORIGIN`.
 */
export function getApiOrigin() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw == null || String(raw).trim() === "") return "";
  return String(raw).replace(/\/+$/, "");
}

export function apiUrl(path) {
  const rel = path.startsWith("/") ? path : `/${path}`;
  const base = getApiOrigin();
  return base ? `${base}${rel}` : rel;
}

/**
 * Socket.io (magic import, etc.). Override with `VITE_SOCKET_URL`; otherwise uses
 * `VITE_API_URL`, then the current page origin (Vite dev proxy).
 */
export function getSocketRoot() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit != null && String(explicit).trim() !== "") {
    return String(explicit).replace(/\/+$/, "");
  }
  const api = getApiOrigin();
  if (api) return api;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "";
}
