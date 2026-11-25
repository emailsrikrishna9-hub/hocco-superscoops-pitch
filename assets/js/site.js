/* Sri Krishna portfolio, HOCCO edition: progressive enhancement only.
   Everything is visible without this file. Values written with textContent stay ASCII. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- theme toggle (localStorage in try/catch, never follows the OS; cream leads) ---------- */
  var toggle = document.querySelector(".theme-toggle");
  var labelToggle = function () {
    if (!toggle) return;
    var t = doc.getAttribute("data-theme");
    toggle.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };
  if (toggle) {
    labelToggle();
    toggle.addEventListener("click", function () {
      var next = doc.getAttribute("data-theme") === "dark" ? "light" : "dark";
      doc.setAttribute("data-theme", next);
      try { localStorage.setItem("vg-hocco-theme", next); } catch (e) {}
      labelToggle();
    });
  }

  /* ---------- reveals ---------- */
  var reveals = [].slice.call(document.querySelectorAll(".reveal"));
  var show = function (el) {
    el.classList.add("in");
    /* pin to the final state once it has had time to play, so a stalled transition can never leave it hidden */
    setTimeout(function () { el.classList.add("done"); }, 1400);
  };
  setTimeout(function () { doc.classList.add("settled"); }, 1800);
  if ("IntersectionObserver" in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    reveals.forEach(function (el) { ro.observe(el); });
    /* safety net: anything already on screen is shown */
    setTimeout(function () {
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show(el);
      });
    }, 2500);
  }

  /* ---------- count-ups (final true value is in the HTML; this only animates to it) ---------- */
  function fmt(v, dec) { return v.toFixed(dec); }
  var counts = [].slice.call(document.querySelectorAll(".count"));
  if (counts.length && "IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; co.unobserve(el);
        var from = parseFloat(el.dataset.from), to = parseFloat(el.dataset.to);
        var dec = parseInt(el.dataset.dec || "0", 10);
        var t0 = null, dur = 1600, done = false;
        function step(t) {
          if (done) return;
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(from + (to - from) * e, dec);
          if (k < 1) requestAnimationFrame(step); else { done = true; el.textContent = fmt(to, dec); }
        }
        el.textContent = fmt(from, dec);
        requestAnimationFrame(step);
        setTimeout(function () { done = true; el.textContent = fmt(to, dec); }, dur + 150);
      });
    }, { threshold: 0.4 });
    counts.forEach(function (el) { co.observe(el); });
  }

  /* ---------- self-drawing timeline ---------- */
  var tl = document.getElementById("timeline");
  if (tl) {
    var fill = tl.querySelector(".timeline__fill");
    var items = [].slice.call(tl.querySelectorAll(".tl"));
    var drawTl = function () {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / Math.max(1, r.height)));
      if (reduce) p = 1;
      fill.style.setProperty("--p", p.toFixed(3));
      items.forEach(function (it) {
        if (it.getBoundingClientRect().top < vh * 0.72 || reduce) it.classList.add("is-lit");
      });
    };
    drawTl();
    window.addEventListener("scroll", drawTl, { passive: true });
    window.addEventListener("resize", drawTl);
  }

  /* ---------- launch film: muted autoplay only while in view, pause when out ---------- */
  var vid = document.getElementById("film-video");
  var bPlay = document.getElementById("film-play"), bSound = document.getElementById("film-sound");
  if (vid) {
    var userPaused = false, inView = false;
    var sync = function () {
      if (bPlay) {
        var playing = !vid.paused && !vid.ended;
        bPlay.querySelector("span").textContent = playing ? "Pause" : "Play";
        bPlay.setAttribute("aria-pressed", playing ? "true" : "false");
      }
      if (bSound) {
        bSound.querySelector("span").textContent = vid.muted ? "Sound on" : "Sound off";
        bSound.setAttribute("aria-pressed", vid.muted ? "false" : "true");
      }
    };
    var tryPlay = function () { var p = vid.play(); if (p && p.catch) p.catch(function () { sync(); }); };
    ["play", "pause", "volumechange", "ended"].forEach(function (ev) { vid.addEventListener(ev, sync); });
    /* a pause the reader asked for (not one we caused by scrolling away) stops autoplay from resuming */
    vid.addEventListener("pause", function () { if (inView && !vid.ended && !vid._autoPause) userPaused = true; vid._autoPause = false; });
    vid.addEventListener("play", function () { userPaused = false; });
    if (bPlay) bPlay.addEventListener("click", function () {
      if (vid.paused || vid.ended) { userPaused = false; tryPlay(); } else { userPaused = true; vid._autoPause = false; vid.pause(); }
    });
    if (bSound) bSound.addEventListener("click", function () {
      vid.muted = !vid.muted;
      if (!vid.muted) { vid.volume = 1; if (vid.paused) { userPaused = false; tryPlay(); } }
    });
    if ("IntersectionObserver" in window) {
      var vo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          inView = en.isIntersecting && en.intersectionRatio >= 0.5;
          if (inView) { if (!userPaused && !reduce && vid.paused) { vid.muted = vid.muted; tryPlay(); } }
          else if (!vid.paused) { vid._autoPause = true; vid.pause(); }
        });
      }, { threshold: [0, 0.5] });
      vo.observe(vid);
    }
    /* film switcher: swaps source, poster, links and caption on the one player */
    [].slice.call(document.querySelectorAll(".film__tab")).forEach(function (tab, _, all) {
      tab.addEventListener("click", function () {
        if (tab.classList.contains("is-on")) return;
        all.forEach(function (t) { t.classList.toggle("is-on", t === tab); t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
        var muted = vid.muted; vid._autoPause = true;
        vid.poster = tab.dataset.poster; vid.src = tab.dataset.src; vid.muted = muted; vid.load();
        var hd = document.getElementById("film-hd"), vv = document.getElementById("film-v"), cap = document.getElementById("film-cap");
        if (hd) hd.href = tab.dataset.hd; if (vv) vv.href = tab.dataset.v; if (cap) cap.innerHTML = tab.dataset.cap;
        userPaused = false; tryPlay();
      });
    });
    sync();
  }

  /* ---------- planner scrolly: picks the active step; CSS does the 3D swap ---------- */
  var scrolly = document.getElementById("scrolly");
  if (scrolly) {
    var steps = [].slice.call(scrolly.querySelectorAll(".step"));
    var figs = [].slice.call(scrolly.querySelectorAll(".fig"));
    var settleT = null, cur = -1;
    var setActive = function (i) {
      scrolly.classList.remove("settled");
      clearTimeout(settleT);
      settleT = setTimeout(function () { scrolly.classList.add("settled"); }, 1000);
      steps.forEach(function (s, j) { s.classList.toggle("is-active", j === i); });
      figs.forEach(function (f, j) { f.classList.toggle("is-active", j === i); f.classList.toggle("is-past", j < i); });
    };
    var pick = function () {
      var mid = window.innerHeight / 2, best = 0, bestD = Infinity;
      steps.forEach(function (st, j) {
        var r = st.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = j; }
      });
      if (best !== cur) { cur = best; setActive(best); }
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
  }

  /* ---------- portrait cursor tilt ---------- */
  var stage = document.getElementById("stage"), portrait = document.getElementById("portrait");
  if (stage && portrait && fine && !reduce) {
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      portrait.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
    });
    stage.addEventListener("mouseleave", function () {
      portrait.style.setProperty("--ry", "0deg"); portrait.style.setProperty("--rx", "0deg");
    });
  }

  /* ---------- card tilt, magnetic buttons, cursor (mouse devices only) ---------- */
  if (fine && !reduce) {
    [].slice.call(document.querySelectorAll(".tilt")).forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--ry", ((x - 0.5) * 8).toFixed(2) + "deg");
        c.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
        c.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
        c.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      });
      c.addEventListener("mouseleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
    [].slice.call(document.querySelectorAll(".magnetic")).forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px");
        b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    var cursor = document.querySelector(".cursor");
    if (cursor) {
      var cx = 0, cy = 0, tx = 0, ty = 0, raf = null;
      var loop = function () {
        cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
        cursor.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
        raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) ? requestAnimationFrame(loop) : null;
      };
      window.addEventListener("mousemove", function (e) {
        tx = e.clientX; ty = e.clientY; cursor.classList.add("on");
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      document.addEventListener("mouseleave", function () { cursor.classList.remove("on"); });
      [].slice.call(document.querySelectorAll("a, button, video")).forEach(function (el) {
        el.addEventListener("mouseenter", function () { cursor.classList.add("big"); });
        el.addEventListener("mouseleave", function () { cursor.classList.remove("big"); });
      });
    }
  }

  /* ---------- GSAP enhancement (local bundle). If absent, nothing breaks. ---------- */
  function enhance() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
    /* parallax on clouds */
    gsap.utils.toArray("[data-parallax]").forEach(function (el) {
      var k = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      gsap.to(el, { y: k * 220, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top top", end: "bottom top", scrub: true } });
    });
    var mm = gsap.matchMedia();
    mm.add("(min-width: 961px)", function () {
      /* scrubbed 3D tilt of the planner frames as the section enters */
      gsap.utils.toArray("#scrolly .fig").forEach(function (fig) {
        gsap.fromTo(fig, { rotateX: 14, scale: 0.94, transformPerspective: 1600 },
          { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: "#scrolly", start: "top 90%", end: "top 25%", scrub: true } });
      });
      /* film frame settles from a slight tilt */
      gsap.fromTo(".film__screen", { rotateX: 10, scale: 0.95, transformPerspective: 1400 },
        { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: "#film", start: "top 85%", end: "top 20%", scrub: true } });
    });
    gsap.to("#stage", { yPercent: -6, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }
  if (document.readyState === "complete") enhance(); else window.addEventListener("load", enhance);
})();
