const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");
const {createSmegCheckoutHandler} = require("./lib/smeg-checkout");

const root = __dirname;
const port = process.env.PORT || 3000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || "";
const smegCheckout = createSmegCheckoutHandler({
  stripe: STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {maxNetworkRetries: 2, timeout: 20000}) : null,
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ""
});
const STRIPE_FALLBACK_URL = "https://buy.stripe.com/dRm8wP0zvfL85qZdyNfYY0z";
const PRODUCT = {
  name: "Ninja Luxe Café Premier Espresso Machine",
  productId: "prod_VO0d8Vl8f2i0z7",
  priceId: "price_1UNEccFZRVUAUR7G8NRI1kEg",
  amount: 11999,
  currency: "gbp"
};

const types = {
  ".html":"text/html; charset=utf-8",
  ".js":"application/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".mp4":"video/mp4",
  ".webm":"video/webm"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type":"application/json; charset=utf-8",
    "Cache-Control":"no-store"
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (_) { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function stripeRequest(method, stripePath, params) {
  return new Promise((resolve, reject) => {
    const body = params ? new URLSearchParams(params).toString() : "";
    const req = https.request({
      hostname: "api.stripe.com",
      path: stripePath,
      method,
      headers: {
        "Authorization": "Bearer " + STRIPE_SECRET_KEY,
        ...(body ? {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body)
        } : {})
      }
    }, response => {
      let data = "";
      response.on("data", chunk => data += chunk);
      response.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(data || "{}"); }
        catch (_) { return reject(new Error("Invalid Stripe response")); }
        if (response.statusCode >= 200 && response.statusCode < 300) return resolve(parsed);
        const message = parsed && parsed.error && parsed.error.message ? parsed.error.message : "Stripe request failed";
        const err = new Error(message);
        err.statusCode = response.statusCode;
        reject(err);
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

http.createServer(async (req,res)=>{
  const host = (req.headers.host || "").split(":")[0].toLowerCase();

  if (host === "www.sharkninja.site") {
    res.writeHead(301, {
      "Location": "https://sharkninja.site" + (req.url || "/"),
      "Cache-Control": "public, max-age=3600"
    });
    return res.end();
  }

  const url = new URL(req.url, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);

  if (await smegCheckout(req, res, url)) return;

  if (req.method === "GET" && pathname === "/api/stripe-config") {
    return sendJson(res, 200, {
      available: Boolean(STRIPE_SECRET_KEY && STRIPE_PUBLISHABLE_KEY),
      publishableKey: STRIPE_PUBLISHABLE_KEY || null,
      fallbackUrl: STRIPE_FALLBACK_URL,
      product: {
        name: PRODUCT.name,
        amount: PRODUCT.amount,
        currency: PRODUCT.currency,
        productId: PRODUCT.productId,
        priceId: PRODUCT.priceId
      }
    });
  }

  if (req.method === "POST" && pathname === "/api/create-payment-intent") {
    if (!STRIPE_SECRET_KEY || !STRIPE_PUBLISHABLE_KEY) {
      return sendJson(res, 503, {
        error: "Embedded Stripe checkout is not configured on this server.",
        fallbackUrl: STRIPE_FALLBACK_URL
      });
    }

    try {
      const data = await readJson(req);
      const fullName = String(data.fullName || "").trim();
      const email = String(data.email || "").trim();
      const phone = String(data.phone || "").trim();
      const address = data.address || {};
      const line1 = String(address.line1 || "").trim();
      const line2 = String(address.line2 || "").trim();
      const city = String(address.city || "").trim();
      const postalCode = String(address.postal_code || "").trim();

      if (!fullName || !validEmail(email) || !phone || !line1 || !city || !postalCode) {
        return sendJson(res, 400, {error:"Please complete all required checkout fields."});
      }

      const params = {
        amount: String(PRODUCT.amount),
        currency: PRODUCT.currency,
        "automatic_payment_methods[enabled]": "true",
        receipt_email: email,
        description: PRODUCT.name,
        "metadata[source_site]": "sharkninja.site",
        "metadata[product_id]": PRODUCT.productId,
        "metadata[price_id]": PRODUCT.priceId,
        "shipping[name]": fullName,
        "shipping[phone]": phone,
        "shipping[address][line1]": line1,
        "shipping[address][city]": city,
        "shipping[address][postal_code]": postalCode,
        "shipping[address][country]": "GB"
      };
      if (line2) params["shipping[address][line2]"] = line2;

      const intent = await stripeRequest("POST", "/v1/payment_intents", params);
      return sendJson(res, 200, {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id
      });
    } catch (err) {
      console.error("Stripe PaymentIntent error:", err.message);
      return sendJson(res, err.statusCode || 500, {
        error: "Unable to start secure payment. Please try again or continue with Stripe."
      });
    }
  }

  if (req.method === "GET" && pathname === "/api/checkout-session-status") {
    if (!STRIPE_SECRET_KEY) return sendJson(res, 503, {error:"Stripe verification unavailable"});
    const sessionId = url.searchParams.get("session_id") || "";
    if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId)) {
      return sendJson(res, 400, {error:"Invalid checkout session"});
    }
    try {
      const session = await stripeRequest("GET", "/v1/checkout/sessions/" + encodeURIComponent(sessionId));
      return sendJson(res, 200, {
        paid: session.payment_status === "paid",
        status: session.status || null,
        paymentStatus: session.payment_status || null
      });
    } catch (err) {
      return sendJson(res, err.statusCode || 500, {error:"Unable to verify checkout session"});
    }
  }

  let file = path.join(root, pathname === "/" ? "index.html" : pathname.replace(/^\//,""));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }

  fs.stat(file,(err,st)=>{
    if (!err && st.isDirectory()) {
      file = path.join(file, "index.html");
      return fs.stat(file,(dirErr,dirStat)=>{
        if (!dirErr && dirStat.isFile()) {
          res.writeHead(200,{
            "Content-Type":"text/html; charset=utf-8",
            "Cache-Control":"no-cache"
          });
          return fs.createReadStream(file).pipe(res);
        }
        fs.createReadStream(path.join(root,"index.html"))
          .on("error",()=>{res.writeHead(404);res.end("Not found");})
          .once("open",()=>res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"}))
          .pipe(res);
      });
    }

    if (!err && st.isFile()) {
      res.writeHead(200,{
        "Content-Type":types[path.extname(file).toLowerCase()]||"application/octet-stream",
        "Cache-Control": path.extname(file).toLowerCase() === ".html" ? "no-cache" : "public, max-age=3600"
      });
      return fs.createReadStream(file).pipe(res);
    }

    fs.createReadStream(path.join(root,"index.html"))
      .on("error",()=>{res.writeHead(404);res.end("Not found");})
      .once("open",()=>res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"}))
      .pipe(res);
  });
}).listen(port, "0.0.0.0", ()=>console.log("Listening on",port));
