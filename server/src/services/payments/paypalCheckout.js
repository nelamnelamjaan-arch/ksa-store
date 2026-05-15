import axios from "axios";

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    const err = new Error("PayPal is not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)");
    err.status = 503;
    throw err;
  }
  return { clientId, secret };
}

async function getAccessToken() {
  const { clientId, secret } = getCredentials();
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15_000,
    }
  );
  return res.data.access_token;
}

/**
 * Create PayPal order for Smart Buttons.
 * @param {{ orderId: string; amount: string; currency: string; description?: string }} input
 */
export async function createPayPalOrderForCheckout(input) {
  const token = await getAccessToken();
  const currency = String(input.currency || "USD").toUpperCase();
  const value = Number(input.amount);
  if (!Number.isFinite(value) || value <= 0) {
    const err = new Error("Invalid PayPal amount");
    err.status = 400;
    throw err;
  }

  const res = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(input.orderId),
          description: String(input.description || "KSA Store order").slice(0, 120),
          amount: {
            currency_code: currency,
            value: value.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "KSA Store",
        user_action: "PAY_NOW",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    }
  );

  return {
    paypalOrderId: res.data.id,
    status: res.data.status,
  };
}

/**
 * Capture approved PayPal order.
 * @param {string} paypalOrderId
 */
export async function capturePayPalOrder(paypalOrderId) {
  const token = await getAccessToken();
  const res = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 20_000,
    }
  );

  const capture = res.data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: res.data.status,
    captureId: capture?.id || "",
  };
}

export function getPayPalClientId() {
  return process.env.PAYPAL_CLIENT_ID || "";
}
