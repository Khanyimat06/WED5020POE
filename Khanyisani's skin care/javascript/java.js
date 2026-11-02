(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Data (dynamic content) ---------- */
  var PRODUCTS = [
    { name: "Glow Starter Kit", type: "combo", items: "Scrub + Cleanser + Moisturizer", price: 550, was: 650 },
    { name: "Clear Skin Kit", type: "combo", items: "Cleanser + Serum + Spot Treatment", price: 580, was: 660 },
    { name: "Full Glow Bundle", type: "combo", items: "All 5 products", price: 950, was: 1100 },
    { name: "Gentle Exfoliating Scrub", type: "standalone", items: "Deep clean pores. Smooth texture.", price: 210 },
    { name: "Clear Pores Cleanser", type: "standalone", items: "Removes dirt and oil without stripping skin.", price: 210 },
    { name: "Daily Hydration Moisturizer", type: "standalone", items: "Locks in moisture for soft skin.", price: 230 },
    { name: "Bright Skin Serum", type: "standalone", items: "Helps fade dark spots.", price: 250 },
    { name: "Targeted Spot Treatment", type: "standalone", items: "Targets stubborn pimples.", price: 200 }
  ];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- Scroll reveal animation + back to top ---------- */
  function initAnimations() {
    var items = $$("main > *");
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (i) { i.classList.add("reveal"); io.observe(i); });

    var btn = el("button", "back-to-top", "↑");
    btn.type = "button";
    btn.setAttribute("aria-label", "Back to top");
    btn.hidden = true;
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(btn);
    window.addEventListener("scroll", function () { btn.hidden = window.scrollY < 400; });
  }

  /* ---------- Accordion (about page) ---------- */
  function initAccordion() {
    $$(".accordion-header").forEach(function (btn) {
      var panel = btn.nextElementSibling;
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      });
    });
  }

  /* ---------- Gallery lightbox (services page) ---------- */
  function initLightbox() {
    var imgs = $$(".card img, .gallery img");
    if (!imgs.length) return;
    var idx = 0;
    var box = el("div", "lightbox");
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    var big = el("img");
    var cap = el("p", "lightbox-caption");
    var close = el("button", "lightbox-btn lightbox-close", "×");
    var prev = el("button", "lightbox-btn lightbox-prev", "‹");
    var next = el("button", "lightbox-btn lightbox-next", "›");
    close.setAttribute("aria-label", "Close");
    prev.setAttribute("aria-label", "Previous image");
    next.setAttribute("aria-label", "Next image");
    [prev, big, next, close, cap].forEach(function (n) { box.appendChild(n); });
    document.body.appendChild(box);

    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      big.src = imgs[idx].src;
      big.alt = imgs[idx].alt;
      cap.textContent = imgs[idx].alt + "  \u00b7  " + (idx + 1) + " / " + imgs.length;
      box.hidden = false;
      close.focus();
    }
    function hide() { box.hidden = true; imgs[idx].focus(); }

    imgs.forEach(function (img, i) {
      img.tabIndex = 0;
      img.addEventListener("click", function () { show(i); });
      img.addEventListener("keydown", function (e) { if (e.key === "Enter") show(i); });
    });
    close.addEventListener("click", hide);
    prev.addEventListener("click", function () { show(idx - 1); });
    next.addEventListener("click", function () { show(idx + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) hide(); });
    var startX = null;
    box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(dx < 0 ? idx + 1 : idx - 1);
      startX = null;
    });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Pricing: dynamic list + search / filter / sort ---------- */
  function initPricing() {
    var list = $("#product-list");
    if (!list) return;
    var q = $("#product-search"), f = $("#product-filter"), s = $("#product-sort"), count = $("#product-count");
    function render() {
      var term = q.value.trim().toLowerCase();
      var rows = PRODUCTS.filter(function (p) {
        return (f.value === "all" || p.type === f.value) && (p.name + " " + p.items).toLowerCase().indexOf(term) !== -1;
      });
      if (s.value === "price-asc") rows.sort(function (a, b) { return a.price - b.price; });
      if (s.value === "price-desc") rows.sort(function (a, b) { return b.price - a.price; });
      if (s.value === "name") rows.sort(function (a, b) { return a.name.localeCompare(b.name); });
      list.replaceChildren();
      rows.forEach(function (p) {
        var card = el("article", "product-card");
        card.appendChild(el("h3", "", p.name));
        card.appendChild(el("p", "", p.items));
        var price = el("p", "price", "R" + p.price);
        if (p.was) {
          var was = el("s", "was", " R" + p.was);
          price.appendChild(was);
          price.appendChild(el("span", "save", " Save R" + (p.was - p.price)));
        }
        card.appendChild(price);
        card.appendChild(el("span", "tag", p.type === "combo" ? "Kit" : "Single product"));
        list.appendChild(card);
      });
      count.textContent = rows.length ? rows.length + " product(s) shown" : "No products match your search.";
    }
    q.addEventListener("input", render);
    f.addEventListener("change", render);
    s.addEventListener("change", render);
    render();
  }

  /* ---------- Form validation ---------- */
  var RULES = {
    name: function (v) { return /^[A-Za-zÀ-ÿ'’ -]{2,50}$/.test(v) || "Please enter a valid name (letters only, 2–50 characters)."; },
    surname: function (v) { return /^[A-Za-zÀ-ÿ'’ -]{2,50}$/.test(v) || "Please enter a valid surname (letters only, 2–50 characters)."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Please enter a valid email address, e.g. name@example.com."; },
    phonenumber: function (v) { return /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, "")) || "Enter a valid South African number, e.g. 012 851 0938 or +27 82 123 4567."; },
    message: function (v) { return (v.length >= 10 && v.length <= 500) || "Your message must be 10–500 characters long."; }
  };

  function setError(field, msg) {
    var id = field.id + "-error";
    var span = document.getElementById(id);
    if (!span) {
      span = el("span", "error");
      span.id = id;
      span.setAttribute("role", "alert");
      field.insertAdjacentElement("afterend", span);
    }
    span.textContent = msg || "";
    field.classList.toggle("invalid", !!msg);
    field.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) field.setAttribute("aria-describedby", id);
  }

  function checkField(field) {
    var v = field.value.trim();
    if (field.required && !v) { setError(field, "This field is required."); return false; }
    var rule = RULES[field.name];
    var res = rule ? rule(v) : true;
    setError(field, res === true ? "" : res);
    return res === true;
  }

  function initForm(form, onValid) {
    if (!form) return;
    var fields = $$("input, select, textarea", form);
    fields.forEach(function (fld) {
      fld.addEventListener("blur", function () { checkField(fld); });
      fld.addEventListener("input", function () { if (fld.classList.contains("invalid")) checkField(fld); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      fields.forEach(function (fld) {
        if (!checkField(fld)) { ok = false; if (!firstBad) firstBad = fld; }
      });
      if (!ok) { firstBad.focus(); return; }
      var data = {};
      fields.forEach(function (fld) { data[fld.name] = fld.value.trim(); });
      onValid(data, form);
    });
  }

  /* AJAX submit: only sends if a real endpoint (e.g. Formspree) is set in the form's action */
  function send(form, data) {
    var url = form.getAttribute("action");
    if (!url || url === "#" || url.indexOf("YOUR_FORM_ID") !== -1 || url.indexOf("mailto:") === 0) {
      return Promise.resolve({ ok: true });
    }
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return { ok: r.ok }; }).catch(function () { return { ok: false }; });
  }

  function showResult(box, title, lines, isError) {
    box.replaceChildren();
    box.className = "form-result" + (isError ? " form-result-error" : "");
    box.appendChild(el("h3", "", title));
    lines.forEach(function (l) { box.appendChild(el("p", "", l)); });
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------- Enquiry form ---------- */
  function initEnquiry() {
    var form = $("#enquiry-form");
    if (!form) return;
    var type = $("#enquiryType"), product = $("#product"), out = $("#form-result");
    type.addEventListener("change", function () {
      product.replaceChildren();
      var first = el("option", "", "Choose an option");
      first.value = ""; first.disabled = true; first.selected = true;
      product.appendChild(first);
      PRODUCTS.filter(function (p) { return p.type === type.value; }).forEach(function (p) {
        var o = el("option", "", p.name + " – R" + p.price);
        o.value = p.name;
        product.appendChild(o);
      });
      setError(product, "");
    });
    initForm(form, function (data) {
      var p = PRODUCTS.filter(function (x) { return x.name === data.product; })[0];
      send(form, data).then(function (res) {
        if (!res.ok) {
          showResult(out, "Sorry, something went wrong", ["We couldn’t send your enquiry. Please try again or call 012 851 0938."], true);
          return;
        }
        var lines = [p.name + " (" + p.items + ") costs R" + p.price + "." + (p.was ? " That saves you R" + (p.was - p.price) + " compared with buying separately." : "")];
        lines.push("It is available at Shop 15, Centurion Mall (Mon–Sat, 9am–5pm), or we courier nationwide in 2–3 business days.");
        lines.push("We’ll contact you on " + data.phonenumber + " or " + data.email + " to confirm.");
        showResult(out, "Thank you, " + data.name + "!", lines, false);
        form.reset();
        type.dispatchEvent(new Event("change"));
      });
    });
  }

  /* ---------- Contact form (compiled into an email) ---------- */
  function initContact() {
    var form = $("#contact-form");
    if (!form) return;
    var out = $("#form-result");
    initForm(form, function (data) {
      var to = form.getAttribute("action").replace("mailto:", "");
      var subject = "[" + data.messageType + "] Message from " + data.name + " " + data.surname;
      var body = "Name: " + data.name + " " + data.surname + "\nEmail: " + data.email +
        "\nPhone: " + data.phonenumber + "\nType: " + data.messageType + "\n\n" + data.message;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      showResult(out, "Almost done, " + data.name + "!", ["Your email app should now open with your message ready to send to " + to + ". Press send there to finish."], false);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initAnimations();
    initAccordion();
    initLightbox();
    initPricing();
    initEnquiry();
    initContact();
  });
})();