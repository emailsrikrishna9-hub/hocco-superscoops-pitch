/* Pitch-first layer on top of the v1 HOCCO site: routes (landing, #plan, #talk), in-page overlays
   (planner, document reader, vertical film) so nothing navigates away, source drawer, est. popovers, copy buttons,
   image prefetch for instant route switches. Content stays visible without this file. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SITE = window.SITE || { sources: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- routes ---------------- */
  var routes = { "": "landing", plan: "plan", talk: "talk" };
  var mem = {}, current = null;
  function parse() {
    var h = (location.hash || "").replace(/^#/, "");
    if (routes.hasOwnProperty(h)) return { route: routes[h], anchor: null };
    if (h.indexOf("ch-") === 0 || h === "plan-top") return { route: "plan", anchor: h };
    return { route: "landing", anchor: null };
  }
  function show(st) {
    if (current) mem[current] = window.scrollY;
    $$("[data-route]").forEach(function (s) { s.hidden = s.getAttribute("data-route") !== st.route; });
    doc.setAttribute("data-page", st.route);
    $$("[data-nav]").forEach(function (a) { if (a.getAttribute("data-nav") === st.route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var changed = current !== st.route; current = st.route;
    if (changed) {
      $$("[data-route='" + st.route + "'] .reveal").forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight * 1.2) el.classList.add("in"); });
    }
    if (st.anchor) {
      var el = document.getElementById(st.anchor);
      if (el) requestAnimationFrame(function () { el.scrollIntoView({ behavior: changed || reduce ? "auto" : "smooth", block: "start" }); });
    } else if (changed) {
      window.scrollTo(0, mem[st.route] || 0);
      if (st.route !== "landing") { var h1 = $("[data-route='" + st.route + "'] h1"); if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); } }
    }
    if (changed && window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 60);
    window.dispatchEvent(new Event("scroll"));
  }
  window.addEventListener("hashchange", function () { show(parse()); });

  /* ---------------- chapter nav state ---------------- */
  if ("IntersectionObserver" in window) {
    var links = $$(".chapnav__list a");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id); });
        var on = $(".chapnav__list a[aria-current]"), bar = $(".chapnav__list");
        if (on && bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: on.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (a) { var t = document.getElementById(a.getAttribute("href").slice(1)); if (t) io.observe(t); });
  }

  /* ---------------- overlays ---------------- */
  var lastFocus = null;
  function openOv(ov) { lastFocus = document.activeElement; ov.hidden = false; doc.classList.add("ov-open"); requestAnimationFrame(function () { ov.classList.add("open"); var c = $(".overlay__close", ov); if (c) c.focus(); }); }
  function closeOv(ov) {
    ov.classList.remove("open"); doc.classList.remove("ov-open");
    var v = $("video", ov); if (v) v.pause();
    setTimeout(function () { ov.hidden = true; }, reduce ? 0 : 200);
    if (lastFocus) lastFocus.focus();
  }
  var docs = {
    case: { title: "The full case, 20 pages", pages: 20, path: function (i) { return "assets/img/case/p" + (i < 10 ? "0" : "") + i + ".webp"; }, w: 909, h: 1287 }
  };
  document.addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-expand]"))) {
      var ov = document.getElementById("ov-" + t.getAttribute("data-expand"));
      var body = $(".overlay__body", ov);
      if (!$("iframe", body)) { var f = document.createElement("iframe"); f.src = body.getAttribute("data-frame"); f.title = "Superscoops launch planner"; body.appendChild(f); }
      openOv(ov); return;
    }
    if ((t = e.target.closest("[data-viewer]"))) {
      var d = docs[t.getAttribute("data-viewer")], ovv = document.getElementById("ov-viewer"), pg = $(".overlay__pages", ovv);
      $(".overlay__title", ovv).textContent = d.title; pg.innerHTML = "";
      for (var i = 1; i <= d.pages; i++) { var im = new Image(); im.src = d.path(i); im.width = d.w; im.height = d.h; im.alt = d.title + ", page " + i; im.loading = i > 2 ? "lazy" : "eager"; pg.appendChild(im); }
      pg.scrollTop = 0; openOv(ovv); return;
    }
    if ((t = e.target.closest("[data-video]"))) {
      var ovd = document.getElementById("ov-video"), box = $(".overlay__video", ovd);
      box.innerHTML = '<video controls playsinline autoplay src="' + t.getAttribute("data-video") + '"></video>';
      openOv(ovd); return;
    }
    if ((t = e.target.closest(".overlay__close"))) { closeOv(t.closest(".overlay")); return; }
    if (e.target.classList && e.target.classList.contains("overlay")) closeOv(e.target);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var o = $(".overlay.open"); if (o) closeOv(o);
    closeSource(); closePops();
  });

  /* ---------------- sources drawer ---------------- */
  var drawer = $("#sources-drawer"), srcFocus = null;
  function openSource(id) {
    var s = SITE.sources[id]; if (!drawer || !s) return;
    srcFocus = document.activeElement;
    $(".sd-title", drawer).textContent = s.title; $(".sd-pub", drawer).textContent = s.publisher || "";
    var ev = $(".sd-ev", drawer); ev.textContent = (SITE.evLabels || {})[s.type || "third"] || ""; ev.className = "sd-ev ev ev--" + (s.type || "third");
    $(".sd-note", drawer).textContent = s.note || "";
    var a = $(".sd-link", drawer);
    if (s.url) { a.href = s.url; a.textContent = s.url.replace(/^https?:\/\//, "").slice(0, 64) + (s.url.length > 72 ? "..." : ""); a.hidden = false; } else a.hidden = true;
    drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add("open"); $(".sd-close", drawer).focus(); });
  }
  function closeSource() { if (!drawer || drawer.hidden) return; drawer.classList.remove("open"); setTimeout(function () { drawer.hidden = true; }, reduce ? 0 : 200); if (srcFocus) srcFocus.focus(); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-src]"); if (b) { e.preventDefault(); openSource(b.getAttribute("data-src")); return; }
    if (e.target.closest(".sd-close") || (e.target.classList && e.target.classList.contains("sd-scrim"))) closeSource();
  });

  /* ---------------- est. popovers ---------------- */
  function closePops(keep) { $$(".pop[data-open]").forEach(function (p) { if (p === keep) return; p.removeAttribute("data-open"); var t = $("[aria-controls='" + p.id + "']"); if (t) t.setAttribute("aria-expanded", "false"); }); }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-pop]");
    if (t) { var p = document.getElementById(t.getAttribute("aria-controls")), open = p.hasAttribute("data-open"); closePops(p); if (open) { p.removeAttribute("data-open"); t.setAttribute("aria-expanded", "false"); } else { p.setAttribute("data-open", ""); t.setAttribute("aria-expanded", "true"); } return; }
    if (!e.target.closest(".pop")) closePops();
  });

  /* ---------------- copy buttons ---------------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]"); if (!b) return;
    var text = b.getAttribute("data-copy"), lab = $("span", b) || b, old = lab.textContent;
    var done = function () { lab.textContent = "Copied"; setTimeout(function () { lab.textContent = old; }, 1400); };
    var fb = function () { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (x) {} ta.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fb); else fb();
  });

  /* ---------------- prefetch every route's images once the landing is up ---------------- */
  function prefetch() {
    var seen = {};
    $$("[data-route] img").forEach(function (img) {
      var s = img.getAttribute("src"); if (!s || seen[s]) return; seen[s] = 1;
      var p = new Image(); p.decoding = "async"; p.src = s;
    });
    ["assets/img/case/p01.webp", "assets/img/case/p02.webp"].forEach(function (s) { var p = new Image(); p.src = s; });
  }
  window.addEventListener("load", function () { (window.requestIdleCallback || function (f) { setTimeout(f, 400); })(prefetch); });

  show(parse());
})();
