// sync:fallback:start
const FALLBACK = {
  "schema": 1,
  "appName": "Mortal Reader",
  "versionName": "3.8",
  "sitesEnabled": 214,
  "updatedAt": "2026-11-04T18:07:43Z",
  "commit": "7ccfc8a",
  "release": {
    "name": "V3.8.4",
    "tag": "V3.8.4",
    "body": "Se añadieron más sitios en inglés. \r\nSe mejoró el anti-adblocker.",
    "publishedAt": "2026-11-04T18:07:01Z",
    "url": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/tag/V3.8.4",
    "downloadUrl": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/download/V3.8.4/Mortal_Reader_v3.8.APK"
  },
  "repo": "https://github.com/Lenoxlkz/Mortal-Reader-App"
};
// sync:fallback:end

const SOURCES = [
  "https://raw.githubusercontent.com/Lenoxlkz/Mortal-Reader-App/live-data/live.json",
  "https://cdn.jsdelivr.net/gh/Lenoxlkz/Mortal-Reader-App@live-data/live.json",
  "https://cdn.statically.io/gh/Lenoxlkz/Mortal-Reader-App/live-data/live.json",
  "live.json",
];

function parseSnap(value) {
  if (!value || value.schema !== 1) return null;
  if (typeof value.appName !== "string" || typeof value.versionName !== "string") return null;
  if (typeof value.sitesEnabled !== "number" || typeof value.repo !== "string") return null;
  const release = value.release;
  const okRelease =
    release && typeof release.name === "string" && typeof release.url === "string"
      ? {
          name: release.name,
          tag: typeof release.tag === "string" ? release.tag : "",
          body: typeof release.body === "string" ? release.body : "",
          publishedAt: typeof release.publishedAt === "string" ? release.publishedAt : "",
          url: release.url,
          downloadUrl: typeof release.downloadUrl === "string" ? release.downloadUrl : "",
        }
      : null;
  return {
    schema: 1,
    appName: value.appName,
    versionName: value.versionName,
    sitesEnabled: Math.max(0, Math.round(value.sitesEnabled)),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    commit: typeof value.commit === "string" ? value.commit : "",
    release: okRelease,
    repo: value.repo,
  };
}

async function pull(url) {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(2800) });
  if (!response.ok) throw new Error(String(response.status));
  const snap = parseSnap(await response.json());
  if (!snap) throw new Error("shape");
  return snap;
}

async function loadLive() {
  for (const url of SOURCES) {
    try {
      return await pull(url);
    } catch {
      /* next mirror */
    }
  }
  return null;
}

