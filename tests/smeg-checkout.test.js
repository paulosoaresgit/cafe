const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const Stripe = require('stripe');
const {createSmegCheckoutHandler} = require('../lib/smeg-checkout');
const catalog = require('../02/checkout-catalog.json');

const attemptId = 'afcf68b5-9b26-4b6e-9c03-0c8b9a756071';
const signatureSdk = new Stripe('unit-test-placeholder');
const signingSecret = 'local-webhook-test-fixture';
const ownSession = (overrides = {}) => ({id:'cs_live_fixture123', mode:'payment', payment_status:'paid', status:'complete', amount_total:23800, currency:'gbp', metadata:{integration:'cafe_smeg_checkout', product_page:'/02', colour:'black', quantity:'2'}, ...overrides});

async function fixture(t, options = {}) {
  const calls = [];
  const state = {session:ownSession()};
  const stripe = {
    checkout:{sessions:{
      create:async (params,opts) => {calls.push({method:'create',params,opts}); return {client_secret:'fixture-client-secret'};},
      retrieve:async () => state.session,
      update:async (id,params,opts) => {calls.push({method:'update',id,params,opts}); Object.assign(state.session.metadata,params.metadata); return state.session;}
    }},
    webhooks:signatureSdk.webhooks
  };
  const handler = createSmegCheckoutHandler({stripe,publishableKey:'public-key-fixture',webhookSecret:signingSecret,...options});
  const server = http.createServer(async (req,res) => {
    if (!await handler(req,res,new URL(req.url,'http://localhost'))) {res.writeHead(404);res.end();}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(route, data, headers = {}) {
    const response = await fetch(base + route, data === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json',...headers},body:typeof data === 'string' ? data : JSON.stringify(data)});
    return {status:response.status,data:await response.json()};
  }
  async function webhook(type, session = state.session, valid = true) {
    const payload = JSON.stringify({id:'evt_fixture123',type,data:{object:session}});
    const signature = signatureSdk.webhooks.generateTestHeaderString({payload,secret:valid ? signingSecret : 'incorrect-fixture-secret'});
    return request('/api/02/stripe-webhook',payload,{'stripe-signature':signature});
  }
  return {request,webhook,calls,state};
}

test('every colour and quantity has a unique fixed Stripe checkout destination', () => {
  assert.equal(catalog.amount,11900); assert.equal(catalog.currency,'gbp');
  assert.equal(Object.keys(catalog.variants).length,6);
  const links = [];
  for (const variant of Object.values(catalog.variants)) {
    assert.match(variant.priceId,/^price_/);
    for(let q=1;q<=12;q++) {const url=new URL(variant.paymentLinks[q].url);assert.equal(url.origin,'https://buy.stripe.com');links.push(url.href);}
  }
  assert.equal(new Set(links).size,72);
});
test('without private keys the correct colour/quantity works through Stripe', async t => {
  const f=await fixture(t,{stripe:null,publishableKey:'',webhookSecret:''});
  assert.equal((await f.request('/api/02/checkout-config')).data.mode,'hosted');
  const r=await f.request('/api/02/create-checkout-session',{colour:'pink',quantity:3});
  assert.equal(r.status,200); assert.equal(r.data.url,catalog.variants.pink.paymentLinks[3].url);
  assert.equal(f.calls.length,0);
});
test('embedded checkout waits for all private settings including its webhook', async t => {
  const f=await fixture(t,{webhookSecret:''});
  assert.equal((await f.request('/api/02/checkout-config')).data.mode,'hosted');
});
test('the server chooses price and quantity and ignores forged browser amounts', async t => {
  const f=await fixture(t);
  const r=await f.request('/api/02/create-checkout-session',{colour:'black',quantity:2,attemptId,amount:1,priceId:'forged'});
  assert.equal(r.status,200); assert.equal(r.data.clientSecret,'fixture-client-secret');
  const p=f.calls[0].params;
  assert.deepEqual(p.line_items,[{price:catalog.variants.black.priceId,quantity:2}]);
  assert.equal(p.metadata.colour,'black'); assert.equal(p.metadata.quantity,'2');
  assert.equal(p.mode,'payment'); assert.equal(p.ui_mode,'embedded_page');
  assert.equal(p.return_url,'https://sharkninja.site/02/complete.html?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(p.shipping_options[0].shipping_rate_data.fixed_amount.amount,0);
  assert.equal(p.adaptive_pricing.enabled,false);
  assert.equal(Object.hasOwn(p,'payment_method_types'),false);
});
test('retries use the same idempotency key; a different basket uses a different key', async t => {
  const f=await fixture(t);
  const b={colour:'red',quantity:1,attemptId};
  await f.request('/api/02/create-checkout-session',b); await f.request('/api/02/create-checkout-session',b);
  await f.request('/api/02/create-checkout-session',{...b,quantity:2});
  assert.equal(f.calls[0].opts.idempotencyKey,f.calls[1].opts.idempotencyKey);
  assert.notEqual(f.calls[0].opts.idempotencyKey,f.calls[2].opts.idempotencyKey);
});
test('invalid colours and quantities cannot create a payment', async t => {
  const f=await fixture(t);
  for(const b of [{colour:'black',quantity:0},{colour:'black',quantity:13},{colour:'black',quantity:1.5},{colour:'black',quantity:'2'},{colour:'__proto__',quantity:1},{colour:'unknown',quantity:1}]) {
    assert.equal((await f.request('/api/02/create-checkout-session',{...b,attemptId})).status,400);
  }
  assert.equal(f.calls.length,0);
});
test('foreign origins, malformed JSON and invalid attempt IDs are rejected', async t => {
  const f=await fixture(t);const b={colour:'white',quantity:1,attemptId};
  assert.equal((await f.request('/api/02/create-checkout-session',b,{origin:'https://example.net'})).status,403);
  assert.equal((await f.request('/api/02/create-checkout-session','{')).status,400);
  assert.equal((await f.request('/api/02/create-checkout-session',{...b,attemptId:'invalid'})).status,400);
  assert.equal(f.calls.length,0);
});
test('confirmation returns Stripe status without customer contact or delivery details', async t => {
  const f=await fixture(t); f.state.session.customer_details={email:'customer@example.invalid'};
  const r=await f.request('/api/02/order-status?session_id=cs_live_fixture123');
  assert.equal(r.data.paid,true); assert.equal(r.data.amount,23800); assert.equal(r.data.quantity,2);
  assert.equal(Object.hasOwn(r.data,'customer_details'),false);assert.equal(JSON.stringify(r.data).includes('customer@example'),false);
});
test('an unpaid session is never shown as paid', async t => {
  const f=await fixture(t); f.state.session.payment_status='unpaid';
  assert.equal((await f.request('/api/02/order-status?session_id=cs_live_fixture123')).data.paid,false);
});
test('other products and malformed session IDs do not expose an order', async t => {
  const f=await fixture(t); f.state.session.metadata={product_page:'/'};
  assert.equal((await f.request('/api/02/order-status?session_id=cs_live_fixture123')).status,404);
  assert.equal((await f.request('/api/02/order-status?session_id=anything')).status,400);
});
test('a forged webhook signature is rejected before order handling', async t => {
  const f=await fixture(t);assert.equal((await f.webhook('checkout.session.completed',f.state.session,false)).status,400);
  assert.equal(f.calls.length,0);
});
test('completed but unpaid asynchronous checkout remains pending', async t => {
  const f=await fixture(t);f.state.session.payment_status='unpaid';
  assert.equal((await f.webhook('checkout.session.completed')).status,200);
  assert.equal(f.calls[0].params.metadata.order_status,'payment_pending');
});
test('only Stripe-confirmed payments become ready for dispatch and repeats are safe', async t => {
  const f=await fixture(t);
  await f.webhook('checkout.session.async_payment_succeeded');await f.webhook('checkout.session.async_payment_succeeded');
  assert.equal(f.calls.length,1);assert.equal(f.calls[0].params.metadata.order_status,'ready_for_dispatch');
  assert.equal(f.calls[0].opts.idempotencyKey,'smeg02-webhook-evt_fixture123');
});
test('failed asynchronous payments do not become dispatchable', async t => {
  const f=await fixture(t); f.state.session.payment_status='unpaid';
  await f.webhook('checkout.session.async_payment_failed');
  assert.equal(f.calls[0].params.metadata.order_status,'payment_failed');
});
test('a late failure event cannot downgrade a Stripe-confirmed paid order', async t => {
  const f=await fixture(t);f.state.session.metadata.order_status='ready_for_dispatch';
  await f.webhook('checkout.session.async_payment_failed');assert.equal(f.calls.length,0);
});
test('webhooks for the original Ninja product are ignored', async t => {
  const f=await fixture(t);f.state.session.metadata={product_page:'/'};
  assert.equal((await f.webhook('checkout.session.completed')).status,200);assert.equal(f.calls.length,0);
});
