(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Barra de progreso fija arriba del todo (siempre visible, aunque el header se oculte)
  const pr = document.createElement("div");
  pr.className = "progress";
  pr.setAttribute("aria-hidden", "true");
  document.body.append(pr);

  // La marca de agua pasa a ser fondo fijo de toda la página
  const mark = $(".mark-bg")[0];
  if (mark) document.body.prepend(mark);

  // Hero: entrada escalonada (los elementos con .rise ya animan por su cuenta)
  [...$(".hero .lede"), ...$(".hero .actions .btn"), ...$(".hero .phone"), ...$(".hero .rows li")].forEach((n, i) => {
    n.dataset.m = "";
    n.style.setProperty("--i", i);
  });

  // Secciones: hijos con desfase, y texto interno con un segundo desfase
  const KIDS = {
    ".principles": ".card",
    ".stats": ".stat",
    ".catalog": ":scope > div",
    ".notices": ".notice",
    ".channel": ":scope > *",
    ".release": ":scope > *",
    ".shots": ":scope > p, :scope > h2, .shot-row, .shot-nav",
  };
  const DEEP = ".principles, .stats, .notices";
  const kidsOf = (sec) => {
    const sel = Object.keys(KIDS).find((k) => sec.matches(k));
    return sel ? $(KIDS[sel], sec) : [];
  };
  const tag = (sec) =>
    kidsOf(sec).forEach((k, i) => {
      k.dataset.s = "";
      k.style.setProperty("--i", i);
      if (sec.matches(DEEP))
        $(":scope > *", k).forEach((t, j) => {
          t.dataset.t = "";
          t.style.setProperty("--j", j);
        });
    });
  const secs = $(".reveal");
  secs.forEach(tag);
  const enter = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const sec = e.target;
        enter.unobserve(sec);
        tag(sec); // incluye lo creado después (galería)
        sec.classList.add("in");
        const n = $("[data-s]", sec).length;
        setTimeout(() => $("[data-s],[data-t]", sec).forEach((k) => (k.removeAttribute("data-s"), k.removeAttribute("data-t"))), 2800 + n * 160);
      }),
    { threshold: 0.14 },
  );
  secs.forEach((s) => enter.observe(s));

  // Enfoque: la sección en el centro resalta, las demás se atenuan (también el hero al irse)
  const focus = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("focus", e.isIntersecting)),
    { rootMargin: "-35% 0px -35% 0px" },
  );
  secs.forEach((s) => focus.observe(s));
  const hero = $(".hero")[0];
  if (hero)
    new IntersectionObserver(
      (entries) => entries.forEach((e) => hero.classList.toggle("away", !e.isIntersecting)),
      { rootMargin: "-35% 0px -35% 0px" },
    ).observe(hero);

  // Scroll: progreso, cabecera (se oculta al bajar, vuelve al subir) y fondo con parallax
  const bar = $(".bar")[0];
  let tick = false;
  let last = 0;
  const onScroll = () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      tick = false;
      const y = window.scrollY;
      const h = root.scrollHeight - innerHeight;
      root.style.setProperty("--p", h > 0 ? Math.min(1, y / h).toFixed(4) : 0);
      if (bar) {
        bar.classList.toggle("scrolled", y > 8);
        if (y > 140 && y > last + 4) bar.classList.add("hide");
        else if (y < last - 4 || y <= 140) bar.classList.remove("hide");
      }
      last = y;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Luz que sigue al cursor en las tarjetas
  document.addEventListener(
    "pointermove",
    (e) => {
      const c = e.target.closest && e.target.closest(".card,.channel");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    },
    { passive: true },
  );

  // Transición al cambiar de idioma
  const main = $("#contenido")[0];
  new MutationObserver(() => {
    if (!main) return;
    main.classList.remove("swap");
    void main.offsetWidth;
    main.classList.add("swap");
  }).observe(root, { attributes: true, attributeFilter: ["lang"] });
})();
