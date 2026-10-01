(() => {
  const cfg = window.SOLVANE_CONFIG;
  const app = document.getElementById("app");
  const GH = location.hostname.endsWith("github.io");
  const GH_BASE = "/cafe/solvane";
  const PHOTOS = [
    "https://images.unsplash.com/photo-1707241358597-bafcc8a8e73d?auto=format&fit=crop&fm=jpg&q=85&w=1800",
    "https://images.unsplash.com/photo-1774530964295-c71786eedf58?auto=format&fit=crop&fm=jpg&q=85&w=1800",
    "https://images.unsplash.com/photo-1756949333564-8148a9506369?auto=format&fit=crop&fm=jpg&q=85&w=1800"
  ];

  function money(cents, currency) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || cfg.product.currency
    }).format((Number(cents) || 0) / 100);
  }

  const ready = Boolean(
    cfg.shopify.enabled &&
    cfg.shopify.storeDomain &&
    cfg.shopify.storefrontAccessToken &&
    cfg.shopify.variantId &&
    cfg.business.legalName &&
    cfg.business.supportEmail &&
    cfg.business.supportPhone &&
    cfg.business.address &&
    cfg.policies.processingTime &&
    cfg.policies.deliveryEstimate &&
    cfg.policies.shippingRegions &&
    cfg.policies.returnWindowDays &&
    cfg.policies.refundProcessingTime &&
    cfg.product.privateLabelAuthorizationConfirmed &&
    cfg.product.productPhotosVerified &&
    cfg.product.specificationsVerified &&
    cfg.product.fulfillmentInventoryConfirmed
  );

  function icon(name) {
    const paths = {
      bag:'<path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      truck:'<path d="M3 6h11v10H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/>',
      return:'<path d="M9 7H5V3"/><path d="M5 7a8 8 0 1 1-1 8"/>',
      shield:'<path d="M12 3 5 6v6c0 4.5 2.9 7.6 7 9 4.1-1.4 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      support:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z"/>',
      grind:'<circle cx="12" cy="12" r="8"/><path d="M12 4v4M12 16v4M4 12h4M16 12h4"/>',
      cup:'<path d="M5 8h11v7a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z"/><path d="M16 10h2a3 3 0 0 1 0 6h-2"/>',
      droplet:'<path d="M12 3s6 6 6 11a6 6 0 1 1-12 0c0-5 6-11 6-11Z"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>';
  }

  function header() {
    let html = "";
    if (!ready) {
      html += '<div class="complianceBar">Store setup in progress — checkout is disabled until seller, fulfillment, product authorization and Shopify settings are verified.</div>';
    }
    html += '<div class="topbar"><div class="shell">SOLVANE ONE BARISTA · '+money(cfg.product.priceCents)+'</div></div>';
    html += '<header class="header"><div class="shell">';
    html += '<nav class="nav"><a href="/">Shop</a><a href="/about">About</a><a href="/contact">Support</a></nav>';
    html += '<a class="wordmark" href="/">SOLVANE</a>';
    html += '<div class="actions"><button class="icon" aria-label="Search">'+icon("search")+'</button><button class="icon account" aria-label="Account">'+icon("user")+'</button><button class="icon" id="cartBtn" aria-label="Cart" style="position:relative">'+icon("bag")+'<span class="cartCount" id="cartCount">0</span></button></div>';
    html += '</div></header>';
    return html;
  }

  function usps() {
    return '<section class="usps"><div class="shell uspGrid">'+
      '<div class="usp">'+icon("truck")+'<div><b>Delivery information</b><span>Published before payment</span></div></div>'+
      '<div class="usp">'+icon("return")+'<div><b>Clear returns</b><span>Policy visible before purchase</span></div></div>'+
      '<div class="usp">'+icon("shield")+'<div><b>Secure checkout</b><span>Completed through Shopify</span></div></div>'+
      '<div class="usp">'+icon("support")+'<div><b>Customer support</b><span>Order and product assistance</span></div></div>'+
      '</div></section>';
  }

  function productTop() {
    const thumbs = PHOTOS.map(function(p, i) {
      return '<button class="thumb '+(i===0?'active':'')+'" data-img="'+p+'"><img src="'+p+'" alt=""></button>';
    }).join("");

    const availability = cfg.product.fulfillmentInventoryConfirmed ? "Availability confirmed" : "Checkout not active yet";
    const shippingText = cfg.policies.deliveryEstimate || "Delivery estimate published before checkout opens.";
    const returnText = cfg.policies.returnWindowDays ? cfg.policies.returnWindowDays+"-day return window" : "Return window published before checkout opens.";

    return '<section class="pdpWrap"><div class="shell pdp">'+
      '<div class="gallery"><div class="thumbs">'+thumbs+'</div><figure class="stage"><img id="mainImage" src="'+PHOTOS[0]+'" alt="Solvane One Barista coffee machine"></figure></div>'+
      '<aside class="buy">'+
      '<div class="badges"><span class="badge main">SOLVANE ONE</span><span class="badge">3-in-1</span><span class="badge">Built-in grinder</span></div>'+
      '<h1>'+cfg.product.name+'</h1>'+
      '<p class="subtitle">'+cfg.product.subtitle+'</p>'+
      '<div class="price">'+money(cfg.product.priceCents)+'</div>'+
      '<p class="tax">Final taxes and delivery charges, when applicable, are shown in Shopify Checkout before payment.</p>'+
      '<div class="stock">'+availability+'</div>'+
      '<div class="finish"><div class="label"><span>Finish</span><span>'+cfg.product.finish+'</span></div><div class="finishBox"><span>'+cfg.product.finish+'</span><span class="swatch"></span></div></div>'+
      '<div class="qtyRow"><div class="qty"><button id="minus">−</button><span id="qty">1</span><button id="plus">+</button></div><button class="btn add" id="add">Add to cart · '+money(cfg.product.priceCents)+'</button></div>'+
      '<button class="btn light buyNow" id="buyNow" '+(ready?'':'disabled')+'>Buy now</button>'+
      '<p class="paynote">'+(ready?'Continue securely to Shopify Checkout.':'Checkout activates after verified seller, product, fulfillment and Shopify settings are completed.')+'</p>'+
      '<div class="checkoutMeta">'+icon("shield")+'<span>Payment details are entered in Shopify Checkout, not collected on this page.</span></div>'+
      '<div class="trust">'+
        '<div class="trustRow">'+icon("truck")+'<div><b>Shipping</b><span>'+shippingText+'</span></div></div>'+
        '<div class="trustRow">'+icon("return")+'<div><b>Returns</b><span>'+returnText+'</span></div></div>'+
        '<div class="trustRow">'+icon("shield")+'<div><b>Seller & payment transparency</b><span>Seller information and policies are linked in the footer and checkout.</span></div></div>'+
      '</div>'+
      '<div class="highlights"><h3>Key highlights</h3><ul>'+
        '<li>Espresso, filter coffee and cold brew from one machine</li>'+
        '<li>Built-in conical burr grinder with 30 grind settings</li>'+
        '<li>19-bar pump pressure</li>'+
        '<li>1.5 L removable water tank</li>'+
        '<li>Automatic milk-frothing system</li>'+
      '</ul></div>'+
      '</aside></div></section>';
  }

  function tabs() {
    return '<section class="tabs"><div class="shell">'+
      '<div class="tabList"><button class="tabBtn active" data-tab="overview">Overview</button><button class="tabBtn" data-tab="specs">Technical specifications</button><button class="tabBtn" data-tab="box">In the box</button></div>'+
      '<div class="tabPanel" id="tabPanel"><p>The Solvane One Barista is a complete home-coffee system built around espresso, filter coffee and cold brew. Its integrated grinder keeps the bean-to-cup workflow in one machine while the milk-frothing system supports espresso-based drinks.</p></div>'+
      '</div></section>';
  }

  function editorial() {
    return '<section class="editorial"><div class="shell">'+
      '<article class="featureRow"><div class="media"><img src="'+PHOTOS[1]+'" alt="Espresso preparation"></div><div class="copy"><p class="kicker">VERSATILITY</p><h2>Three coffee styles. One machine.</h2><p>Move between espresso, filter coffee and cold brew without changing appliances. Product claims are limited to the specifications currently listed for this item.</p></div></article>'+
      '<article class="featureRow dark flip"><div class="media"><img src="'+PHOTOS[2]+'" alt="Freshly brewed coffee"></div><div class="copy"><p class="kicker">FRESHNESS</p><h2>Built-in conical burr grinder.</h2><p>Whole beans are ground immediately before brewing. Thirty grind settings give you control while keeping the workflow in one machine.</p></div></article>'+
      '<article class="featureRow"><div class="media"><img src="'+PHOTOS[0]+'" alt="Espresso brewing into a cup"></div><div class="copy"><p class="kicker">ESPRESSO</p><h2>19-bar pump pressure.</h2><p>The listed brewing specification includes a 19-bar pump, dedicated portafilter and milk-frothing workflow.</p></div></article>'+
      '</div></section>';
  }

  function benefits() {
    return '<section class="compare"><div class="shell"><h2 class="sectionTitle">Built around the daily ritual.</h2><p class="sectionLead">The storefront keeps the purchase path simple: product details first, policies before payment, and Shopify Checkout for the transaction.</p>'+
      '<div class="benefitCards">'+
      '<div class="benefitCard">'+icon("grind")+'<h3>Fresh-ground coffee</h3><p>Integrated conical burr grinder with 30 selectable grind settings.</p></div>'+
      '<div class="benefitCard">'+icon("cup")+'<h3>Multiple brew styles</h3><p>Espresso, filter coffee and cold brew are supported by one system.</p></div>'+
      '<div class="benefitCard">'+icon("droplet")+'<h3>Removable water tank</h3><p>1.5 litre removable reservoir for refilling and cleaning.</p></div>'+
      '</div></div></section>';
  }

  function complianceSection() {
    return '<section class="compare"><div class="shell"><h2 class="sectionTitle">Straightforward purchase information.</h2><p class="sectionLead">Before checkout is activated, the store requires verified seller details, fulfillment terms, product authorization and a live Shopify product variant.</p>'+
      '<div class="policyGrid">'+
      '<div class="policyBox"><h3>Seller identity</h3><p>Legal business name, address and customer-support contacts are published across the store.</p></div>'+
      '<div class="policyBox"><h3>Shipping expectations</h3><p>Processing time, delivery estimate and supported destinations are stated before payment.</p></div>'+
      '<div class="policyBox"><h3>Returns & refunds</h3><p>The return window, return-shipping responsibility and refund processing timeline are provided before purchase.</p></div>'+
      '<div class="policyBox"><h3>Shopify Checkout</h3><p>When enabled, the cart redirects to Shopify Checkout for delivery and payment completion.</p></div>'+
      '</div></div></section>';
  }

  function faq() {
    return '<section class="faq"><div class="shell"><h2 class="sectionTitle">Questions, answered.</h2>'+
      '<details><summary>What drinks can Solvane One make?<span>+</span></summary><p>The listed product specification supports espresso, filter coffee and cold brew, along with milk-based drinks using the frothing system.</p></details>'+
      '<details><summary>Does it grind whole beans?<span>+</span></summary><p>Yes. The listed specification includes a built-in conical burr grinder with 30 grind settings.</p></details>'+
      '<details><summary>What comes in the box?<span>+</span></summary><p>Open the “In the box” tab above for the current included-item list.</p></details>'+
      '<details><summary>How do shipping and returns work?<span>+</span></summary><p>Processing, delivery, return and refund terms are published before checkout is enabled and are linked from every page.</p></details>'+
      '</div></section>';
  }

  function productPage() {
    return usps()+productTop()+tabs()+editorial()+benefits()+complianceSection()+faq();
  }

  function pageHero(title, desc, kicker) {
    return '<section class="pageHero"><div class="shell"><p class="kicker">'+(kicker||"SOLVANE")+'</p><h1>'+title+'</h1><p>'+desc+'</p></div></section>';
  }

  function about() {
    return pageHero("Considered coffee equipment for everyday use.","Solvane focuses on clear product information, useful functionality and a straightforward buying experience.")+
      '<section class="content shell"><h2>What we sell</h2><p>Solvane One is presented as a home-coffee system combining grinding, espresso, filter coffee and cold brew.</p>'+
      '<h2>Product origin and authorization</h2><p>Checkout remains disabled until the seller confirms the right to market the product under the Solvane brand and verifies that the product delivered to customers matches the description and photography on this storefront.</p>'+
      '<h2>Customer-first information</h2><p>Shipping, returns, seller identity and support information are published before payment is enabled.</p></section>';
  }

  function policy(title, desc, sections) {
    return pageHero(title,desc,"CUSTOMER SERVICE")+
      '<section class="content shell">'+sections.map(function(s){return '<h2>'+s[0]+'</h2><p>'+s[1]+'</p>';}).join("")+'</section>';
  }

  function shipping() {
    return policy("Shipping policy","How Solvane processes, ships and tracks physical-product orders.",[
      ["Order processing",cfg.policies.processingTime || "Processing time will be published before checkout is enabled."],
      ["Delivery estimates",cfg.policies.deliveryEstimate || "Delivery estimates will be published before checkout is enabled."],
      ["Where we ship",cfg.policies.shippingRegions || "Shipping destinations will be published before checkout is enabled."],
      ["Tracking","A shipment confirmation with tracking will be sent after dispatch when carrier tracking is available."],
      ["Delays","If a material fulfillment delay occurs, we will contact the customer using the checkout contact details and provide updated expectations or available remedies."],
      ["Address accuracy","Customers should provide a complete delivery address and contact support promptly about corrections. Changes cannot be guaranteed after fulfillment begins."],
      ["Duties and taxes","Applicable taxes, duties or import charges are handled according to the destination and the Shopify Checkout configuration."]
    ]);
  }

  function returns() {
    return policy("Returns & refunds","Clear return and refund terms before purchase.",[
      ["Return window",cfg.policies.returnWindowDays ? cfg.policies.returnWindowDays+" days from the applicable delivery date." : "The return window will be published before checkout is enabled."],
      ["Eligibility","Returned items must meet the condition requirements stated at purchase. Used, damaged or incomplete items may be ineligible except where consumer law requires otherwise."],
      ["Damaged, defective or incorrect items","Contact support promptly with the order number and photographs when relevant. We will review the issue and provide an appropriate replacement, return or refund path."],
      ["Return shipping",cfg.policies.returnShippingResponsibility || "Return-shipping responsibility will be published before checkout is enabled."],
      ["Refund timing",cfg.policies.refundProcessingTime || "Refund processing time will be published before checkout is enabled."],
      ["Refund method","Approved refunds are sent to the original payment method. The customer’s financial institution may require additional time to post the credit."],
      ["How to start a return",cfg.business.supportEmail ? "Email "+cfg.business.supportEmail+" with your order number and reason for return." : "The support email will be published before checkout is enabled."]
    ]);
  }

  function privacy() {
    return policy("Privacy policy","How Solvane handles store, checkout and order information.",[
      ["Information we collect","We may collect contact, shipping, order, device, fraud-prevention and customer-support information needed to operate the store."],
      ["Shopify","When checkout is enabled, checkout and payment processing occur through Shopify. Information required to complete the order is shared with Shopify and relevant payment, fraud, fulfillment and delivery providers."],
      ["Payment information","This custom storefront does not collect or store full payment-card details."],
      ["How information is used","Information may be used to process and deliver orders, provide customer support, prevent fraud, meet legal obligations and improve store operations."],
      ["Privacy requests",cfg.business.supportEmail ? "Contact "+cfg.business.supportEmail+" for applicable privacy requests." : "A privacy contact channel will be published before checkout is enabled."]
    ]);
  }

  function terms() {
    return policy("Terms of sale & use","Terms governing purchases from and use of the Solvane store.",[
      ["Seller identity",cfg.business.legalName ? cfg.business.legalName+" trading as "+cfg.business.tradingName+"." : "The legal seller identity will be published before checkout is enabled."],
      ["Products and descriptions","We aim to keep descriptions, photographs, specifications, price and availability accurate. Checkout remains disabled until product identity and private-label authorization are confirmed."],
      ["Pricing and taxes","The product price is displayed before checkout. Applicable taxes and shipping charges, if any, are shown in Shopify Checkout before the customer places the order."],
      ["Order acceptance","Submitting checkout does not guarantee acceptance. Orders can be canceled or refunded for inventory errors, payment failure, suspected fraud, pricing errors or legal/compliance requirements."],
      ["Fulfillment","Orders are fulfilled according to the published shipping policy and the delivery expectations shown before purchase."],
      ["Returns and refunds","Returns and refunds are governed by the published Returns & Refunds policy and applicable consumer law."],
      ["Payment","When enabled, payment is completed in Shopify Checkout using the payment methods available for the customer’s market."]
    ]);
  }

  function contact() {
    let info = "";
    if (cfg.business.supportEmail) info += '<p><b>Email:</b> <a href="mailto:'+cfg.business.supportEmail+'"><u>'+cfg.business.supportEmail+'</u></a></p>';
    if (cfg.business.supportPhone) info += '<p><b>Phone:</b> '+cfg.business.supportPhone+'</p>';
    if (cfg.business.address) info += '<p><b>Business address:</b> '+cfg.business.address+'</p>';
    if (!info) info = '<div class="notice">Customer-service contact details will be published before checkout is enabled.</div>';
    return pageHero("Contact Solvane","Product, order, delivery and returns support.","SUPPORT")+
      '<section class="content shell">'+info+
      '<h2>What to include</h2><p>For order support, include your order number and the email address used at checkout. For damaged or incorrect items, include clear photographs when relevant.</p></section>';
  }

  function legalNotice() {
    return pageHero("Seller information","Legal and customer-service details for the Solvane store.","LEGAL")+
      '<section class="content shell">'+
      '<h2>Trading name</h2><p>'+cfg.business.tradingName+'</p>'+
      '<h2>Legal entity</h2><p>'+(cfg.business.legalName || "Published before checkout is enabled.")+'</p>'+
      '<h2>Company number</h2><p>'+(cfg.business.companyNumber || "Not provided / not applicable yet.")+'</p>'+
      '<h2>VAT number</h2><p>'+(cfg.business.vatNumber || "Not provided / not applicable yet.")+'</p>'+
      '<h2>Business address</h2><p>'+(cfg.business.address || "Published before checkout is enabled.")+'</p>'+
      '<h2>Customer support</h2><p>'+(cfg.business.supportEmail || "Support email pending")+(cfg.business.supportPhone ? " · "+cfg.business.supportPhone : "")+'</p>'+
      '</section>';
  }

  function track() {
    return pageHero("Track your order","Tracking information is supplied after fulfillment is connected.","ORDER STATUS")+
      '<section class="content shell"><div class="notice">Order tracking will be connected to the live Shopify fulfillment flow before checkout is enabled.</div></section>';
  }

  function success() {
    return pageHero("Order received","Shopify Checkout handles the final order confirmation and receipt.","ORDER");
  }

  function cancel() {
    return pageHero("Checkout canceled","No payment was completed.","CHECKOUT");
  }

  function notFound() {
    return pageHero("Page not found","The page you requested does not exist.");
  }

  function sellerCard() {
    let html = '<div class="sellerCard"><b>Seller</b>';
    html += '<span>'+(cfg.business.legalName || "Legal business name required before checkout")+'</span>';
    html += '<span>'+(cfg.business.address || "Business address required before checkout")+'</span>';
    html += '<span>'+(cfg.business.supportEmail || "Support email required before checkout")+'</span>';
    if (cfg.business.supportPhone) html += '<span>'+cfg.business.supportPhone+'</span>';
    if (cfg.business.companyNumber) html += '<span>Company no. '+cfg.business.companyNumber+'</span>';
    if (cfg.business.vatNumber) html += '<span>VAT '+cfg.business.vatNumber+'</span>';
    return html+'</div>';
  }

  function footer() {
    return '<footer class="footer"><div class="shell footerGrid">'+
      '<div><div class="wordmark">SOLVANE</div><p>Considered coffee equipment for everyday routines.</p>'+sellerCard()+'</div>'+
      '<div><h4>SHOP</h4><div class="links"><a href="/">Solvane One</a><a href="/track">Order tracking</a></div></div>'+
      '<div><h4>SUPPORT</h4><div class="links"><a href="/contact">Contact</a><a href="/shipping">Shipping</a><a href="/returns">Returns & refunds</a></div></div>'+
      '<div><h4>LEGAL</h4><div class="links"><a href="/legal-notice">Seller information</a><a href="/privacy">Privacy</a><a href="/terms">Terms of sale</a></div></div>'+
      '</div><div class="shell footerBottom"><span>© '+new Date().getFullYear()+' Solvane.</span><span>Checkout is completed through Shopify when store verification is complete.</span></div></footer>';
  }

  function drawer() {
    return '<div class="drawerBackdrop" id="backdrop"></div><aside class="drawer" id="drawer"><div class="drawerHead"><strong>Your cart</strong><button class="icon" id="close">×</button></div><div class="drawerBody" id="drawerBody"></div><div class="drawerFoot" id="drawerFoot"></div></aside>';
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem("solvane_cart") || '{"qty":0}'); }
    catch { return {qty:0}; }
  }

  function setCart(cart) {
    localStorage.setItem("solvane_cart",JSON.stringify(cart));
    renderCart();
  }

  function renderCart() {
    const c=getCart();
    const count=document.getElementById("cartCount");
    const body=document.getElementById("drawerBody");
    const foot=document.getElementById("drawerFoot");
    if (count) count.textContent=c.qty||0;
    if (!body || !foot) return;

    if (!c.qty) {
      body.innerHTML='<p style="text-align:center;color:#777;padding:70px 0">Your cart is empty.</p>';
      foot.innerHTML='';
      return;
    }

    body.innerHTML='<div class="cartItem"><img src="'+PHOTOS[0]+'" alt=""><div><b>'+cfg.product.shortName+'</b><div style="font-size:12px;color:#666;margin-top:4px">'+cfg.product.finish+'</div><div style="font-size:13px;margin-top:12px">Quantity: '+c.qty+'</div></div></div>';
    foot.innerHTML='<div class="subtotal"><span>Subtotal</span><span>'+money(cfg.product.priceCents*c.qty)+'</span></div>'+
      '<button class="btn" id="checkout" '+(ready?'':'disabled')+'>Continue to Shopify Checkout</button>'+
      (ready ? '' : '<p style="font-size:11px;color:#777;text-align:center">Checkout is disabled until verified seller, fulfillment and Shopify settings are complete.</p>');
    const checkoutBtn=document.getElementById("checkout");
    if (checkoutBtn && !checkoutBtn.disabled) checkoutBtn.addEventListener("click",function(){checkout(c.qty);});
  }

  function openDrawer() {
    document.getElementById("drawer").classList.add("open");
    document.getElementById("backdrop").classList.add("open");
  }

  function closeDrawer() {
    document.getElementById("drawer").classList.remove("open");
    document.getElementById("backdrop").classList.remove("open");
  }

  async function checkout(quantity) {
    if (!ready) {
      alert("Checkout is not available until store setup and verification are complete.");
      return;
    }
    if (GH) {
      alert("Checkout is disabled in the GitHub Pages preview.");
      return;
    }

    const endpoint="https://"+cfg.shopify.storeDomain+"/api/"+cfg.shopify.apiVersion+"/graphql.json";
    const params=new URLSearchParams(location.search);
    const attrs=[
      {key:"source",value:"solvane-custom-storefront"},
      {key:"landing_page",value:location.pathname}
    ];
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(function(k){
      const v=params.get(k);
      if (v) attrs.push({key:k,value:v.slice(0,120)});
    });

    const query='mutation CartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } warnings { code message } } }';

    try {
      const res=await fetch(endpoint,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "X-Shopify-Storefront-Access-Token":cfg.shopify.storefrontAccessToken
        },
        body:JSON.stringify({
          query:query,
          variables:{
            input:{
              lines:[{
                merchandiseId:cfg.shopify.variantId,
                quantity:Math.max(1,Math.min(10,Number(quantity)||1))
              }],
              attributes:attrs
            }
          }
        })
      });
      const data=await res.json();
      const payload=data && data.data && data.data.cartCreate;
      const errors=(payload && payload.userErrors) || data.errors || [];
      if (!res.ok || errors.length || !payload || !payload.cart || !payload.cart.checkoutUrl) {
        throw new Error(errors.map(function(e){return e.message;}).join(" · ") || "Shopify checkout is unavailable.");
      }
      location.href=payload.cart.checkoutUrl;
    } catch (e) {
      alert((e && e.message) || "Unable to open Shopify Checkout.");
    }
  }

  function adaptLinks() {
    if (!GH) return;
    document.querySelectorAll('a[href^="/"]').forEach(function(a){
      a.href=GH_BASE+"/?path="+encodeURIComponent(a.getAttribute("href"));
    });
  }

  function mount() {
    const queryPath=new URLSearchParams(location.search).get("path");
    const path=queryPath || (location.pathname.replace(/\/$/,"") || "/");
    const routes={
      "/":productPage,
      "/products/solvane-one":productPage,
      "/about":about,
      "/contact":contact,
      "/shipping":shipping,
      "/returns":returns,
      "/privacy":privacy,
      "/terms":terms,
      "/legal-notice":legalNotice,
      "/track":track,
      "/success":success,
      "/cancel":cancel
    };

    app.innerHTML=header()+(routes[path]||notFound)()+footer()+drawer()+
      '<div class="stickyBar"><div class="info"><b>'+cfg.product.shortName+'</b><span>'+money(cfg.product.priceCents)+'</span></div><button class="btn" id="stickyAdd">Add to cart</button></div>';

    adaptLinks();
    renderCart();

    document.getElementById("cartBtn")?.addEventListener("click",openDrawer);
    document.getElementById("close")?.addEventListener("click",closeDrawer);
    document.getElementById("backdrop")?.addEventListener("click",closeDrawer);

    document.querySelectorAll(".thumb").forEach(function(t){
      t.addEventListener("click",function(){
        document.querySelectorAll(".thumb").forEach(function(x){x.classList.remove("active");});
        t.classList.add("active");
        document.getElementById("mainImage").src=t.dataset.img;
      });
    });

    let q=1;
    const qEl=document.getElementById("qty");
    document.getElementById("minus")?.addEventListener("click",function(){q=Math.max(1,q-1);qEl.textContent=q;});
    document.getElementById("plus")?.addEventListener("click",function(){q++;qEl.textContent=q;});

    function addToCart() {
      const c=getCart();
      c.qty=(c.qty||0)+q;
      setCart(c);
      openDrawer();
    }

    document.getElementById("add")?.addEventListener("click",addToCart);
    document.getElementById("stickyAdd")?.addEventListener("click",addToCart);
    document.getElementById("buyNow")?.addEventListener("click",function(){checkout(q);});

    document.querySelectorAll(".tabBtn").forEach(function(b){
      b.addEventListener("click",function(){
        document.querySelectorAll(".tabBtn").forEach(function(x){x.classList.remove("active");});
        b.classList.add("active");
        const id=b.dataset.tab;
        const panel=document.getElementById("tabPanel");

        if (id==="overview") {
          panel.innerHTML='<p>The Solvane One Barista is a complete home-coffee system built around espresso, filter coffee and cold brew. Its integrated grinder keeps the bean-to-cup workflow in one machine while the milk-frothing system supports espresso-based drinks.</p>';
        }
        if (id==="specs") {
          panel.innerHTML='<table class="spec">'+cfg.product.verifiedSpecs.map(function(x){return '<tr><th>'+x[0]+'</th><td>'+x[1]+'</td></tr>';}).join("")+'</table>';
        }
        if (id==="box") {
          panel.innerHTML='<ul class="boxlist">'+cfg.product.includedItems.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul>';
        }
      });
    });
  }

  mount();
})();