const COPY = {
  es: {
    skip: "Saltar al contenido",
    profile: "Perfil",
    langLabel: "Idioma",
    statusBoot: "Sincronizando",
    statusLive: "En vivo",
    statusBackup: "Datos de respaldo",
    kicker: "Puente local",
    lede: "Colecciona sitios para leer Mangas, Manhwas, Novelas y reproducir Anime, en distintos idiomas. La app solo abre el puente. Sin cuentas o registro. Todo se queda en el dispositivo. Administra sitios y cuentas desde una app.",
    download: "Descargar versión",
    repo: "Ver repositorio",
    phoneLabel: "En el teléfono",
    phoneAria: "Vista de la app",
    read: "Lectura",
    novel: "Novela",
    play: "Reproducción",
    phoneNote:
      "Navegación más segura que la habitual: el DNS de AdGuard va integrado para reforzar la privacidad. Eso no asegura que todo sea confiable.",
    statsAria: "Estado del repositorio",
    statVersion: "Versión",
    statSites: "Sitios en el puente",
    statPublished: "Publicado",
    noteBoot: "Consultando el repositorio…",
    noteBackup: "Datos de respaldo. No se pudo consultar el repositorio.",
    catalogKicker: "El catálogo",
    catalogTitle: "Un punto por sitio.",
    catalogBody: "El número se actualiza cuando cambia el repositorio. Los enlaces viven solo dentro de la app.",
    countBoot: "Consultando el catálogo…",
    p1k: "Teléfono",
    p1t: "Sin cuenta",
    p1b: "No hay registro en esta app. Los sitios y las cuentas se administran en el dispositivo.",
    p2k: "Lectura",
    p2t: "Todo en uno",
    p2b: "Manga, manhwa, novela y anime, en español, inglés o varios idiomas, dentro de una sola herramienta.",
    p3k: "Puente",
    p3t: "Solo un puente",
    p3b: "La app no aloja el contenido. Abre el sitio. El resto es de quien lo publica.",
    noticeKicker: "Aviso",
    n1: "Esta aplicación ha sido concebida exclusivamente como una herramienta «Todo en Uno». Su esencia no trasciende más allá de esta funcionalidad unificada.",
    n2: "Es imperativo aclarar que los anuncios emergentes o las páginas caídas que no respondan son responsabilidad absoluta de los autores de dichas páginas externas. Esta aplicación no guarda relación alguna con dichos contenidos ni su gestión.",
    n3: "No podemos garantizar que el usuario se vea exento de presenciar publicidad en sitios de terceros.",
    releaseKicker: "Última actualización",
    releaseLink: "Ver release",
    foot: "Mortal Reader. El contenido no es de esta app.",
    meta: "Mortal Reader reúne manga, manhwa, novela y anime en un puente local, en español, inglés o varios idiomas.",
  },
  en: {
    skip: "Skip to content",
    profile: "Profile",
    langLabel: "Language",
    statusBoot: "Syncing",
    statusLive: "Live",
    statusBackup: "Backup data",
    kicker: "Local bridge",
    lede: "Collect sites to read manga, manhwa and novels, and to watch anime, in more than one language. The app only opens the bridge. No accounts or sign-up. Everything stays on the device. Manage sites and accounts from one app.",
    download: "Download version",
    repo: "View repository",
    phoneLabel: "On the phone",
    phoneAria: "App preview",
    read: "Reading",
    novel: "Novel",
    play: "Playback",
    phoneNote:
      "Safer than ordinary browsing: AdGuard DNS is built in to strengthen privacy. That does not mean every site can be trusted.",
    statsAria: "Repository status",
    statVersion: "Version",
    statSites: "Sites on the bridge",
    statPublished: "Published",
    noteBoot: "Checking the repository…",
    noteBackup: "Backup data. The repository could not be reached.",
    catalogKicker: "The catalog",
    catalogTitle: "One dot per site.",
    catalogBody: "The count updates when the repository changes. Links stay inside the app.",
    countBoot: "Checking the catalog…",
    p1k: "Phone",
    p1t: "No account",
    p1b: "There is no sign-up in this app. Sites and accounts are managed on the device.",
    p2k: "Reading",
    p2t: "All in one",
    p2b: "Manga, manhwa, novels and anime, in Spanish, English or multiple languages, in a single tool.",
    p3k: "Bridge",
    p3t: "Just a bridge",
    p3b: "The app does not host the content. It opens the site. The rest belongs to whoever publishes it.",
    noticeKicker: "Notice",
    n1: "This application was built only as an all-in-one tool. It does not go beyond that single purpose.",
    n2: "Pop-ups or pages that fail to load are entirely the responsibility of the people who publish those outside pages. This application has nothing to do with that content or how it is run.",
    n3: "We cannot guarantee that you will not see advertising on third-party sites.",
    releaseKicker: "Latest update",
    releaseLink: "View release",
    foot: "Mortal Reader. The content is not from this app.",
    meta: "Mortal Reader gathers manga, manhwa, novels and anime in a local bridge, in Spanish, English or multiple languages.",
  },
};

function currentLang() {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function t(key) {
  const pack = COPY[currentLang()] || COPY.es;
  return pack[key] || COPY.es[key] || "";
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key) node.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const key = node.getAttribute("data-i18n-aria");
    if (key) node.setAttribute("aria-label", t(key));
  });
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", t("meta"));
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", button.getAttribute("data-lang") === currentLang() ? "true" : "false");
  });
}

