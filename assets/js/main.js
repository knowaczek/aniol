/* ANIOŁ — redesign 2026 — interakcje */
(function () {
  "use strict";
  var doc = document;

  /* ---------- Active nav link (by filename) ---------- */
  (function () {
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!page) page = "index.html";
    doc.querySelectorAll('.nav a, .mobile-nav a').forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === page) {
        a.classList.add("active");
        var item = a.closest(".nav__item");
        if (item) item.classList.add("active");
      }
    });
    // mark "Oferta" parent active on any offer sub-page
    if (page.indexOf("oferta") === 0) {
      var ofItem = doc.querySelector('.nav__item.has-children');
      if (ofItem) ofItem.classList.add("active");
    }
  })();

  /* ---------- Header: solid on scroll ---------- */
  var header = doc.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = doc.querySelector(".burger");
  var mobileNav = doc.querySelector(".mobile-nav");
  function toggleMenu(open) {
    doc.body.classList.toggle("menu-open", open);
  }
  if (burger) {
    burger.addEventListener("click", function () {
      toggleMenu(!doc.body.classList.contains("menu-open"));
    });
  }
  if (mobileNav) {
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") toggleMenu(false);
    });
  }
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { toggleMenu(false); closeLightbox(); }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = doc.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = doc.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.getAttribute("data-count"), 10), start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1400, 1);
          el.firstChild.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Gallery filter ---------- */
  var filterBtns = doc.querySelectorAll(".filter-btn");
  var items = doc.querySelectorAll(".g-item");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      items.forEach(function (it) {
        var show = cat === "all" || it.getAttribute("data-cat") === cat;
        it.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = doc.querySelector(".lightbox");
  var lbImg = lightbox ? lightbox.querySelector("img") : null;
  var galleryLinks = [].slice.call(doc.querySelectorAll(".g-item"));
  var current = 0;
  function visibleLinks() { return galleryLinks.filter(function (l) { return !l.classList.contains("hide"); }); }
  function openLightbox(idx) {
    var list = visibleLinks();
    current = idx;
    var src = list[current].getAttribute("href") || list[current].dataset.full;
    lbImg.src = src;
    lightbox.classList.add("open");
    doc.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    doc.body.style.overflow = "";
  }
  function step(dir) {
    var list = visibleLinks();
    current = (current + dir + list.length) % list.length;
    lbImg.src = list[current].getAttribute("href") || list[current].dataset.full;
  }
  galleryLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (!lightbox) return;
      e.preventDefault();
      openLightbox(visibleLinks().indexOf(link));
    });
  });
  if (lightbox) {
    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
    lightbox.querySelector(".lb-next").addEventListener("click", function () { step(1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    doc.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------- Cookie banner ---------- */
  var cookie = doc.querySelector(".cookie");
  if (cookie) {
    try {
      if (!localStorage.getItem("aniol_cookie_ok")) {
        setTimeout(function () { cookie.classList.add("show"); }, 1200);
      }
    } catch (e) { setTimeout(function () { cookie.classList.add("show"); }, 1200); }
    cookie.querySelectorAll("[data-cookie-accept]").forEach(function (b) {
      b.addEventListener("click", function () {
        try { localStorage.setItem("aniol_cookie_ok", "1"); } catch (e) {}
        cookie.classList.remove("show");
      });
    });
  }

  /* ---------- Contact form: front-end validation hint ---------- */
  var form = doc.querySelector("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        if ((f.type === "checkbox" && !f.checked) || (!f.value || !f.value.trim())) {
          ok = false; f.style.borderColor = "#b05046";
        } else { f.style.borderColor = ""; }
      });
      if (!ok) {
        e.preventDefault();
        var alert = form.querySelector(".form-alert");
        if (alert) { alert.className = "form-alert err"; alert.textContent = "Proszę poprawnie wypełnić wszystkie wymagane pola."; alert.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }
    });
  }

  /* ---------- Contact form: result message (?sent=) ---------- */
  if (form) {
    var params = new URLSearchParams(location.search);
    var sent = params.get("sent");
    if (sent !== null) {
      var box = form.querySelector(".form-alert");
      if (box) {
        if (sent === "1") {
          box.className = "form-alert ok";
          box.textContent = "Dziękujemy — wiadomość została wysłana. Odezwiemy się najszybciej, jak to możliwe.";
          form.reset();
        } else {
          box.className = "form-alert err";
          box.textContent = "Nie udało się wysłać wiadomości. Prosimy spróbować ponownie lub zadzwonić: +48 500 073 188.";
        }
        box.style.display = "block";
      }
    }
  }

  /* ---------- Footer year ---------- */
  var y = doc.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
