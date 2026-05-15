import { USER_ROLES } from "../constants/userRoles.js";

function normalizeRole(role) {
  const r = String(role || "");
  if (r === "vendor_admin") return USER_ROLES.SELLER;
  return r;
}

/** @param {{ role?: string; isApproved?: boolean } | null | undefined} user */
export function isApprovedSeller(user) {
  return normalizeRole(user?.role) === USER_ROLES.SELLER && user?.isApproved === true;
}
