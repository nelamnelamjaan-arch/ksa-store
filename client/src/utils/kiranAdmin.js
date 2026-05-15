import { USER_ROLES } from "../constants/userRoles.js";

export const KIRAN_USERNAME = "Kiran";

/** @param {{ role?: string; name?: string; username?: string; isKiranAdmin?: boolean } | null | undefined} user */
export function isKiranGrandAdmin(user) {
  if (!user) return false;
  if (user.isKiranAdmin === true) return true;
  if (user.role !== USER_ROLES.GRAND_ADMIN) return false;
  const username = String(user.username || "").trim();
  const name = String(user.name || "").trim();
  return (
    username.toLowerCase() === KIRAN_USERNAME.toLowerCase() || name === KIRAN_USERNAME
  );
}
