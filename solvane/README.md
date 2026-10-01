# SOLVANE storefront — Shopify Payments-ready architecture

Independent custom storefront built directly in GitHub. The storefront is designed to redirect buyers to Shopify Checkout so the connected Shopify store can use Shopify Payments.

## Checkout safety gate

Checkout is intentionally disabled until the real merchant, product and fulfillment information is configured.

Public business data required in config.js:

- legal business name
- trading name
- company number, when applicable
- VAT number, when applicable
- support email
- support phone
- real business address
- processing time
- delivery estimate
- shipping regions
- return window
- refund processing time
- return-shipping responsibility
- warranty terms, if offered

Product checks required before enabling checkout:

- privateLabelAuthorizationConfirmed
- productPhotosVerified
- specificationsVerified
- fulfillmentInventoryConfirmed

Do not relabel a third-party branded product as SOLVANE unless you have legitimate authorization to sell/private-label it and the customer receives the exact product described.

## Shopify Storefront configuration

The frontend creates a Shopify Cart through the Storefront API and redirects to the returned checkoutUrl.

Configure:

- shopify.enabled = true
- shopify.storeDomain
- shopify.storefrontAccessToken
- shopify.variantId
- shopify.apiVersion = 2026-07

The Storefront token is a public storefront credential. Never put Shopify Admin API tokens, payment secrets, passwords, or private credentials in this public repository.

## Operating standards

The code cannot guarantee Shopify Payments approval or prevent reserves. Keep store/account data consistent with official records, fulfill within promised timelines, attach tracking, maintain responsive support, issue legitimate refunds promptly, use a recognizable customer statement descriptor, and monitor disputes.

Current staging imagery must be replaced by accurate licensed photos of the exact product before productPhotosVerified is set to true.
