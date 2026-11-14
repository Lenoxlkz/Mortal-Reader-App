(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // 5. Texto: títulos palabra por palabra, el del canal letra por letra
  const split = (el, chars) => {
    if (el.querySelector(".w")) return;
    const t = el.textContent.trim();
    if (!t) return;
    el.setAttribute("aria-label", t);
    el.textContent = "";
    (chars ? [...t] : t.split(/\s+/)).forEach((p, i, a) => {
      const s = document.createElement("span");
      s.className = "w";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--k", i);
      s.textContent = chars ? p.replace(" ", "\u00a0") : p + (i < a.length - 1 ? "\u00a0" : "");
      el.append(s);
    });
  };
  const doSplit = () => [[".serif", 0], [".channel h2", 1]].forEach(([s, c]) => $(s).forEach((el) => split(el, c)));
  doSplit();
  new MutationObserver(() => setTimeout(doSplit, 90)).observe(root, { attributes: true, attributeFilter: ["lang"] });

  // 5. Franja de texto continua antes del canal
  const ch = $(".channel")[0];
  if (ch) {
    const m = document.createElement("div");
    m.className = "marquee";
    m.setAttribute("aria-hidden", "true");
    m.innerHTML = '<div class="mq-track">' + "<span>MORTAL READER</span><i>✦</i><span>READ LOCALLY</span><i>✦</i>".repeat(8) + "</div>";
    ch.before(m);
  }

  // 8. Feedback al tocar: rebote + vibración corta
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".btn,.chip-btn,.lang button,.shot-nav button");
    if (!b) return;
    b.classList.remove("tap");
    void b.offsetWidth;
    b.classList.add("tap");
    if (navigator.vibrate) navigator.vibrate(b.matches(".lang button") ? 8 : 14);
  });

  if (calm) return;

  // 6. Botones magnéticos (solo con cursor)
  if (fine)
    $(".btn,.chip-btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--tx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px");
        b.style.setProperty("--ty", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      b.addEventListener("pointerleave", () => {
        b.style.setProperty("--tx", "0px");
        b.style.setProperty("--ty", "0px");
      });
    });

  // Altura estable: en el móvil la barra del navegador aparece y desaparece al hacer scroll
  // y cambia innerHeight. Si se usara en vivo, todo temblaría. Solo se actualiza con cambios reales.
  let VW = innerWidth;
  let VH = innerHeight;

  // 4 y 10. Scroll horizontal fijado: la galería avanza al bajar y retrocede al subir
  const shots = $(".shots")[0];
  const row = shots && $(".shot-row", shots)[0];
  let pin = null;
  if (row) {
    pin = document.createElement("div");
    pin.className = "hs-pin";
    pin.append(...shots.children);
    shots.append(pin);
    // Todas las capturas se cargan de una vez: nada parpadea al entrar a la galería
    const eager = () => $("img", row).forEach((i) => (i.loading = "eager"));
    eager();
    new MutationObserver(eager).observe(row, { childList: true });
  }
  const size = () => {
    if (!pin) return;
    const dist = Math.max(0, row.scrollWidth - row.clientWidth);
    shots.style.height = pin.offsetHeight + dist + VH * 0.5 + "px";
  };
  const hsUpdate = () => {
    if (!pin) return;
    const span = shots.offsetHeight - VH;
    const p = span > 0 ? clamp(-shots.getBoundingClientRect().top / span, 0, 1) : 0;
    row.scrollLeft = p * (row.scrollWidth - row.clientWidth);
    const rr = row.getBoundingClientRect();
    const cx = rr.left + rr.width / 2;
    const figs = $(".shot", row);
    let best = 0;
    let bd = Infinity;
    figs.forEach((f, i) => {
      const b = f.getBoundingClientRect();
      const d = b.left + b.width / 2 - cx;
      f.style.setProperty("--dx", ((d / rr.width) * -16).toFixed(1) + "%"); // 10. parallax
      if (Math.abs(d) < bd) {
        bd = Math.abs(d);
        best = i;
      }
    });
    // La captura activa se decide aquí (la más cercana al centro): sin parpadeos
    figs.forEach((f, i) => f.classList.toggle("near", i === best));
    $(".dots i", pin).forEach((d, i) => d.classList.toggle("cur", i === best));
  };

  // 3. Secciones que se superponen en cadena: cada una sube y tapa a la anterior
  const stage = (...els) => {
    if (els.some((e) => !e)) return;
    const st = document.createElement("div");
    st.className = "stage";
    els[0].before(st);
    st.append(...els);
    els.forEach((e, i) => {
      if (i < els.length - 1) e.classList.add("under");
      if (i) e.classList.add("sheet");
      e.style.zIndex = i;
    });
  };
  // Versión + catálogo pasan a ser una sola sección
  const stats = $(".stats")[0];
  const cat = $(".catalog")[0];
  let hub = null;
  if (stats && cat) {
    hub = document.createElement("div");
    hub.className = "hub";
    stats.before(hub);
    hub.append(...[stats, $("[data-note]")[0], cat].filter(Boolean));
  }
  stage($(".hero")[0], $(".phone-sec")[0], shots); // hero → teléfono → galería
  stage(hub, $(".principles")[0]); // versión + catálogo → principios
  const fit = () => $(".under").forEach((u) => u.style.setProperty("--st", Math.min(0, VH - u.offsetHeight) + "px"));

  let tk = false;
  const onS = () => {
    if (tk) return;
    tk = true;
    requestAnimationFrame(() => {
      tk = false;
      hsUpdate();
    });
  };
  const refresh = () => {
    size();
    fit();
    onS();
  };
  addEventListener("scroll", onS, { passive: true });
  addEventListener("resize", () => {
    if (innerWidth === VW && Math.abs(innerHeight - VH) < 160) return; // solo la barra del navegador
    VW = innerWidth;
    VH = innerHeight;
    refresh();
  });
  addEventListener("load", refresh);
  if (pin && "ResizeObserver" in window) new ResizeObserver(refresh).observe(pin);
  new MutationObserver(() => setTimeout(refresh, 120)).observe(root, { attributes: true, attributeFilter: ["lang"] });
  refresh();

  // 7. Scroll suave con la rueda del mouse (moderado)
  if (fine) {
    let target = 0;
    let cur = 0;
    let raf = 0;
    const max = () => root.scrollHeight - innerHeight;
    const loop = () => {
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.5) {
        cur = target;
        raf = 0;
      }
      scrollTo({ top: cur, behavior: "instant" });
      if (raf) raf = requestAnimationFrame(loop);
    };
    addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        if (!raf) cur = target = scrollY;
        target = clamp(target + e.deltaY * (e.deltaMode ? 32 : 1) * 0.9, 0, max());
        if (!raf) raf = requestAnimationFrame(loop);
      },
      { passive: false },
    );
  }
})();
