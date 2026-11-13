(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const TXT = {
    es: { shotsK: "Así se ve", shotsT: "La app, por dentro.", waK: "Comunidad", waT: "Canal de WhatsApp", waB: "Novedades, versiones y avisos de Mortal Reader, directo en tu teléfono.", waBtn: "Unirme al canal", wa: "WhatsApp", alt: "Captura de Mortal Reader", prev: "Anterior", next: "Siguiente" },
    en: { shotsK: "Preview", shotsT: "Inside the app.", waK: "Community", waT: "WhatsApp channel", waB: "News, releases and notices about Mortal Reader, right on your phone.", waBtn: "Join the channel", wa: "WhatsApp", alt: "Mortal Reader screenshot", prev: "Previous", next: "Next" },
  };
  // Capturas por idioma: docs/img/es/ y docs/img/en/ (nombres exactos de los archivos)
  const SHOTS = {
    es: [
      "Screenshot_20261109_173654_com_webtoapp_WebViewActivity_edit_6531308703289.jpg",
      "Screenshot_20261109_173708_com_webtoapp_WebViewActivity_edit_6537628829172.jpg",
      "Screenshot_20261109_173724_com_webtoapp_WebViewActivity_edit_6543456110733.jpg",
      "Screenshot_20261109_174202_comall_sites_app_ShellActivity.jpg",
      "Screenshot_20261109_174402_comall_sites_app_ShellActivity.jpg",
    ],
    en: [
      "Screenshot_20261109_173442_com_webtoapp_WebViewActivity_edit_6505539402778 (1).jpg",
      "Screenshot_20261109_173528_com_webtoapp_WebViewActivity_edit_6513168610900 (1).jpg",
      "Screenshot_20261109_173843 (1).jpg",
      "Screenshot_20261109_174508_comall_sites_app_ShellActivity (1).jpg",
      "Screenshot_20261109_174614_comall_sites_app_ShellActivity (1).jpg",
    ],
  };
  const lang = () => (root.lang === "en" ? "en" : "es");
  let run = 0;
  let watcher = null;
  function ensureNav(box, row) {
    let nav = box.querySelector(".shot-nav");
    if (nav) return nav;
    nav = document.createElement("div");
    nav.className = "shot-nav";
    const mk = (cls, label, dir) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = label;
      b.addEventListener("click", () => {
        const fig = row.querySelector(".shot");
        row.scrollBy({ left: dir * ((fig ? fig.offsetWidth : 240) + 16), behavior: "smooth" });
      });
      return b;
    };
    const dots = document.createElement("div");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    nav.append(mk("prev", "\u2039", -1), dots, mk("next", "\u203a", 1));
    box.append(nav);
    return nav;
  }
  function render() {
    const l = lang();
    const token = ++run;
    document.querySelectorAll("[data-x]").forEach((n) => {
      n.textContent = TXT[l][n.dataset.x] || "";
    });
    const box = document.querySelector("[data-shots]");
    const row = box && box.querySelector("[data-row]");
    if (!row) return;
    const nav = ensureNav(box, row);
    nav.querySelector(".prev").setAttribute("aria-label", TXT[l].prev);
    nav.querySelector(".next").setAttribute("aria-label", TXT[l].next);
    const dots = nav.querySelector(".dots");
    if (watcher) watcher.disconnect();
    row.replaceChildren();
    dots.replaceChildren();
    row.scrollLeft = 0;
    box.hidden = false;
    const figs = [];
    const mark = (fig, on) => {
      const i = figs.indexOf(fig);
      fig.classList.toggle("on", on);
      if (dots.children[i]) dots.children[i].classList.toggle("on", on);
    };
    watcher = new IntersectionObserver(
      (entries) => entries.forEach((e) => mark(e.target, e.isIntersecting)),
      { root: row, threshold: 0.7 },
    );
    SHOTS[l].forEach((file, i) => {
      const fig = document.createElement("figure");
      fig.className = "shot";
      const img = new Image();
      img.alt = `${TXT[l].alt} ${i + 1}`;
      img.decoding = "async";
      img.loading = i < 2 ? "eager" : "lazy";
      img.onload = () => fig.classList.add("ok");
      img.onerror = () => {
        if (token !== run) return;
        fig.remove();
        if (!row.children.length) box.hidden = true;
      };
      img.src = `img/${l}/${encodeURIComponent(file)}`;
      fig.append(img);
      row.append(fig);
      figs.push(fig);
      dots.append(document.createElement("i"));
      watcher.observe(fig);
    });
  }
  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ["lang"] });
  render();

  // Movimiento: motion.css y fx.css primero, luego motion.js y después fx.js.
  // Si algo falla, las secciones se muestran igual.
  const showAll = () => document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"));
  const sheet = (href) => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.append(l);
    return l;
  };
  const script = (src, ok, bad) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = ok;
    s.onerror = bad;
    document.body.append(s);
  };
  sheet("fx.css");
  const css = sheet("motion.css");
  css.onload = () => script("motion.js", () => script("fx.js"), showAll);
  css.onerror = showAll;
})();
