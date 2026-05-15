import { getStripeClient } from "../services/payments/stripeCheckout.js";
import { finalizePaidOrder } from "../services/orders/orderProcessing.js";
import { finalizeOrderFromPaymentIntentWebhook } from "../services/payments/stripePaymentIntent.js";
import { notifyOrderPaidEmail } from "../services/email/orderConfirmationEmail.js";

/**
 * Stripe webhook — must receive raw body (registered before express.json).
 */
export default async function stripeWebhookHandler(req, res) {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return res.status(503).send("Stripe webhook not configured");
  }

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId || session.client_reference_id;
      if (orderId && session.payment_status === "paid") {
        const out = await finalizePaidOrder(orderId);
        if (out.ok) {
          await notifyOrderPaidEmail(orderId);
        }
      }
    }
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const result = await finalizeOrderFromPaymentIntentWebhook(pi.id);
      if (result.ok && result.orderId) {
        await notifyOrderPaidEmail(result.orderId);
      }
    }
    return res.json({ received: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}
