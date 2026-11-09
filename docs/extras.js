(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const TXT = {
    es: { shotsK: "Así se ve", shotsT: "La app, por dentro.", waK: "Comunidad", waT: "Canal de WhatsApp", waB: "Novedades, versiones y avisos de Mortal Reader, directo en tu teléfono.", waBtn: "Unirme al canal", wa: "WhatsApp", alt: "Captura de Mortal Reader" },
    en: { shotsK: "Preview", shotsT: "Inside the app.", waK: "Community", waT: "WhatsApp channel", waB: "News, releases and notices about Mortal Reader, right on your phone.", waBtn: "Join the channel", wa: "WhatsApp", alt: "Mortal Reader screenshot" },
  };
  // Capturas: docs/img/es/1.jpg … 6.jpg y docs/img/en/1.jpg … 6.jpg
  const SHOTS = [1, 2, 3, 4, 5, 6];
  const lang = () => (root.lang === "en" ? "en" : "es");
  let run = 0;
  function render() {
    const l = lang();
    const token = ++run;
    document.querySelectorAll("[data-x]").forEach((n) => {
      n.textContent = TXT[l][n.dataset.x] || "";
    });
    const box = document.querySelector("[data-shots]");
    const row = box && box.querySelector("[data-row]");
    if (!row) return;
    row.replaceChildren();
    box.hidden = true;
    SHOTS.forEach((n) => {
      const fig = document.createElement("figure");
      fig.className = "shot";
      const img = new Image();
      img.alt = `${TXT[l].alt} ${n}`;
      img.decoding = "async";
      img.onload = () => {
        if (token === run) box.hidden = false;
      };
      img.onerror = () => fig.remove();
      img.src = `img/${l}/${n}.jpg`;
      fig.append(img);
      row.append(fig);
    });
  }
  new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ["lang"] });
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add("in");
                io.unobserve(e.target);
              }
            }),
          { threshold: 0.12 },
        )
      : null;
  document.querySelectorAll(".reveal").forEach((n) => (io ? io.observe(n) : n.classList.add("in")));
  render();
})();
