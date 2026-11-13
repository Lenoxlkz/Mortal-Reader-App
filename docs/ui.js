(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const main = $("#contenido")[0];

  // 1. Feedback: barra que confirma la descarga + rebote y vibración en el botón de GitHub
  document.addEventListener("click", (e) => {
    const s = e.target.closest(".btn.solid");
    if (s) {
      s.classList.remove("go");
      void s.offsetWidth;
      s.classList.add("go");
    }
    const g = e.target.closest(".gh-btn");
    if (g) {
      g.classList.remove("tap");
      void g.offsetWidth;
      g.classList.add("tap");
      if (navigator.vibrate) navigator.vibrate(14);
    }
  });

  if (calm || !main) return;

  // 2. Cambio de idioma como transición de app: sale hacia un lado, entra desde el otro
  const passed = new WeakSet();
  document.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest(".lang button");
      if (!b || passed.has(b) || b.dataset.lang === root.lang) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      main.style.setProperty("--dir", b.dataset.lang === "en" ? 1 : -1);
      main.classList.add("leave");
      setTimeout(() => {
        passed.add(b);
        b.click();
        passed.delete(b);
      }, 200);
    },
    true,
  );
  new MutationObserver(() => main.classList.remove("leave")).observe(root, { attributes: true, attributeFilter: ["lang"] });

  // 3. Teléfono 3D: sigue al cursor (o al giroscopio en móvil) con profundidad y brillo
  const phone = $(".hero .phone")[0];
  const scr = phone && $(".screen", phone)[0];
  if (scr) {
    const tilt = (rx, ry, gx, gy) => {
      scr.style.setProperty("--rx", rx.toFixed(1) + "deg");
      scr.style.setProperty("--ry", ry.toFixed(1) + "deg");
      scr.style.setProperty("--gx", gx.toFixed(0) + "%");
      scr.style.setProperty("--gy", gy.toFixed(0) + "%");
    };
    if (fine)
      addEventListener(
        "pointermove",
        (e) => {
          const r = phone.getBoundingClientRect();
          const nx = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
          const ny = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
          tilt(-ny * 12, nx * 14, 50 + nx * 40, 50 + ny * 40);
        },
        { passive: true },
      );
    addEventListener(
      "deviceorientation",
      (e) => {
        if (e.gamma == null || e.beta == null) return;
        const b = e.beta - 55;
        tilt(clamp(b * 0.35, -12, 12), clamp(e.gamma * 0.4, -14, 14), 50 + clamp(e.gamma, -30, 30), 50 + clamp(b, -30, 30));
      },
      { passive: true },
    );
  }

  // Botón de GitHub magnético (solo con cursor)
  const gh = $(".gh-btn")[0];
  if (gh && fine) {
    gh.addEventListener("pointermove", (e) => {
      const r = gh.getBoundingClientRect();
      gh.style.setProperty("--tx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
      gh.style.setProperty("--ty", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
    });
    gh.addEventListener("pointerleave", () => {
      gh.style.setProperty("--tx", "0px");
      gh.style.setProperty("--ty", "0px");
    });
  }
})();
