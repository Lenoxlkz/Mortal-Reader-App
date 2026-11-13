(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero: entrada escalonada (los elementos con .rise ya animan por su cuenta)
  [...$(".hero .lede"), ...$(".hero .actions .btn"), ...$(".hero .phone"), ...$(".hero .rows li")].forEach((n, i) => {
    n.dataset.m = "";
    n.style.setProperty("--i", i);
  });

  // Secciones: hijos con desfase al entrar en pantalla
  const KIDS = {
    ".principles": ".card",
    ".stats": ".stat",
    ".catalog": ":scope > div",
    ".notices": ".notice",
    ".channel": ":scope > *",
    ".release": ":scope > *",
    ".shots": ":scope > p, :scope > h2, .shot-row, .shot-nav",
  };
  const kidsOf = (sec) => {
    const sel = Object.keys(KIDS).find((k) => sec.matches(k));
    return sel ? $(KIDS[sel], sec) : [];
  };
  const secs = $(".reveal");
  secs.forEach((sec) =>
    kidsOf(sec).forEach((k, i) => {
      k.dataset.s = "";
      k.style.setProperty("--i", i);
    }),
  );
  const enter = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const sec = e.target;
        enter.unobserve(sec);
        kidsOf(sec).forEach((k) => (k.dataset.s = "")); // incluye los creados después (galería)
        sec.classList.add("in");
        const kids = $("[data-s]", sec);
        setTimeout(() => kids.forEach((k) => k.removeAttribute("data-s")), 1100 + kids.length * 110);
      }),
    { threshold: 0.14 },
  );
  secs.forEach((s) => enter.observe(s));

  // Enfoque: la sección en el centro de la pantalla resalta, las demás se atenuan
  const focus = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("focus", e.isIntersecting)),
    { rootMargin: "-35% 0px -35% 0px" },
  );
  secs.forEach((s) => focus.observe(s));

  // Scroll: barra de progreso, cabecera y parallax de la marca de agua
  const bar = $(".bar")[0];
  let tick = false;
  const onScroll = () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => {
      tick = false;
      const y = window.scrollY;
      const h = root.scrollHeight - innerHeight;
      root.style.setProperty("--sy", calm ? 0 : y.toFixed(0));
      root.style.setProperty("--p", h > 0 ? (y / h).toFixed(4) : 0);
      if (bar) bar.classList.toggle("scrolled", y > 8);
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

  // Transición suave al cambiar de idioma
  const main = $("#contenido")[0];
  new MutationObserver(() => {
    if (!main) return;
    main.classList.remove("swap");
    void main.offsetWidth;
    main.classList.add("swap");
  }).observe(root, { attributes: true, attributeFilter: ["lang"] });
})();
