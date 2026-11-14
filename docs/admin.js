(() => {
  // Mismo Worker que crea las sugerencias: /admin/status, /admin/login y /admin/toggle.
  const ENDPOINT = "https://mortal-suggest.lenoxlkzsdy.workers.dev";
  const COPY = {
    es: {
      open: "Panel admin",
      kicker: "Acceso",
      title: "Panel de administración",
      loginHelp: "Inicia sesión para controlar el envío de sugerencias.",
      userLabel: "Usuario",
      passLabel: "Contraseña",
      loginSend: "Entrar",
      loginWait: "Comprobando el acceso…",
      loginOk: "Acceso correcto.",
      loginBad: "No coincide. Usuario o contraseña incorrectos.",
      loginFail: "No se pudo comprobar el acceso. Inténtalo de nuevo.",
      loginRate: "Demasiados intentos. Espera un poco y vuelve a entrar.",
      userEmpty: "Falta el usuario.",
      userReady: "Listo para comprobar.",
      passEmpty: "Falta la contraseña.",
      passReady: "Listo para comprobar.",
      showPass: "Ver contraseña",
      hidePass: "Ocultar contraseña",
      panelHelp: "Controla si la página puede recibir sugerencias nuevas.",
      on: "Sugerencias habilitadas",
      off: "Sugerencias bloqueadas de manera indefinida",
      onDetail: "El botón de enviar sugerencia se muestra en la página.",
      offDetail: "El botón de enviar sugerencia queda oculto para todo el mundo.",
      toggleOn: "Deshabilitar sugerencias",
      toggleOff: "Habilitar sugerencias",
      toggleWait: "Guardando el cambio…",
      toggleOk: "Cambio guardado.",
      toggleFail: "No se pudo guardar el cambio. Inténtalo de nuevo.",
      statusFail: "No se pudo leer el estado actual.",
      session: "Esta sesión no se guarda. Al cerrar el panel hay que entrar otra vez.",
      logout: "Cerrar sesión",
      close: "Cerrar",
    },
    en: {
      open: "Admin panel",
      kicker: "Access",
      title: "Admin panel",
      loginHelp: "Sign in to control whether the page can receive new suggestions.",
      userLabel: "Username",
      passLabel: "Password",
      loginSend: "Sign in",
      loginWait: "Checking access…",
      loginOk: "Access granted.",
      loginBad: "That doesn't match. Wrong username or password.",
      loginFail: "Could not check access. Try again.",
      loginRate: "Too many attempts. Wait a moment and try again.",
      userEmpty: "Username is missing.",
      userReady: "Ready to check.",
      passEmpty: "Password is missing.",
      passReady: "Ready to check.",
      showPass: "Show password",
      hidePass: "Hide password",
      panelHelp: "Control whether the page can receive new suggestions.",
      on: "Suggestions enabled",
      off: "Suggestions blocked indefinitely",
      onDetail: "The suggestion button is shown on the page.",
      offDetail: "The suggestion button is hidden for everyone.",
      toggleOn: "Disable suggestions",
      toggleOff: "Enable suggestions",
      toggleWait: "Saving the change…",
      toggleOk: "Change saved.",
      toggleFail: "Could not save the change. Try again.",
      statusFail: "Could not read the current status.",
      session: "This session is not saved. Closing the panel asks you to sign in again.",
      logout: "Sign out",
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
  const userField = loginForm.querySelector("[data-admin-user-field]");
  const passField = loginForm.querySelector("[data-admin-pass-field]");
  const userHint = loginForm.querySelector("[data-admin-user-hint]");
  const passHint = loginForm.querySelector("[data-admin-pass-hint]");
  const eye = loginForm.querySelector("[data-admin-eye]");
  const eyeOpen = loginForm.querySelector("[data-eye-open]");
  const eyeShut = loginForm.querySelector("[data-eye-shut]");
  const statusBox = panel.querySelector("[data-admin-status]");
  const statusDot = panel.querySelector("[data-admin-dot]");
  const statusText = panel.querySelector("[data-admin-status-text]");
  const statusDetail = panel.querySelector("[data-admin-status-detail]");
  const toggleBtn = panel.querySelector("[data-admin-toggle]");
  const toggleLabel = panel.querySelector("[data-admin-toggle-label]");
  const panelNote = panel.querySelector("[data-admin-panel-note]");
  const passInput = loginForm.querySelector('[name="password"]');
  const userInput = loginForm.querySelector('[name="username"]');

  let creds = null;
  let enabled = true;
  let busy = false;
  let touched = false;

  function apply() {
    document.querySelectorAll("[data-admin-i18n]").forEach((node) => {
      const key = node.getAttribute("data-admin-i18n");
      if (key && !(busy && node === loginSend)) node.textContent = t(key);
    });
    if (eye) eye.setAttribute("aria-label", passInput && passInput.type === "text" ? t("hidePass") : t("showPass"));
    document.querySelectorAll("[data-admin-close]").forEach((node) => {
      if (node.classList.contains("suggest-x")) node.setAttribute("aria-label", t("close"));
    });
    if (!busy && loginSend) loginSend.textContent = t("loginSend");
    paintFields();
    if (creds) renderStatus();
  }

  function say(node, message, kind) {
    if (!node) return;
    node.textContent = message || "";
    if (kind) node.dataset.kind = kind;
    else delete node.dataset.kind;
  }

  function hint(node, message, kind) {
    if (!node) return;
    node.textContent = message || "";
    if (kind) node.dataset.kind = kind;
    else delete node.dataset.kind;
  }

  function paintFields() {
    if (busy) return;
    const user = (userInput && userInput.value.trim()) || "";
    const pass = (passInput && passInput.value) || "";
    const bad = loginNote && loginNote.dataset.kind === "bad";
    if (userField) userField.dataset.state = bad ? "bad" : user ? "ready" : "";
    if (passField) passField.dataset.state = bad ? "bad" : pass ? "ready" : "";
    if (!touched) {
      hint(userHint, "");
      hint(passHint, "");
      return;
    }
    hint(userHint, user ? t("userReady") : t("userEmpty"), user && !bad ? "ok" : bad || !user ? "bad" : "");
    hint(passHint, pass ? t("passReady") : t("passEmpty"), pass && !bad ? "ok" : bad || !pass ? "bad" : "");
  }

  function setWait(on) {
    busy = on;
    if (userField) userField.dataset.state = on ? "wait" : userField.dataset.state;
    if (passField) passField.dataset.state = on ? "wait" : passField.dataset.state;
    if (loginSend) loginSend.disabled = on;
  }

  function resetToLogin() {
    creds = null;
    busy = false;
    touched = false;
    loginForm.hidden = false;
    panel.hidden = true;
    loginForm.reset();
    if (passInput) passInput.type = "password";
    if (eye) eye.setAttribute("aria-pressed", "false");
    if (eyeOpen) eyeOpen.hidden = false;
    if (eyeShut) eyeShut.hidden = true;
    say(loginNote, "");
    say(panelNote, "");
    if (userField) delete userField.dataset.state;
    if (passField) delete passField.dataset.state;
    hint(userHint, "");
    hint(passHint, "");
    if (loginSend) {
      loginSend.disabled = false;
      loginSend.textContent = t("loginSend");
    }
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
    if (userInput) userInput.focus({ preventScroll: true });
  });

  function renderStatus() {
    if (statusText) statusText.textContent = enabled ? t("on") : t("off");
    if (statusDetail) statusDetail.textContent = enabled ? t("onDetail") : t("offDetail");
    if (statusDot) {
      if (enabled) statusDot.removeAttribute("data-off");
      else statusDot.setAttribute("data-off", "");
    }
    if (statusBox) {
      statusBox.toggleAttribute("data-on", enabled);
      statusBox.toggleAttribute("data-off", !enabled);
    }
    if (toggleBtn) toggleBtn.setAttribute("aria-checked", enabled ? "true" : "false");
    if (toggleLabel) toggleLabel.textContent = enabled ? t("toggleOn") : t("toggleOff");
  }

  async function loadStatus() {
    try {
      const r = await fetch(`${ENDPOINT}/admin/status`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const d = await r.json();
      enabled = d.enabled !== false;
      say(panelNote, "");
    } catch {
      say(panelNote, t("statusFail"), "bad");
    }
    renderStatus();
  }

  function markLive() {
    touched = true;
    if (loginNote && loginNote.dataset.kind === "bad") say(loginNote, "");
    paintFields();
  }
  if (userInput) userInput.addEventListener("input", markLive);
  if (passInput) passInput.addEventListener("input", markLive);

  if (eye && passInput) {
    eye.addEventListener("click", () => {
      const show = passInput.type === "password";
      passInput.type = show ? "text" : "password";
      eye.setAttribute("aria-pressed", show ? "true" : "false");
      eye.setAttribute("aria-label", show ? t("hidePass") : t("showPass"));
      if (eyeOpen) eyeOpen.hidden = show;
      if (eyeShut) eyeShut.hidden = !show;
      passInput.focus({ preventScroll: true });
    });
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    touched = true;
    const username = (userInput && userInput.value.trim()) || "";
    const password = (passInput && passInput.value) || "";
    paintFields();
    if (!username || !password) {
      say(loginNote, !username ? t("userEmpty") : t("passEmpty"), "bad");
      return;
    }
    setWait(true);
    if (loginSend) loginSend.textContent = t("loginWait");
    say(loginNote, t("loginWait"), "wait");
    hint(userHint, t("loginWait"), "wait");
    hint(passHint, t("loginWait"), "wait");
    let outcome = "fail";
    try {
      const r = await fetch(`${ENDPOINT}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({ username, password }),
      });
      if (r.status === 429) outcome = "rate";
      else if (r.status === 401 || r.status === 403) outcome = "bad";
      else if (!r.ok) outcome = "fail";
      else {
        const d = await r.json();
        outcome = d.ok ? "ok" : "bad";
      }
    } catch {
      outcome = "fail";
    }
    setWait(false);
    if (loginSend) loginSend.textContent = t("loginSend");
    if (outcome !== "ok") {
      const key = outcome === "rate" ? "loginRate" : outcome === "bad" ? "loginBad" : "loginFail";
      say(loginNote, t(key), "bad");
      paintFields();
      return;
    }
    if (userField) userField.dataset.state = "ok";
    if (passField) passField.dataset.state = "ok";
    hint(userHint, t("loginOk"), "ok");
    hint(passHint, t("loginOk"), "ok");
    say(loginNote, t("loginOk"), "ok");
    creds = { username, password };
    window.setTimeout(() => {
      if (!modal.open || !creds) return;
      loginForm.hidden = true;
      panel.hidden = false;
      say(panelNote, "");
      loadStatus();
    }, 420);
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      if (!creds || toggleBtn.disabled) return;
      const next = !enabled;
      toggleBtn.disabled = true;
      say(panelNote, t("toggleWait"), "wait");
      let failed = false;
      try {
        const r = await fetch(`${ENDPOINT}/admin/toggle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(12000),
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
        say(panelNote, t("toggleOk"), "ok");
      } catch {
        failed = true;
        say(panelNote, t("toggleFail"), "bad");
      } finally {
        toggleBtn.disabled = false;
      }
      if (!failed) window.setTimeout(() => {
        if (panelNote && panelNote.dataset.kind === "ok") say(panelNote, "");
      }, 1600);
    });
  }

  const logout = panel.querySelector("[data-admin-logout]");
  if (logout) logout.addEventListener("click", () => resetToLogin());

  new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  apply();
})();
