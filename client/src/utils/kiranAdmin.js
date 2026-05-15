import { USER_ROLES } from "../constants/userRoles.js";

export const KIRAN_USERNAME = "Kiran";

function normalizeRole(role) {
  const r = String(role || "");
  if (r === "grand_admin") return USER_ROLES.SUPER_ADMIN;
  if (r === "vendor_admin") return USER_ROLES.SELLER;
  if (r === "customer") return USER_ROLES.CUSTOMER;
  return r;
}

/** @param {{ role?: string; name?: string; username?: string; isKiranAdmin?: boolean } | null | undefined} user */
export function isKiranGrandAdmin(user) {
  if (!user) return false;
  if (user.isKiranAdmin === true) return true;
  if (normalizeRole(user.role) !== USER_ROLES.SUPER_ADMIN) return false;
  const username = String(user.username || "").trim();
  const name = String(user.name || "").trim();
  return (
    username.toLowerCase() === KIRAN_USERNAME.toLowerCase() || name === KIRAN_USERNAME
  );
}
