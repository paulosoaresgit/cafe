const catalog = require('../02/checkout-catalog.json');

const INTEGRATION = 'cafe_smeg_checkout';
const ORIGIN = 'https://sharkninja.site';
const ROUTES = new Set(['/api/02/checkout-config', '/api/02/create-checkout-session', '/api/02/order-status', '/api/02/stripe-webhook']);
const CSP = "default-src 'self'; script-src 'self' https://*.stripe.com; frame-src https://*.stripe.com https://*.link.com; connect-src 'self' https://*.stripe.com https://*.link.com; img-src 'self' data: https://*.stripe.com https://*.stripe.network; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; form-action 'self' https://*.stripe.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'";

function json(res, status, data) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(data));
  return true;
}
async function body(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 65536) throw Object.assign(new Error('Request too large'), {status:413});
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function basket(data) {
  if (!data || typeof data !== 'object' || !Object.hasOwn(catalog.variants, data.colour) || !Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > catalog.maxQuantity) return null;
  return {colour:data.colour, quantity:data.quantity, variant:catalog.variants[data.colour]};
}
function sessionBasket(session) {
  const metadata = session.metadata || {};
  if (metadata.integration !== INTEGRATION || metadata.product_page !== '/02' || session.mode !== 'payment') return null;
  const order = basket({colour:metadata.colour, quantity:Number(metadata.quantity)});
  if (!order) return null;
  return order;
}

function createSmegCheckoutHandler({stripe, publishableKey = '', webhookSecret = '', origin = ORIGIN} = {}) {
  const embeddedReady = Boolean(stripe && publishableKey && webhookSecret);
  return async function smegCheckout(req, res, url) {
    if (url.pathname === '/02/checkout.html' || url.pathname === '/02/complete.html') {
      res.setHeader('Content-Security-Policy', CSP);
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    if (!ROUTES.has(url.pathname)) return false;
    try {
      if (url.pathname === '/api/02/checkout-config' && req.method === 'GET') {
        return json(res, 200, {mode:embeddedReady ? 'embedded' : 'hosted', publishableKey:embeddedReady ? publishableKey : null, amount:catalog.amount, currency:catalog.currency});
      }
      if (url.pathname === '/api/02/create-checkout-session' && req.method === 'POST') {
        if (req.headers.origin && req.headers.origin !== origin) return json(res, 403, {error:'Invalid checkout origin'});
        if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, {error:'JSON required'});
        let data;
        try { data = JSON.parse((await body(req)).toString('utf8')); } catch (err) { return json(res, err.status || 400, {error:'Invalid checkout request'}); }
        const order = basket(data);
        if (!order) return json(res, 400, {error:'Choose a valid colour and quantity from 1 to 12.'});
        if (!embeddedReady) return json(res, 200, {mode:'hosted', url:order.variant.paymentLinks[order.quantity].url});
        if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(data.attemptId || '')) return json(res, 400, {error:'Invalid checkout attempt'});
        const metadata = {integration:INTEGRATION, source_site:'sharkninja.site', product_page:'/02', colour:order.colour, colour_name:order.variant.name, quantity:String(order.quantity)};
        const session = await stripe.checkout.sessions.create({
          mode:'payment', ui_mode:'embedded_page',
          line_items:[{price:order.variant.priceId, quantity:order.quantity}],
          integration_identifier:'cafe_smeg_checkout_zhrvpkma',
          return_url:origin + '/02/complete.html?session_id={CHECKOUT_SESSION_ID}',
          client_reference_id:'smeg02_' + order.colour + '_' + order.quantity + '_' + data.attemptId,
          metadata,
          payment_intent_data:{description:catalog.name + ' — ' + order.variant.name + ' × ' + order.quantity, metadata},
          shipping_address_collection:{allowed_countries:['GB']}, phone_number_collection:{enabled:true},
          shipping_options:[{shipping_rate_data:{type:'fixed_amount', fixed_amount:{amount:0,currency:'gbp'}, display_name:'Free tracked UK delivery', delivery_estimate:{minimum:{unit:'business_day',value:2},maximum:{unit:'business_day',value:3}}}}],
          adaptive_pricing:{enabled:false}
        }, {idempotencyKey:'smeg02-' + order.colour + '-' + order.quantity + '-' + data.attemptId});
        return json(res, 200, {clientSecret:session.client_secret});
      }
      if (url.pathname === '/api/02/order-status' && req.method === 'GET') {
        if (!stripe) return json(res, 503, {error:'Payment verification unavailable'});
        const sessionId = url.searchParams.get('session_id') || '';
        if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return json(res, 400, {error:'Invalid checkout session'});
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const order = sessionBasket(session);
        if (!order) return json(res, 404, {error:'Order not found'});
        return json(res, 200, {paid:session.payment_status === 'paid', status:session.status, amount:session.amount_total, currency:session.currency, colour:order.variant.name, colourSlug:order.colour, quantity:order.quantity});
      }
      if (url.pathname === '/api/02/stripe-webhook' && req.method === 'POST') {
        if (!stripe || !webhookSecret) return json(res, 503, {error:'Webhook is not configured'});
        let event;
        try { event = stripe.webhooks.constructEvent(await body(req), req.headers['stripe-signature'], webhookSecret); }
        catch (_) { return json(res, 400, {error:'Invalid webhook signature'}); }
        if (['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed'].includes(event.type)) {
          const incoming = event.data.object;
          if (sessionBasket(incoming)) {
            const session = await stripe.checkout.sessions.retrieve(incoming.id);
            const order = sessionBasket(session);
            if (!order) return json(res, 400, {error:'Invalid order metadata'});
            const status = session.payment_status === 'paid' ? 'ready_for_dispatch' : event.type === 'checkout.session.async_payment_failed' ? 'payment_failed' : 'payment_pending';
            if (session.metadata.order_status !== status) {
              await stripe.checkout.sessions.update(session.id, {metadata:{order_status:status, stripe_event_id:event.id}}, {idempotencyKey:'smeg02-webhook-' + event.id});
            }
          }
        }
        return json(res, 200, {received:true});
      }
      return json(res, 405, {error:'Method not allowed'});
    } catch (err) {
      console.error('SMEG checkout request failed:', err.type || err.name || 'StripeError');
      return json(res, 502, {error:'Secure checkout is temporarily unavailable. Please try again.'});
    }
  };
}

module.exports = {createSmegCheckoutHandler, basket, sessionBasket};
