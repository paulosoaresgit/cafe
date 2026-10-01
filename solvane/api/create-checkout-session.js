const Stripe = require("stripe");

const clampText = value => String(value || "").replace(/[^a-zA-Z0-9 _.-]/g, "").slice(0, 120);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const required = ["STRIPE_SECRET_KEY", "STRIPE_PRICE_ID", "SITE_URL"];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length || process.env.STORE_READY !== "true") {
    return res.status(503).json({ error: "Checkout is not available yet." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const quantity = Math.max(1, Math.min(10, Number(req.body?.quantity) || 1));
  const utm = req.body?.utm || {};
  const metadata = { product_slug: "solvane-one" };
  for (const key of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]) {
    if (utm[key]) metadata[key] = clampText(utm[key]);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity }],
      success_url: process.env.SITE_URL.replace(/\/$/,"") + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.SITE_URL.replace(/\/$/,"") + "/cancel",
      billing_address_collection: "auto",
      shipping_address_collection: process.env.ALLOWED_COUNTRIES
        ? { allowed_countries: process.env.ALLOWED_COUNTRIES.split(",").map(v=>v.trim()).filter(Boolean) }
        : undefined,
      metadata
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err?.message || err);
    return res.status(500).json({ error: "Unable to start checkout." });
  }
};
