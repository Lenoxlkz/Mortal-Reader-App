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

  // 4 y 10. Scroll horizontal fijado: la galería avanza al bajar y retrocede al subir
  const shots = $(".shots")[0];
  const row = shots && $(".shot-row", shots)[0];
  let pin = null;
  if (row) {
    pin = document.createElement("div");
    pin.className = "hs-pin";
    pin.append(...shots.children);
    shots.append(pin);
  }
  const size = () => {
    if (!pin) return;
    const dist = Math.max(0, row.scrollWidth - row.clientWidth);
    shots.style.height = pin.offsetHeight + dist + innerHeight * 0.5 + "px";
  };
  const hsUpdate = () => {
    if (!pin) return;
    const span = shots.offsetHeight - innerHeight;
    const p = span > 0 ? clamp(-shots.getBoundingClientRect().top / span, 0, 1) : 0;
    row.scrollLeft = p * (row.scrollWidth - row.clientWidth);
    const rr = row.getBoundingClientRect();
    const cx = rr.left + rr.width / 2;
    $(".shot", row).forEach((f) => {
      const b = f.getBoundingClientRect();
      f.style.setProperty("--dx", (((b.left + b.width / 2 - cx) / rr.width) * -16).toFixed(1) + "%"); // 10. parallax
    });
  };

  // 3. Secciones que se superponen: la de abajo sube y tapa a la de arriba
  const stage = (under, over) => {
    if (!under || !over) return;
    const st = document.createElement("div");
    st.className = "stage";
    under.before(st);
    st.append(under, over);
    under.classList.add("under");
    over.classList.add("sheet");
  };
  stage($(".hero")[0], shots);
  stage($(".catalog")[0], $(".principles")[0]);
  const fit = () => $(".under").forEach((u) => u.style.setProperty("--st", Math.min(0, innerHeight - u.offsetHeight) + "px"));

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
  addEventListener("resize", refresh);
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
