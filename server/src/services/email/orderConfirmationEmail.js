import nodemailer from "nodemailer";
import { Order } from "../../models/Order.js";

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Sends a single order-paid confirmation (idempotent via `payment.receiptEmailSentAt`).
 * @param {import("mongoose").Types.ObjectId | string} orderId
 */
export async function notifyOrderPaidEmail(orderId) {
  const order = await Order.findById(orderId).populate("customer", "email name").lean();
  if (!order || order.payment?.status !== "paid") return { sent: false, reason: "not_paid" };
  if (order.payment?.receiptEmailSentAt) return { sent: false, reason: "already_sent" };

  const to = order.customer?.email;
  if (!to) {
    console.warn("[orderConfirmationEmail] No customer email for order", String(orderId));
    return { sent: false, reason: "no_email" };
  }

  const serial = order.ksaSerialGlobal || order.orderNumber || String(order._id);
  const subtotal = Number(order.subtotal) || 0;
  const subject = `KSA Store — payment confirmed (${serial})`;
  const text = `Hi ${order.customer?.name || "customer"},

Your payment was received. Order ${serial} is now PAID.

Amount (SAR): ${subtotal.toFixed(2)}
KSA Coins earned: ${order.ksaRewards?.coinsEarned ?? "—"}

Thank you for shopping with KSA Store.
`;

  const html = `<p>Hi ${escapeHtml(order.customer?.name || "customer")},</p>
<p>Your payment was received. Order <strong>${escapeHtml(serial)}</strong> is now <strong>PAID</strong>.</p>
<p>Amount (SAR): <strong>${subtotal.toFixed(2)}</strong><br/>
KSA Coins earned: <strong>${escapeHtml(String(order.ksaRewards?.coinsEarned ?? "—"))}</strong></p>
<p>Thank you for shopping with KSA Store.</p>`;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@ksastore.local";
  const transport = buildTransporter();
  if (!transport) {
    console.log("[orderConfirmationEmail] SMTP not configured — skipping send for", to, subject);
    return { sent: false, reason: "smtp_not_configured" };
  }

  await transport.sendMail({ from, to, subject, text, html });
  await Order.updateOne({ _id: orderId }, { $set: { "payment.receiptEmailSentAt": new Date() } });
  return { sent: true, reason: "smtp" };
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