function formatUtc(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(currentLang(), {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

let view = { phase: "boot", snap: null };

function paint(snap, phase) {
  view = { phase, snap };
  const status = phase === "live" ? t("statusLive") : t("statusBackup");
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = status;
  });
  const version = document.querySelector("[data-version]");
  if (version) version.textContent = snap.versionName;
  const versionBtn = document.querySelector("[data-version-btn]");
  const versionLabel = document.querySelector("[data-download]");
  if (versionLabel) versionLabel.textContent = `${t("download")} ${snap.versionName}`;
  if (versionBtn) {
    versionBtn.href = (snap.release && snap.release.downloadUrl) || (snap.release && snap.release.url) || snap.repo;
  }
  const sites = document.querySelector("[data-sites]");
  if (sites) sites.textContent = String(snap.sitesEnabled);
  const when = document.querySelector("[data-published]");
  if (when) when.textContent = snap.release ? formatUtc(snap.release.publishedAt) : "—";
  const note = document.querySelector("[data-note]");
  if (note) {
    const tail = snap.commit ? ` · ${snap.commit}` : "";
    note.textContent =
      phase === "live"
        ? currentLang() === "en"
          ? `Read from the repository${tail}.`
          : `Leído del repositorio${tail}.`
        : t("noteBackup");
  }
  const field = document.querySelector("[data-stars]");
  if (field) {
    field.replaceChildren();
    const total = Math.min(snap.sitesEnabled, 240);
    for (let i = 0; i < total; i += 1) {
      const star = document.createElement("span");
      star.className = i === snap.sitesEnabled - 1 ? "star on" : "star";
      field.append(star);
    }
  }
  const countLine = document.querySelector("[data-count-line]");
  if (countLine) {
    countLine.textContent =
      currentLang() === "en"
        ? `${snap.sitesEnabled} sites enabled. Addresses are not published here.`
        : `${snap.sitesEnabled} sitios habilitados. Las direcciones no se publican aquí.`;
  }
  const release = document.querySelector("[data-release]");
  if (release) {
    release.hidden = !snap.release;
    if (snap.release) {
      const title = release.querySelector("[data-release-name]");
      const body = release.querySelector("[data-release-body]");
      const link = release.querySelector("[data-release-link]");
      if (title) title.textContent = snap.release.name;
      if (body) body.textContent = snap.release.body;
      if (link) link.href = snap.release.url;
    }
  }
  document.querySelectorAll("[data-repo]").forEach((node) => {
    node.href = snap.repo;
  });
}

function paintPending() {
  view = { phase: "boot", snap: null };
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = t("statusBoot");
  });
  const note = document.querySelector("[data-note]");
  if (note) note.textContent = t("noteBoot");
  const countLine = document.querySelector("[data-count-line]");
  if (countLine) countLine.textContent = t("countBoot");
  const label = document.querySelector("[data-download]");
  if (label) label.textContent = t("download");
  const release = document.querySelector("[data-release]");
  if (release) release.hidden = true;
}

function setLang(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "es";
  try {
    localStorage.setItem("mr-lang", document.documentElement.lang);
  } catch {
    /* ignore */
  }
  applyI18n();
  if (view.phase === "boot") paintPending();
  else paint(view.snap || FALLBACK, view.phase === "live" ? "live" : "backup");
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => setLang(button.getAttribute("data-lang")));
});

let stored = "es";
try {
  const saved = localStorage.getItem("mr-lang");
  if (saved === "en" || saved === "es") stored = saved;
  else if ((navigator.language || "").toLowerCase().startsWith("en")) stored = "en";
} catch {
  stored = "es";
}
setLang(stored);
loadLive().then((snap) => {
  if (snap) paint(snap, "live");
  else paint(FALLBACK, "backup");
});
