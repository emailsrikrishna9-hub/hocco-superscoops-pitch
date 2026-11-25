/* HOCCO landing scene: pointer parallax across depth layers (bespoke per company). Off for reduced motion and touch-only devices. */
(function () {
  var scene = document.getElementById("scene");
  if (!scene) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var raf = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (e) {
    if (document.documentElement.getAttribute("data-page") !== "landing") return;
    tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; scene.style.setProperty("--px", tx.toFixed(3)); scene.style.setProperty("--py", ty.toFixed(3)); });
  }, { passive: true });
})();
