(() => {
  const FALLBACK_URL = "https://buy.stripe.com/dRm8wP0zvfL85qZdyNfYY0z";
  const PRODUCT_AMOUNT = 11999;
  let currentStep = 1;
  let stripe = null;
  let elements = null;
  let paymentElement = null;
  let clientSecret = null;
  let config = null;

  const $ = (id) => document.getElementById(id);
  const message = $("checkout-message");

  function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = "message " + type;
  }
  function clearMessage() {
    message.textContent = "";
    message.className = "message hidden";
  }
  function setStep(step) {
    currentStep = step;
    document.querySelectorAll(".checkout-step").forEach(el => {
      el.classList.toggle("active", Number(el.dataset.step) === step);
    });
    document.querySelectorAll("[data-step-indicator]").forEach(el => {
      el.classList.toggle("active", Number(el.dataset.stepIndicator) === step);
    });
    clearMessage();
    window.scrollTo({top: 0, behavior: "smooth"});
  }
  function required(ids) {
    let ok = true;
    ids.forEach(id => {
      const el = $(id);
      const valid = el && el.value.trim() && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      if (!valid) {
        ok = false;
        el && (el.style.borderColor = "#b91c1c");
      } else if (el) {
        el.style.borderColor = "";
      }
    });
    return ok;
  }
  function customerPayload() {
    return {
      fullName: $("fullName").value.trim(),
      email: $("email").value.trim(),
      phone: $("phone").value.trim(),
      address: {
        line1: $("line1").value.trim(),
        line2: $("line2").value.trim(),
        city: $("city").value.trim(),
        postal_code: $("postcode").value.trim(),
        country: $("country").value
      }
    };
  }
  async function loadConfig() {
    try {
      const res = await fetch("/api/stripe-config", {cache: "no-store"});
      config = await res.json();
    } catch (_) {
      config = {available:false, fallbackUrl:FALLBACK_URL};
    }
    $("fallbackLink").href = (config && config.fallbackUrl) || FALLBACK_URL;
  }
  async function setupPayment() {
    if (!config) await loadConfig();
    if (!config.available || !config.publishableKey) {
      $("embedded-payment").classList.add("hidden");
      $("stripe-fallback").classList.remove("hidden");
      return;
    }
    $("embedded-payment").classList.remove("hidden");
    $("stripe-fallback").classList.add("hidden");
    if (elements) return;

    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(customerPayload())
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      throw new Error(data.error || "Unable to start secure payment.");
    }

    clientSecret = data.clientSecret;
    stripe = Stripe(config.publishableKey);
    elements = stripe.elements({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#111111",
          colorText: "#111111",
          colorDanger: "#b91c1c",
          fontFamily: "Inter, Arial, sans-serif",
          borderRadius: "9px",
          spacingUnit: "4px"
        },
        rules: {
          ".Input": {border: "1px solid #d1d5db", boxShadow: "none"},
          ".Input:focus": {border: "1px solid #111111", boxShadow: "0 0 0 2px rgba(17,17,17,.06)"}
        }
      }
    });
    paymentElement = elements.create("payment", {layout:"tabs"});
    paymentElement.mount("#payment-element");
  }

  $("toDelivery").addEventListener("click", () => {
    if (!required(["fullName","email","phone"])) {
      showMessage("Please complete your contact information.");
      return;
    }
    setStep(2);
  });

  $("toPayment").addEventListener("click", async () => {
    if (!required(["line1","city","postcode"])) {
      showMessage("Please complete your delivery address.");
      return;
    }
    setStep(3);
    try {
      await setupPayment();
    } catch (err) {
      $("embedded-payment").classList.add("hidden");
      $("stripe-fallback").classList.remove("hidden");
      showMessage(err.message || "Secure payment is temporarily unavailable here. Continue with Stripe instead.");
    }
  });

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => setStep(Number(btn.dataset.back)));
  });

  $("payButton").addEventListener("click", async () => {
    if (!stripe || !elements) {
      window.location.href = (config && config.fallbackUrl) || FALLBACK_URL;
      return;
    }
    clearMessage();
    $("payButton").disabled = true;
    $("spinner").classList.remove("hidden");
    $("payButtonText").textContent = "Processing...";

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/checkout-success.html"
      },
      redirect: "if_required"
    });

    if (error) {
      showMessage(error.message || "Payment could not be completed.");
      $("payButton").disabled = false;
      $("spinner").classList.add("hidden");
      $("payButtonText").textContent = "Pay £119.99";
      return;
    }

    window.location.href = "/checkout-success.html?payment_intent_client_secret=" + encodeURIComponent(clientSecret);
  });

  loadConfig();
})();