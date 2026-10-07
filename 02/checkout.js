(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const money = value => new Intl.NumberFormat('en-GB', {style: 'currency', currency: 'GBP'}).format(value / 100);
  const params = new URLSearchParams(location.search);
  let colour = params.get('colour') || 'light-blue';
  let quantity = /^[1-9]\d?$/.test(params.get('quantity') || '') ? Number(params.get('quantity')) : 1;
  let catalog, config, busy = false;
  let attemptId = crypto.randomUUID();
  const pay = $('pay-button');
  function message(text) { $('checkout-message').textContent = text; $('checkout-message').hidden = !text; }
  function render() {
    const variant = catalog.variants[colour];
    $('product-image').src = variant.image;
    $('product-image').alt = catalog.name + ' in ' + variant.name;
    $('selected-colour').textContent = variant.name;
    $('quantity').textContent = quantity;
    $('quantity-badge').textContent = quantity;
    $('subtotal').textContent = $('total').textContent = money(catalog.amount * quantity);
    $('compare-price').textContent = money(catalog.compareAtAmount * quantity);
    $('savings').textContent = money((catalog.compareAtAmount - catalog.amount) * quantity);
    $('decrease').disabled = busy || quantity <= 1;
    $('increase').disabled = busy || quantity >= catalog.maxQuantity;
    document.querySelectorAll('.colour-option').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.colour === colour));
      button.disabled = busy;
    });
    pay.disabled = busy;
    $('pay-label').textContent = busy ? 'Opening secure checkout…' : 'Continue to secure payment — ' + money(catalog.amount * quantity);
    const url = new URL(location.href);
    url.searchParams.set('colour', colour);
    url.searchParams.set('quantity', quantity);
    history.replaceState(null, '', url);
  }
  function change(nextColour, nextQuantity) {
    colour = nextColour;
    quantity = nextQuantity;
    attemptId = crypto.randomUUID();
    message('');
    render();
  }
  function hostedUrl() {
    const url = new URL(catalog.variants[colour].paymentLinks[quantity].url);
    if (url.origin !== 'https://buy.stripe.com') throw new Error('Invalid checkout destination');
    url.searchParams.set('client_reference_id', 'smeg02_' + colour + '_' + quantity + '_' + attemptId);
    url.searchParams.set('locale', 'en');
    return url.href;
  }
  $('decrease').addEventListener('click', () => { if (!busy) change(colour, Math.max(1, quantity - 1)); });
  $('increase').addEventListener('click', () => { if (!busy && catalog) change(colour, Math.min(catalog.maxQuantity, quantity + 1)); });
  pay.addEventListener('click', async () => {
    if (busy || !catalog) return;
    busy = true;
    message('');
    render();
    if (config?.mode !== 'embedded' || typeof Stripe !== 'function') {
      location.assign(hostedUrl());
      return;
    }
    try {
      const response = await fetch('/api/02/create-checkout-session', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({colour, quantity, attemptId})
      });
      const result = await response.json();
      if (!response.ok || !result.clientSecret) throw new Error('Unable to open payment form');
      const stripe = Stripe(config.publishableKey);
      const embedded = await stripe.createEmbeddedCheckoutPage({fetchClientSecret: async () => result.clientSecret});
      $('embedded-checkout').hidden = false;
      embedded.mount('#embedded-checkout');
      $('hosted-payment').hidden = true;
    } catch (_) {
      busy = false;
      config = {mode: 'hosted'};
      render();
      message('The payment form could not load. Continue with Stripe’s secure checkout using the button below.');
    }
  });
  async function start() {
    try {
      const response = await fetch('/02/checkout-catalog.json?v=1', {cache: 'no-store'});
      if (!response.ok) throw new Error('Catalog unavailable');
      catalog = await response.json();
      if (!Object.hasOwn(catalog.variants, colour)) colour = 'light-blue';
      quantity = Math.max(1, Math.min(catalog.maxQuantity, quantity));
      for (const [slug, variant] of Object.entries(catalog.variants)) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'colour-option'; button.dataset.colour = slug;
        button.setAttribute('aria-label', variant.name);
        const image = document.createElement('img'); image.src = variant.image; image.alt = variant.name;
        button.append(image);
        button.addEventListener('click', () => { if (!busy) change(slug, quantity); });
        $('colour-options').append(button);
      }
      render();
      try {
        const response = await fetch('/api/02/checkout-config', {cache: 'no-store'});
        if (response.ok && response.headers.get('content-type')?.includes('application/json')) config = await response.json();
      } catch (_) { config = {mode: 'hosted'}; }
    } catch (_) {
      message('Secure checkout is temporarily unavailable. Please refresh the page to try again.');
      $('pay-label').textContent = 'Please refresh to try again';
      pay.disabled = true;
    }
  }
  start();
  addEventListener('pageshow', event => { if (event.persisted && catalog) { busy = false; render(); } });
})();
