(() => {
  const REPO = "Lenoxlkz/Mortal-Reader-App";
  // URL del Worker de Cloudflare que crea el issue (ver worker/README.md).
  // Si está vacía, o si el Worker falla, se abre GitHub con el issue ya escrito.
  const ENDPOINT = "https://mortal-suggest.lenoxlkzsdy.workers.dev";
  // Clave PÚBLICA (sitekey) de Cloudflare Turnstile. La clave secreta NUNCA va aquí:
  // vive como secreto TURNSTILE_SECRET en el Worker, que es quien verifica el token.
  const SITE_KEY = "0x4AAAAAAGAbxJGkTugsZhD9";
  const ACTION = "suggest"; // el Worker comprueba que el token venga de esta acción
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
      captcha: "Espera a que termine la verificación para poder enviar.",
      captchaBad: "No pudimos verificar que eres una persona. Inténtalo otra vez.",
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
      captcha: "Wait for the verification to finish to send.",
      captchaBad: "We could not verify you are a person. Try again.",
    },
  };

  const lang = () => (document.documentElement.lang === "en" ? "en" : "es");
  const t = (key) => (COPY[lang()] || COPY.es)[key];
  const modal = document.querySelector("[data-suggest-modal]");
  const form = document.querySelector("[data-suggest-form]");
  const opener = document.querySelector("[data-suggest]");
  const note = document.querySelector("[data-suggest-note]");
  if (!modal || !form || !opener) return;
  const send = form.querySelector("[data-suggest-send]");
  const coarse = matchMedia("(pointer: coarse)").matches;

  // Que nada abra el teclado por su cuenta: solo cuando la persona toque el campo
  form.querySelectorAll("[autofocus]").forEach((n) => n.removeAttribute("autofocus"));

  // ---- Cloudflare Turnstile ----
  const box = document.createElement("div");
  box.className = "suggest-captcha";
  box.hidden = true;
  if (SITE_KEY) (note ? note.before(box) : form.append(box));
  let widget = null;
  let ready = false;
  let failed = false;
  let loading = false;

  // El botón Enviar queda desactivado hasta que la verificación termine
  function refreshSend() {
    if (!send) return;
    const solved = widget !== null && window.turnstile && window.turnstile.getResponse(widget);
    send.disabled = !(!SITE_KEY || failed || !ready || solved);
  }

  // Dibuja el widget desde cero (así queda en el idioma actual y con un token nuevo)
  function draw() {
    if (!window.turnstile || !window.turnstile.render) return;
    if (widget !== null) {
      try {
        window.turnstile.remove(widget);
      } catch {}
      widget = null;
    }
    box.replaceChildren();
    box.hidden = false;
    failed = false;
    widget = window.turnstile.render(box, {
      sitekey: SITE_KEY,
      action: ACTION,
      theme: "dark",
      language: lang(),
      size: innerWidth < 380 ? "compact" : "normal",
      callback: refreshSend,
      "expired-callback": refreshSend,
      "timeout-callback": refreshSend,
      "error-callback": () => {
        failed = true; // Turnstile no pudo cargar: se usa el plan B de GitHub
        refreshSend();
      },
    });
    ready = true;
    refreshSend();
  }

  function loadCaptcha() {
    if (!SITE_KEY) return;
    if (window.turnstile && window.turnstile.render) {
      draw();
      return;
    }
    if (loading) return;
    loading = true;
    window.mortalTurnstile = () => {
      loading = false;
      draw();
    };
    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=mortalTurnstile";
    s.onerror = () => {
      loading = false;
      failed = true; // script bloqueado: plan B de GitHub
      box.hidden = true;
      refreshSend();
    };
    document.head.append(s);
  }

  // ---- Modal (con fondo propio; Esc y clic fuera lo cierran) ----
  let scrim = null;
  function openModal() {
    scrim = document.createElement("div");
    scrim.className = "suggest-scrim";
    scrim.addEventListener("click", () => modal.close());
    document.body.append(scrim);
    document.documentElement.classList.add("suggest-open");
    if (typeof modal.show === "function") modal.show();
    else modal.setAttribute("open", "");
  }
  modal.addEventListener("close", () => {
    if (scrim) scrim.remove();
    scrim = null;
    document.documentElement.classList.remove("suggest-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.open) modal.close();
  });
  modal.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });

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
    openModal();
    if (SITE_KEY) {
      if (send) send.disabled = true;
      loadCaptcha();
    }
    if (coarse) {
      // En el móvil no se abre el teclado solo: así se ve el formulario completo
      const active = document.activeElement;
      if (active && modal.contains(active)) active.blur();
      modal.setAttribute("tabindex", "-1");
      modal.focus({ preventScroll: true });
    } else {
      const area = form.querySelector("[data-suggest-text]");
      if (area) area.focus({ preventScroll: true });
    }
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
    const token = ready && widget !== null && window.turnstile ? window.turnstile.getResponse(widget) : "";
    if (SITE_KEY && ready && !failed && !token) {
      say(t("captcha"), "bad");
      return;
    }
    // Sin Worker, o sin verificación disponible (bloqueada): plan B con GitHub
    if (!ENDPOINT || (SITE_KEY && !token)) {
      openGithub(title, body);
      say(t("opened"), "ok");
      return;
    }
    if (send) send.disabled = true;
    say(t("wait"));
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url, siteLang, lang: lang(), company: "", "cf-turnstile-response": token }),
      });
      if (response.status === 429) {
        say(t("rate"), "bad");
        return;
      }
      if (response.status === 403) {
        say(t("captchaBad"), "bad");
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
      // Cada token sirve una sola vez: se pide uno nuevo para poder reintentar
      if (widget !== null && window.turnstile) window.turnstile.reset(widget);
      refreshSend();
    }
  });

  new MutationObserver(() => {
    apply();
    if (SITE_KEY && modal.open) loadCaptcha(); // vuelve a dibujar el widget en el idioma nuevo
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  apply();
})();
