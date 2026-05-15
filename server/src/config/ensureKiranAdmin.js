import { User, USER_ROLES } from "../models/User.js";
import { Shop } from "../models/Shop.js";
import { PlatformSettings } from "../models/PlatformSettings.js";
import { hashPassword } from "../services/auth/password.js";
import { KIRAN_USERNAME } from "../services/auth/kiranAdmin.js";

const KIRAN_EMAIL = "kiran@ksa.store";
const DEFAULT_PASSWORD = "kiran123";

/**
 * Ensures the Kiran Grand Admin account exists (idempotent).
 */
export async function ensureKiranAdmin() {
  const passwordPlain = process.env.KIRAN_ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const passwordHash = hashPassword(passwordPlain);

  let kiran = await User.findOne({
    $or: [{ username: KIRAN_USERNAME }, { email: KIRAN_EMAIL }],
  });

  if (!kiran) {
    kiran = await User.create({
      email: KIRAN_EMAIL,
      username: KIRAN_USERNAME,
      name: KIRAN_USERNAME,
      role: USER_ROLES.GRAND_ADMIN,
      passwordHash,
    });
    console.log("[KSA Store] Created Grand Admin user:", KIRAN_USERNAME);
    return kiran;
  }

  kiran.username = KIRAN_USERNAME;
  kiran.name = KIRAN_USERNAME;
  kiran.role = USER_ROLES.GRAND_ADMIN;
  kiran.passwordHash = passwordHash;
  if (!kiran.email) kiran.email = KIRAN_EMAIL;
  await kiran.save();

  let shop = await Shop.findOne({ owner: kiran._id });
  if (!shop) {
    shop = await Shop.create({
      name: "KSA Store Imports",
      slug: "ksa-store-imports",
      description: "Automated Amazon imports",
      owner: kiran._id,
    });
  }

  const settings = await PlatformSettings.getSingleton();
  if (!settings.defaultImportShopId) {
    settings.defaultImportShopId = shop._id;
    await settings.save();
  }

  return kiran;
}
