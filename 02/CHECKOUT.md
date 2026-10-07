# SMEG checkout

`/02/checkout.html` uses the collection's images, Inter typography, black rounded CTA, colour selection and quantity limit of 12. Both purchase buttons on `/02` carry the chosen colour and quantity into this checkout.

The production flow is already usable without API keys: Stripe Payment Links in the VeraVita live account accept one-time GBP payments of £119 per collection, collect UK delivery details and telephone number, and display the exact selected colour and quantity. `checkout-catalog.json` maps all six variants and quantities 1–12 to fixed Stripe prices and payment links. Changing browser totals cannot change Stripe's charge. Stripe displays the payment result on its own confirmation page. These links do not create subscriptions.

## Embedded checkout activation

The existing Node server also supports Stripe's embedded Checkout page. Install dependencies with `npm ci` and configure these values privately in the hosting platform's secrets settings, never in GitHub or browser code:

| Setting | Required value |
| --- | --- |
| `STRIPE_SECRET_KEY` | Restricted live API key for the VeraVita account; Checkout Sessions read/write and applicable Products/Prices/PaymentIntents permissions |
| `STRIPE_PUBLISHABLE_KEY` | Public live key from the same account |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the webhook endpoint below |

Register `https://sharkninja.site/api/02/stripe-webhook` in the same live Stripe account for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. Configure the signing secret privately in the host. All three settings are required before the UI switches to the embedded payment page. No live secret is included in this repository.

The backend uses the official Stripe Node SDK, validates the colour and integer quantity, sets the price on the server, keeps the total in GBP, uses idempotency keys, and verifies raw-body webhook signatures. Valid paid orders are marked `ready_for_dispatch` in Stripe session metadata; unpaid asynchronous payments remain `payment_pending` until Stripe confirms them. Repeated events are safe. This records order status in Stripe; dispatch remains the merchant's responsibility and no email or shipping provider is connected here.

`/02/complete.html` displays payment confirmation only after the server retrieves an owned Stripe Checkout Session. Opening the page or changing URL parameters cannot mark an order paid. It does not trigger fulfillment.

The original Ninja checkout and its Stripe configuration are preserved. To test embedded payment in a separate sandbox, provision corresponding sandbox products/prices and use a sandbox catalog copy plus sandbox keys. Never use test card numbers in the live checkout.

## Verification

Run `npm test`. These tests exercise server price selection, validation, idempotency, fallback links, order isolation, webhook signature verification, and paid/pending/failed event handling without charging a card. Browser verification covers the published basket, colour/quantity changes, mobile layout and the final Stripe-hosted product/amount. Live payment completion is performed by a real customer, not by these tests.
