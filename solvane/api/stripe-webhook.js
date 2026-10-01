const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return res.status(503).send("Webhook not configured");

  const stripe = new Stripe(secret);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err?.message || err);
    return res.status(400).send("Invalid signature");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("checkout.session.completed", session.id, session.payment_status);
    // Connect Supabase/order fulfillment here before production launch.
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    console.log("payment_intent.payment_failed", intent.id);
  }

  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
