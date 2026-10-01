# SOLVANE storefront

Independent white-label coffee storefront built directly in GitHub. It does not reuse the old Keurig/Staples page structure, copy, logos or branded assets.

## Local structure

- `index.html` – application shell
- `styles.css` – storefront design system
- `config.js` – public product/business configuration
- `app.js` – routing, cart and frontend interactions
- `api/create-checkout-session.js` – Stripe Checkout session creation
- `api/stripe-webhook.js` – Stripe webhook verification
- `vercel.json` – clean routes / SPA rewrites

## Before checkout can go live

Fill verified public data in `config.js`, then set matching server-side environment variables in the hosting provider:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `SITE_URL`
- `STORE_READY=true`
- optional `ALLOWED_COUNTRIES=US`

The frontend intentionally ships with checkout disabled. Do not set `STORE_READY=true` until price, inventory, legal seller identity, support, shipping and return information are accurate.

## Product photography

Current imagery is licensed lifestyle photography used only as a staging presentation. Replace it with verified, licensed photography of the actual private-label product before launch.
