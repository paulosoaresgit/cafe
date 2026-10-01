(() => {
  const cfg = window.SOLVANE_CONFIG;
  const app = document.getElementById("app");
  const PHOTO_1 = "https://images.unsplash.com/photo-1746289573063-2bee3bd96667?auto=format&fit=crop&fm=jpg&q=82&w=1800";
  const PHOTO_2 = "https://images.unsplash.com/photo-1712926097966-b86f0d8c131d?auto=format&fit=crop&fm=jpg&q=82&w=1800";
  const PHOTO_3 = "https://images.unsplash.com/photo-1772442363880-17ad476bdfee?auto=format&fit=crop&fm=jpg&q=82&w=1800";
  const money = c => c == null ? null : new Intl.NumberFormat("en-US",{style:"currency",currency:cfg.product.currency}).format(c/100);
  const storeReady = Boolean(
    cfg.checkout.enabled && cfg.product.priceCents && cfg.product.available &&
    cfg.business.legalName && cfg.business.supportEmail && cfg.business.address &&
    cfg.business.returnWindowDays && cfg.business.processingTime && cfg.business.deliveryEstimate
  );

  const icon = name => {
    const paths = {
      menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      bag:'<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
      shield:'<path d="M12 3 5 6v6c0 4.5 2.9 7.6 7 9 4.1-1.4 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      box:'<path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
      headset:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5ZM17 20c-1 1-2 1-4 1"/>',
      return:'<path d="M9 7H5v-4"/><path d="M5 7a8 8 0 1 1-1 8"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
  };

  function header(){
    return `
    ${!storeReady?'<div class="setup">Preview mode: checkout stays disabled until verified business, product and Stripe settings are configured.</div>':''}
    <div class="utility"><div class="container"><a href="/shipping">Shipping</a><a href="/returns">Returns</a><a href="/contact">Support</a></div></div>
    <header class="header">
      <div class="container header-row">
        <button class="icon-btn mobile-menu-btn" id="menuBtn" aria-label="Open menu">${icon("menu")}</button>
        <nav class="nav"><a href="/products/solvane-one">Coffee Makers</a><a href="/about">About</a><a href="/contact">Support</a></nav>
        <a class="wordmark" href="/">SOLVANE</a>
        <div class="header-actions">
          <button class="icon-btn" aria-label="Search">${icon("search")}</button>
          <button class="icon-btn" aria-label="Account">${icon("user")}</button>
          <button class="icon-btn" id="cartBtn" aria-label="Cart" style="position:relative">${icon("bag")}<span class="cart-badge" id="cartBadge">0</span></button>
        </div>
      </div>
    </header>
    <nav class="mobile-nav" id="mobileNav"><a href="/products/solvane-one">Coffee Makers</a><a href="/about">About</a><a href="/contact">Support</a><a href="/shipping">Shipping</a><a href="/returns">Returns</a></nav>`;
  }

  function footer(){
    return `<footer class="footer">
      <div class="container footer-grid">
        <div><div class="wordmark" style="text-align:left">SOLVANE</div><p>Thoughtful coffee essentials for simpler everyday routines.</p></div>
        <div><h4>SHOP</h4><div class="footer-links"><a href="/products/solvane-one">Solvane One</a><a href="/track">Order tracking</a></div></div>
        <div><h4>CUSTOMER SERVICE</h4><div class="footer-links"><a href="/contact">Contact</a><a href="/shipping">Shipping</a><a href="/returns">Returns & refunds</a></div></div>
        <div><h4>COMPANY</h4><div class="footer-links"><a href="/about">About</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></div>
      </div>
      <div class="container footer-bottom"><span>© ${new Date().getFullYear()} Solvane. All rights reserved.</span><span>Lifestyle photography sourced under the Unsplash License.</span></div>
    </footer>`;
  }

  function benefits(){
    return `<section class="benefits"><div class="container benefit-grid">
      <div class="benefit">${icon("shield")}<span>Secure checkout</span></div>
      <div class="benefit">${icon("return")}<span>Clear return policy</span></div>
      <div class="benefit">${icon("box")}<span>Order tracking</span></div>
      <div class="benefit">${icon("headset")}<span>Customer support</span></div>
    </div></section>`;
  }

  function productPrice(){
    const p=money(cfg.product.priceCents);
    return p ? '<div class="price">'+p+'</div>' : '<div class="price muted">Price available when launch configuration is complete.</div>';
  }

  function home(){
    return `
    <section class="hero"><div class="container hero-grid">
      <div><p class="eyebrow">SOLVANE ONE</p><h1>Coffee, without the complication.</h1><p class="lead">A focused single-serve coffee maker designed for an easier everyday routine. Final product specifications and photography will be published only after supplier verification.</p><a class="btn" href="/products/solvane-one">Shop Solvane One</a></div>
      <div class="hero-media"><img src="${PHOTO_1}" alt="Modern coffee setup in a home kitchen" fetchpriority="high"></div>
    </div></section>
    ${benefits()}
    <section class="section"><div class="container">
      <div class="section-head"><div><p class="eyebrow">SHOP COFFEE MAKERS</p><h2>Meet Solvane One.</h2></div><p>Everything on the product page is structured for transparent checkout, fulfillment and returns.</p></div>
      <article class="product-card">
        <div class="product-card-media"><img src="${PHOTO_2}" alt="Modern kitchen coffee station"></div>
        <div class="product-card-copy"><p class="eyebrow">SINGLE-SERVE</p><h3>Solvane One</h3><p>A clean, practical coffee maker for daily use. No unverified specifications or inflated claims.</p>${productPrice()}<a class="btn" href="/products/solvane-one">View product</a></div>
      </article>
    </div></section>
    <section class="section soft"><div class="container">
      <div class="section-head"><div><p class="eyebrow">WHY SOLVANE</p><h2>A store built around clarity.</h2></div></div>
      <div class="feature-grid">
        <div class="feature">${icon("shield")}<h3>Transparent checkout</h3><p>Pricing and availability only go live after product and payment settings are verified.</p></div>
        <div class="feature">${icon("return")}<h3>Clear policies</h3><p>Shipping, returns, privacy and terms remain easy to find before and after purchase.</p></div>
        <div class="feature">${icon("headset")}<h3>Real support details</h3><p>We do not publish invented addresses, reviews, support channels or certifications.</p></div>
      </div>
    </div></section>
    <section class="section"><div class="container split"><div class="split-media"><img src="${PHOTO_3}" alt="Coffee machine in a modern home kitchen"></div><div class="split-copy"><p class="eyebrow">EVERYDAY COFFEE</p><h2>Made to fit the routine, not complicate it.</h2><p>The Solvane storefront is intentionally straightforward: understand the product, see the verified details, know the delivery and return terms, then check out securely.</p><a class="btn secondary" href="/about">About Solvane</a></div></div></section>
    <section class="section faq"><div class="container"><div class="section-head"><h2>Frequently asked questions</h2></div>
      <details><summary>When will Solvane One be available?<span>+</span></summary><p>Availability will be shown here after inventory and fulfillment details are verified. Checkout remains disabled until then.</p></details>
      <details><summary>What are the exact product specifications?<span>+</span></summary><p>Only supplier-verified specifications will be published. Unverified numbers are intentionally omitted.</p></details>
      <details><summary>How do returns work?<span>+</span></summary><p>The complete return window and process will appear on the Returns page before checkout is enabled.</p></details>
      <details><summary>How can I track an order?<span>+</span></summary><p>Once fulfillment is connected, shipment tracking will be provided by email and through the Order Tracking page.</p></details>
    </div></section>`;
  }

  function product(){
    const gallery=[PHOTO_2,PHOTO_1,PHOTO_3];
    return `<div class="container breadcrumbs"><a href="/">Home</a> / Coffee Makers / Solvane One</div>
    <main class="container pdp">
      <section class="gallery">
        <div class="thumbs">${gallery.map((g,i)=>'<button class="thumb '+(i===0?'active':'')+'" data-img="'+g+'"><img src="'+g+'" alt=""></button>').join("")}</div>
        <div class="main-image"><img id="mainProductImage" src="${gallery[0]}" alt="Solvane One lifestyle product presentation"></div>
      </section>
      <aside class="buybox">
        <p class="eyebrow">SOLVANE</p><h1>Solvane One</h1><p class="subtitle">Single-Serve Coffee Maker</p>
        ${productPrice()}
        <div class="status"><span class="dot"></span><span>${cfg.product.available?'Available':'Not available for purchase yet'}</span></div>
        <p style="color:var(--muted);font-size:14px">Final product photography, specifications and included items will replace the current lifestyle presentation before launch.</p>
        <div class="quantity"><button id="qtyMinus" aria-label="Decrease quantity">−</button><span id="qty">1</span><button id="qtyPlus" aria-label="Increase quantity">+</button></div>
        <div class="buy-actions"><button class="btn" id="addCart" ${cfg.product.priceCents?'':'disabled'}>Add to cart</button><button class="btn secondary" id="buyNow" ${storeReady?'':'disabled'}>Buy now</button></div>
        <div class="trust-list">
          <div class="trust-row">${icon("box")}<div><strong>Shipping</strong>${cfg.business.processingTime&&cfg.business.deliveryEstimate?cfg.business.processingTime+' processing · '+cfg.business.deliveryEstimate:'Published before checkout opens.'}</div></div>
          <div class="trust-row">${icon("return")}<div><strong>Returns</strong>${cfg.business.returnWindowDays?cfg.business.returnWindowDays+'-day return window':'Full return terms published before checkout opens.'}</div></div>
          <div class="trust-row">${icon("shield")}<div><strong>Secure checkout</strong>Hosted payment flow is prepared for Stripe and remains locked until configuration is complete.</div></div>
        </div>
      </aside>
    </main>
    <section class="container pdp-details"><div class="details-wrap">
      <details open><summary>Product details<span>+</span></summary><p>Solvane One is positioned as a straightforward single-serve coffee maker for everyday home use. Specific performance claims will only be added after verification.</p></details>
      <details><summary>Specifications<span>+</span></summary><p>${cfg.product.verifiedSpecs.length?cfg.product.verifiedSpecs.join(" · "):"Verified technical specifications have not been published yet."}</p></details>
      <details><summary>What's included<span>+</span></summary><p>${cfg.product.includedItems.length?cfg.product.includedItems.join(", "):"Box contents will be published after supplier verification."}</p></details>
      <details><summary>Shipping & returns<span>+</span></summary><p>See the <a href="/shipping"><u>Shipping Policy</u></a> and <a href="/returns"><u>Returns & Refunds</u></a> pages for the terms that will apply when checkout is enabled.</p></details>
      <details><summary>Warranty<span>+</span></summary><p>Warranty terms will be published only after the applicable product warranty is confirmed.</p></details>
    </div></section>`;
  }

  function pageHero(title, copy, eyebrow="SOLVANE"){return '<section class="page-hero"><div class="container"><p class="eyebrow">'+eyebrow+'</p><h1 class="page-title">'+title+'</h1><p>'+copy+'</p></div></section>'}
  function about(){return pageHero("Coffee equipment for real routines.","Solvane is building a focused home-coffee brand around straightforward products and transparent ecommerce.")+'<section class="content container"><div class="split"><div><h2>Thoughtful by default.</h2><p>Our product pages are designed to make practical information easy to find: what the product is, what it costs, what ships with it, how fulfillment works and how returns are handled.</p><h2>No invented proof.</h2><p>We do not use fabricated reviews, artificial scarcity, fake countdowns or unverified certifications. Commercial claims are added only when they can be supported.</p></div><div class="split-media"><img src="'+PHOTO_1+'" alt="Coffee setup in a home kitchen"></div></div></section>'}
  function policy(title, intro, sections){return pageHero(title,intro,"CUSTOMER SERVICE")+'<section class="content narrow container">'+sections.map(s=>'<h2>'+s[0]+'</h2><p>'+s[1]+'</p>').join("")+'</section>'}
  function shipping(){return policy("Shipping policy","How Solvane processes, ships and tracks orders.",[
    ["Order processing",cfg.business.processingTime?"Orders are normally processed within "+cfg.business.processingTime+".":"Processing times will be published before checkout is enabled."],
    ["Delivery",cfg.business.deliveryEstimate?"Estimated delivery: "+cfg.business.deliveryEstimate+".":"Delivery estimates and destinations will be published before checkout is enabled."],
    ["Tracking","After shipment, tracking information will be sent to the customer using the contact details provided at checkout."],
    ["Address changes","Customers should contact support promptly. Changes cannot be guaranteed once fulfillment begins."]
  ])}
  function returns(){return policy("Returns & refunds","Clear return terms before you buy.",[
    ["Return window",cfg.business.returnWindowDays?"Eligible items may be returned within "+cfg.business.returnWindowDays+" days.":"The return window will be published before checkout is enabled."],
    ["Return condition","Required condition, exclusions and any return-shipping costs will be clearly stated before sales begin."],
    ["Damaged or incorrect items","Customers should contact support with the order number and clear photos of the item and packaging."],
    ["Refunds","Approved refunds are returned to the original payment method; the financial institution may require additional processing time."]
  ])}
  function privacy(){return policy("Privacy policy","How Solvane handles personal information.",[
    ["Information we collect","We may collect contact, order, payment-status, device and support information needed to operate the store. Payment-card details are handled by the payment provider and are not stored by this storefront."],
    ["How information is used","Information may be used to process orders, provide support, prevent fraud, improve store performance and meet legal obligations."],
    ["Service providers","Information may be shared with providers supporting payment, fulfillment, analytics, security and customer service only as needed for those services."],
    ["Your choices","Where applicable, customers may request access, correction or deletion using the published support channel."],
    ["Security","Reasonable safeguards are used, but no online service can guarantee absolute security."]
  ])}
  function terms(){return policy("Terms of use","Terms governing use of the Solvane online store.",[
    ["Seller identity",cfg.business.legalName?"The seller is "+cfg.business.legalName+".":"The legal seller identity will be published before checkout is enabled."],
    ["Orders","An order is an offer to purchase. Orders may be declined or canceled for payment, inventory, pricing, fraud-prevention or legal reasons."],
    ["Product information","We aim to present accurate information. Verified price, availability, warranty and specifications are displayed before purchase."],
    ["Acceptable use","Customers may use this site for lawful personal shopping and may not interfere with the site or attempt unauthorized access."]
  ])}
  function contact(){return pageHero("Contact Solvane","Get help with product questions, orders or returns.","SUPPORT")+'<section class="content narrow container">'+(!cfg.business.supportEmail?'<div class="notice">Customer support contact details will be published before checkout opens.</div>':'<p>Email: <a href="mailto:'+cfg.business.supportEmail+'"><u>'+cfg.business.supportEmail+'</u></a></p>')+'<form class="form-grid" id="contactForm"><div class="field"><label>Name</label><input required></div><div class="field"><label>Email</label><input type="email" required></div><div class="field full"><label>Message</label><textarea required></textarea></div><div class="field full"><button class="btn" '+(cfg.business.supportEmail?'':'disabled')+'>Send message</button></div></form></section>'}
  function track(){return pageHero("Track your order","Shipment tracking will connect here when fulfillment is live.","ORDER STATUS")+'<section class="content narrow container"><div class="notice">Tracking lookup is not active yet because fulfillment is not connected.</div><div class="field"><label>Order or tracking number</label><input placeholder="Enter your number" disabled></div></section>'}
  function success(){return pageHero("Thanks for your order.","Once checkout is active, confirmed orders will land here with the next steps.","ORDER CONFIRMED")}
  function cancel(){return pageHero("Checkout canceled.","No order was completed. You can return to the product page whenever you are ready.","CHECKOUT")}
  function notFound(){return pageHero("Page not found.","The page you requested does not exist.")+'<section class="content container"><a class="btn" href="/">Back to home</a></section>'}

  function drawer(){
    return '<div class="drawer-backdrop" id="drawerBackdrop"></div><aside class="drawer" id="drawer"><div class="drawer-head"><strong>Your cart</strong><button class="icon-btn" id="drawerClose" aria-label="Close">×</button></div><div class="drawer-body" id="drawerBody"></div><div class="drawer-foot" id="drawerFoot"></div></aside>';
  }
  function getCart(){try{return JSON.parse(localStorage.getItem("solvane_cart")||'{"qty":0}')}catch{return {qty:0}}}
  function setCart(cart){localStorage.setItem("solvane_cart",JSON.stringify(cart));renderCart()}
  function renderCart(){
    const cart=getCart(), badge=document.getElementById("cartBadge"), body=document.getElementById("drawerBody"), foot=document.getElementById("drawerFoot");
    if(badge) badge.textContent=cart.qty||0;
    if(!body||!foot)return;
    if(!cart.qty){body.innerHTML='<div style="text-align:center;padding:80px 10px;color:var(--muted)">Your cart is empty.</div>';foot.innerHTML='';return}
    body.innerHTML='<div class="cart-item"><img src="'+PHOTO_2+'" alt=""><div><strong>Solvane One</strong><div style="color:var(--muted);font-size:13px">Single-Serve Coffee Maker</div><div style="margin-top:14px">Qty: '+cart.qty+'</div></div></div>';
    foot.innerHTML='<div class="drawer-foot-row"><span>Subtotal</span><span>'+(money(cfg.product.priceCents*cart.qty)||'Available at launch')+'</span></div><button class="btn" id="checkoutBtn" '+(storeReady?'':'disabled')+'>Checkout</button>'+(storeReady?'':'<p style="font-size:12px;color:var(--muted);text-align:center">Checkout is disabled until store setup is complete.</p>');
    const checkout=document.getElementById("checkoutBtn"); if(checkout&&!checkout.disabled) checkout.onclick=()=>startCheckout(cart.qty);
  }
  function openDrawer(){document.getElementById("drawer").classList.add("open");document.getElementById("drawerBackdrop").classList.add("open")}
  function closeDrawer(){document.getElementById("drawer").classList.remove("open");document.getElementById("drawerBackdrop").classList.remove("open")}
  async function startCheckout(qty){
    try{
      const utm={};["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(k=>{const v=new URLSearchParams(location.search).get(k);if(v)utm[k]=v});
      const res=await fetch("/api/create-checkout-session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({quantity:qty,utm})});
      const data=await res.json(); if(!res.ok) throw new Error(data.error||"Checkout unavailable"); location.href=data.url;
    }catch(e){alert(e.message)}
  }

  function mount(){
    const path=location.pathname.replace(/\/$/,"")||"/";
    const routes={
      "/":home,"/products/solvane-one":product,"/about":about,"/contact":contact,"/shipping":shipping,
      "/returns":returns,"/privacy":privacy,"/terms":terms,"/track":track,"/success":success,"/cancel":cancel
    };
    const render=routes[path]||notFound;
    app.innerHTML=header()+render()+footer()+drawer();
    document.getElementById("cartBtn")?.addEventListener("click",openDrawer);
    document.getElementById("drawerClose")?.addEventListener("click",closeDrawer);
    document.getElementById("drawerBackdrop")?.addEventListener("click",closeDrawer);
    document.getElementById("menuBtn")?.addEventListener("click",()=>document.getElementById("mobileNav").classList.toggle("open"));
    document.querySelectorAll(".thumb").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".thumb").forEach(x=>x.classList.remove("active"));t.classList.add("active");document.getElementById("mainProductImage").src=t.dataset.img}));
    let qty=1; const q=document.getElementById("qty"); document.getElementById("qtyMinus")?.addEventListener("click",()=>{qty=Math.max(1,qty-1);q.textContent=qty});document.getElementById("qtyPlus")?.addEventListener("click",()=>{qty++;q.textContent=qty});
    document.getElementById("addCart")?.addEventListener("click",()=>{const c=getCart();c.qty=(c.qty||0)+qty;setCart(c);openDrawer()});
    document.getElementById("buyNow")?.addEventListener("click",()=>startCheckout(qty));
    document.getElementById("contactForm")?.addEventListener("submit",e=>{e.preventDefault(); if(cfg.business.supportEmail) location.href="mailto:"+cfg.business.supportEmail});
    renderCart();
    document.title = path==="/" ? "Solvane | Coffee, made simple" : (document.querySelector("h1")?.textContent||"Solvane")+" | Solvane";
  }
  mount();
})();
