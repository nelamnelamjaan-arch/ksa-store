import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import { listMyOrders, getMyOrder } from "../controllers/ordersController.js";

const router = Router();

router.use(requireUser);
router.get("/", listMyOrders);
router.get("/:id", getMyOrder);

export default router;
