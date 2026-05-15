import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { authorize, requireSellerApproved } from "../middleware/authorize.js";
import { USER_ROLES } from "../models/User.js";
import {
  getSellerDashboard,
  listSellerProducts,
  sellerImportProduct,
} from "../controllers/sellerController.js";

const router = Router();

router.use(requireUser);
router.use(authorize(USER_ROLES.SELLER));
router.use(requireSellerApproved);

router.get("/dashboard", getSellerDashboard);
router.get("/products", listSellerProducts);
router.post("/import", sellerImportProduct);

export default router;
