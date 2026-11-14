(() => {
  // Mismo Worker que crea las sugerencias: /admin/status, /admin/login y /admin/toggle.
  const ENDPOINT = "https://mortal-suggest.lenoxlkzsdy.workers.dev";
  const COPY = {
    es: {
      open: "Panel admin",
      title: "Panel de administración",
      loginHelp: "Inicia sesión para controlar el envío de sugerencias.",
      userLabel: "Usuario",
      passLabel: "Contraseña",
      loginSend: "Entrar",
      loginWait: "Comprobando…",
      loginBad: "No tienes acceso. Usuario o contraseña incorrectos.",
      loginFail: "No se pudo comprobar el acceso. Inténtalo de nuevo.",
      panelHelp: "Controla si la página puede recibir sugerencias nuevas.",
      on: "Sugerencias habilitadas",
      off: "Sugerencias bloqueadas de manera indefinida",
      toggleOn: "Deshabilitar sugerencias",
      toggleOff: "Habilitar sugerencias",
      toggleWait: "Guardando…",
      toggleFail: "No se pudo guardar el cambio. Inténtalo de nuevo.",
      statusFail: "No se pudo leer el estado actual.",
      close: "Cerrar",
    },
    en: {
      open: "Admin panel",
      title: "Admin panel",
      loginHelp: "Sign in to control whether the page can receive new suggestions.",
      userLabel: "Username",
      passLabel: "Password",
      loginSend: "Sign in",
      loginWait: "Checking…",
      loginBad: "You don't have access. Wrong username or password.",
      loginFail: "Could not check access. Try again.",
      panelHelp: "Control whether the page can receive new suggestions.",
      on: "Suggestions enabled",
      off: "Suggestions blocked indefinitely",
      toggleOn: "Disable suggestions",
      toggleOff: "Enable suggestions",
      toggleWait: "Saving…",
      toggleFail: "Could not save the change. Try again.",
      statusFail: "Could not read the current status.",
      close: "Close",
    },
  };

  const lang = () => (document.documentElement.lang === "en" ? "en" : "es");
  const t = (key) => (COPY[lang()] || COPY.es)[key];

  const modal = document.querySelector("[data-admin-modal]");
  const opener = document.querySelector("[data-admin-open]");
  const loginForm = document.querySelector("[data-admin-login]");
  const panel = document.querySelector("[data-admin-panel]");
  if (!modal || !opener || !loginForm || !panel) return;

  const loginNote = loginForm.querySelector("[data-admin-login-note]");
  const loginSend = loginForm.querySelector("[data-admin-login-send]");
  const statusDot = panel.querySelector("[data-admin-dot]");
  const statusText = panel.querySelector("[data-admin-status-text]");
  const toggleBtn = panel.querySelector("[data-admin-toggle]");
  const panelNote = panel.querySelector("[data-admin-panel-note]");

  // Las credenciales solo viven en memoria, mientras el panel está abierto.
  // No se guardan en localStorage ni en ningún otro sitio persistente.
  let creds = null;
  let enabled = true;

  function apply() {
    document.querySelectorAll("[data-admin-i18n]").forEach((node) => {
      const key = node.getAttribute("data-admin-i18n");
      if (key) node.textContent = t(key);
    });
  }

  function say(node, message, kind) {
    if (!node) return;
    node.textContent = message || "";
    if (kind) node.dataset.kind = kind;
    else delete node.dataset.kind;
  }

  function resetToLogin() {
    creds = null;
    loginForm.hidden = false;
    panel.hidden = true;
    loginForm.reset();
    say(loginNote, "");
    say(panelNote, "");
  }

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
    resetToLogin();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.open) modal.close();
  });
  modal.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });

  modal.querySelectorAll("[data-admin-close]").forEach((node) => {
    node.addEventListener("click", () => modal.close());
  });

  opener.addEventListener("click", () => {
    apply();
    resetToLogin();
    openModal();
    const user = loginForm.querySelector('[name="username"]');
    if (user) user.focus({ preventScroll: true });
  });

  function renderStatus() {
    if (statusText) statusText.textContent = enabled ? t("on") : t("off");
    if (statusDot) {
      if (enabled) statusDot.removeAttribute("data-off");
      else statusDot.setAttribute("data-off", "");
    }
    if (toggleBtn) toggleBtn.textContent = enabled ? t("toggleOn") : t("toggleOff");
  }

  async function loadStatus() {
    try {
      const r = await fetch(`${ENDPOINT}/admin/status`, { cache: "no-store" });
      const d = await r.json();
      enabled = d.enabled !== false;
    } catch {
      say(panelNote, t("statusFail"), "bad");
    }
    renderStatus();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = (loginForm.username.value || "").trim();
    const password = loginForm.password.value || "";
    if (!username || !password) return;
    if (loginSend) loginSend.disabled = true;
    say(loginNote, t("loginWait"));
    try {
      const r = await fetch(`${ENDPOINT}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (r.status === 401 || r.status === 403) {
        say(loginNote, t("loginBad"), "bad");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      if (!d.ok) {
        say(loginNote, t("loginBad"), "bad");
        return;
      }
      creds = { username, password };
      loginForm.hidden = true;
      panel.hidden = false;
      say(panelNote, "");
      await loadStatus();
    } catch {
      say(loginNote, t("loginFail"), "bad");
    } finally {
      if (loginSend) loginSend.disabled = false;
    }
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      if (!creds) return;
      const next = !enabled;
      toggleBtn.disabled = true;
      say(panelNote, t("toggleWait"));
      try {
        const r = await fetch(`${ENDPOINT}/admin/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: creds.username, password: creds.password, enabled: next }),
        });
        if (r.status === 401 || r.status === 403) {
          say(panelNote, t("loginBad"), "bad");
          resetToLogin();
          return;
        }
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        enabled = d.enabled === true;
        renderStatus();
        say(panelNote, "");
      } catch {
        say(panelNote, t("toggleFail"), "bad");
      } finally {
        toggleBtn.disabled = false;
      }
    });
  }

  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  apply();
})();
