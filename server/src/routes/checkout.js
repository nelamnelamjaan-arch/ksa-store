import { Router } from "express";
import { requireUser } from "../middleware/auth.js";
import {
  checkoutStripe,
  checkoutCrypto,
  checkoutStripeIntent,
  postStripePaymentIntent,
} from "../controllers/checkoutController.js";

const router = Router();

router.post("/stripe", requireUser, checkoutStripe);
router.post("/stripe-intent", requireUser, checkoutStripeIntent);
router.post("/stripe/payment-intent", requireUser, postStripePaymentIntent);
router.post("/crypto", requireUser, checkoutCrypto);

export default router;
