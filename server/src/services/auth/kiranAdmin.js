import { USER_ROLES } from "../../models/User.js";

export const KIRAN_USERNAME = "Kiran";

/**
 * Grand Admin dashboard + import routes are restricted to the Kiran operator account.
 * @param {{ name?: string; username?: string; role?: string } | null | undefined} user
 */
export function isKiranGrandAdmin(user) {
  if (!user || user.role !== USER_ROLES.GRAND_ADMIN) return false;
  const username = String(user.username || "").trim();
  const name = String(user.name || "").trim();
  return (
    username.toLowerCase() === KIRAN_USERNAME.toLowerCase() ||
    name === KIRAN_USERNAME
  );
}
