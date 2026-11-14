(() => {
  const REPO = "Lenoxlkz/Mortal-Reader-App";
  // URL del Worker de Cloudflare que crea el issue (ver worker/README.md).
  // Si está vacía, o si el Worker falla, se abre GitHub con el issue ya escrito.
  const ENDPOINT = "https://mortal-suggest.lenoxlkzsdy.workers.dev";
  const COPY = {
    es: {
      button: "Enviar sugerencia para añadir sitios web",
      title: "Sugerir un sitio web",
      help: "Escríbelo como se lo contarías a alguien. Qué sitio es, si es para leer o para ver, y en qué idioma.",
      textLabel: "Tu sugerencia",
      urlLabel: "Enlace del sitio, si lo tienes",
      langLabel: "Idioma del sitio",
      langAny: "No lo sé",
      placeholder: "Por ejemplo: un sitio de novelas en inglés. Se llama … y el enlace es …",
      send: "Enviar sugerencia",
      cancel: "Cancelar",
      close: "Cerrar",
      short: "Cuéntalo con un poco más de detalle.",
      opened: "Dejé la sugerencia escrita. En GitHub solo hay que confirmar el envío.",
      sent: "Listo. La sugerencia ya quedó publicada.",
      rate: "Enviaste varias sugerencias seguidas. Inténtalo de nuevo más tarde.",
      fail: "No se pudo enviar. Inténtalo de nuevo en un momento.",
      wait: "Enviando…",
    },
    en: {
      button: "Send a suggestion to add a website",
      title: "Suggest a website",
      help: "Write it the way you would tell someone. What the site is, whether it is for reading or watching, and in which language.",
      textLabel: "Your suggestion",
      urlLabel: "Site link, if you have it",
      langLabel: "Site language",
      langAny: "Not sure",
      placeholder: "For example: an English novel site. It is called … and the link is …",
      send: "Send suggestion",
      cancel: "Cancel",
      close: "Close",
      short: "Add a little more detail.",
      opened: "The suggestion is already written. On GitHub you only need to confirm it.",
      sent: "Done. The suggestion is published.",
      rate: "You sent several suggestions in a row. Try again later.",
      fail: "It could not be sent. Try again in a moment.",
      wait: "Sending…",
    },
  };

  const lang = () => (document.documentElement.lang === "en" ? "en" : "es");
  const t = (key) => (COPY[lang()] || COPY.es)[key];
  const modal = document.querySelector("[data-suggest-modal]");
  const form = document.querySelector("[data-suggest-form]");
  const opener = document.querySelector("[data-suggest]");
  const note = document.querySelector("[data-suggest-note]");
  if (!modal || !form || !opener) return;

  function apply() {
    document.querySelectorAll("[data-suggest-i18n]").forEach((node) => {
      const key = node.getAttribute("data-suggest-i18n");
      if (key) node.textContent = t(key);
    });
    const area = form.querySelector("[data-suggest-text]");
    if (area) area.placeholder = t("placeholder");
    document.querySelectorAll("[data-suggest-close]").forEach((node) => {
      if (node.classList.contains("suggest-x")) node.setAttribute("aria-label", t("close"));
    });
    const send = form.querySelector("[data-suggest-send]");
    if (send) send.textContent = t("send");
  }

  function say(message, kind) {
    if (!note) return;
    note.textContent = message || "";
    if (kind) note.dataset.kind = kind;
    else delete note.dataset.kind;
  }

  function titleFrom(text) {
    const line = text.split("\n").map((part) => part.trim()).find(Boolean) || "Sitio web";
    const short = line.length > 72 ? `${line.slice(0, 69)}…` : line;
    return lang() === "en" ? `Suggestion: ${short}` : `Sugerencia: ${short}`;
  }

  function bodyFrom(text, url, siteLang) {
    const link = url || (lang() === "en" ? "Not provided" : "No indicado");
    const idiom = siteLang || (lang() === "en" ? "Not specified" : "No indicado");
    if (lang() === "en") {
      return `### Suggestion\n${text}\n\n### Link\n${link}\n\n### Language\n${idiom}\n\n---\nSent from the Mortal Reader page.`;
    }
    return `### Sugerencia\n${text}\n\n### Enlace\n${link}\n\n### Idioma\n${idiom}\n\n---\nEnviado desde la página de Mortal Reader.`;
  }

  function openGithub(title, body) {
    const query = new URLSearchParams({ title, body, labels: "sugerencia" });
    window.open(`https://github.com/${REPO}/issues/new?${query}`, "_blank", "noopener");
  }

  opener.addEventListener("click", () => {
    say("");
    apply();
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    const area = form.querySelector("[data-suggest-text]");
    if (area) area.focus();
  });

  modal.querySelectorAll("[data-suggest-close]").forEach((node) => {
    node.addEventListener("click", () => modal.close());
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.company && form.company.value) {
      say(t("sent"), "ok");
      return;
    }
    const text = (form.text.value || "").trim();
    const url = (form.url.value || "").trim();
    const siteLang = (form.siteLang && form.siteLang.value) || "";
    if (text.length < 12) {
      say(t("short"), "bad");
      return;
    }
    const title = titleFrom(text);
    const body = bodyFrom(text, url, siteLang);
    if (!ENDPOINT) {
      openGithub(title, body);
      say(t("opened"), "ok");
      return;
    }
    const send = form.querySelector("[data-suggest-send]");
    if (send) send.disabled = true;
    say(t("wait"));
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url, siteLang, lang: lang(), company: "" }),
      });
      if (response.status === 429) {
        say(t("rate"), "bad");
        return;
      }
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      form.reset();
      say(data.number ? `${t("sent")} #${data.number}` : t("sent"), "ok");
      setTimeout(() => modal.open && modal.close(), 2600);
    } catch {
      openGithub(title, body); // plan B: GitHub con el issue ya escrito
      say(t("opened"), "ok");
    } finally {
      if (send) send.disabled = false;
    }
  });

  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  apply();
})();
