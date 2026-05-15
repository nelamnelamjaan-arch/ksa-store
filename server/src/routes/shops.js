import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { Shop } from "../models/Shop.js";
import { USER_ROLES } from "../models/User.js";

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const router = Router();

router.post("/", requireUser, async (req, res, next) => {
  try {
    if (req.user.role !== USER_ROLES.VENDOR_ADMIN) {
      return res.status(403).json({ message: "Only vendors can open a shop" });
    }

    const existing = await Shop.findOne({ owner: req.user._id }).lean();
    if (existing) {
      return res.status(409).json({ message: "You already have a shop", shop: existing });
    }

    const { name, description = "" } = req.body ?? {};
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const baseSlug = req.body?.slug ? slugify(req.body.slug) : slugify(name);
    if (!baseSlug) {
      return res.status(400).json({ message: "Could not derive slug" });
    }

    let slug = baseSlug;
    let suffix = 0;
    while (await Shop.findOne({ slug }).lean()) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const shop = await Shop.create({
      name: String(name).trim(),
      slug,
      description: String(description).trim(),
      owner: req.user._id,
    });

    res.status(201).json(shop.toObject());
  } catch (err) {
    next(err);
  }
});

router.get("/mine", requireUser, async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id }).lean();
    if (!shop) return res.status(404).json({ message: "No shop found" });
    res.json(shop);
  } catch (err) {
    next(err);
  }
});

export default router;
