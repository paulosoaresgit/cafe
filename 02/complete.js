(async () => {
  const $ = id => document.getElementById(id);
  const sessionId = new URLSearchParams(location.search).get('session_id') || '';
  function unverifiable() {
    $('status-icon').textContent = 'i';
    $('status-title').textContent = 'Check your Stripe confirmation';
    $('status-copy').textContent = 'We could not verify a payment on this page. Please check your Stripe confirmation before placing another order.';
    $('return-link').href = '/02'; $('return-link').textContent = 'Return to collection';
  }
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return unverifiable();
  try {
    const response = await fetch('/api/02/order-status?session_id=' + encodeURIComponent(sessionId), {cache:'no-store'});
    if (!response.ok) return unverifiable();
    const order = await response.json();
    if (order.paid === true) {
      $('status-icon').textContent = '✓'; $('status-icon').classList.add('paid');
      $('status-title').textContent = 'Thank you. Payment confirmed.';
      $('status-copy').textContent = 'Your payment has been confirmed by Stripe. Keep your payment confirmation for your order reference.';
      $('order-details').textContent = order.quantity + ' × Smeg Heritage Collection · ' + order.colour + ' · ' + new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(order.amount / 100);
      $('order-details').hidden = false;
      $('return-link').href = '/02'; $('return-link').textContent = 'Return to collection';
    } else if (order.status === 'complete') {
      $('status-icon').textContent = '…'; $('status-title').textContent = 'Payment is processing';
      $('status-copy').textContent = 'Stripe is still processing your payment. Please wait for payment confirmation before placing another order.';
      $('return-link').href = '/02'; $('return-link').textContent = 'Return to collection';
    } else {
      $('status-icon').textContent = '↩'; $('status-title').textContent = 'Payment was not completed';
      $('status-copy').textContent = 'This checkout has not been paid. You can return to your basket and try again.';
      $('return-link').href = '/02/checkout.html?colour=' + encodeURIComponent(order.colourSlug) + '&quantity=' + order.quantity;
    }
  } catch (_) { unverifiable(); }
})();
