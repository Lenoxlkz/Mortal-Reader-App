// sync:fallback:start
const FALLBACK = {
  "schema": 1,
  "appName": "Mortal Reader",
  "versionName": "3.8",
  "sitesEnabled": 228,
  "updatedAt": "2026-11-08T03:34:52Z",
  "commit": "08f0701",
  "release": {
    "name": "3.8.7",
    "tag": "3.8.7",
    "body": "English: The collection has been expanded, a new auto-scroll function has been added for reading, and a new cache and cookie cleaning function has been added. \r\nEspañol: Se ha ampliado la colección, se ha añadido una nueva función de desplazamiento automático para la lectura y se ha incorporado una nueva función de limpieza de caché y cookies.",
    "publishedAt": "2026-11-08T03:33:51Z",
    "url": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/tag/3.8.7",
    "downloadUrl": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/download/3.8.7/Mortal_Reader_v3.8.APK"
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
    lede: "Una aplicación Android independiente. Diferentes sitios. Una experiencia unificada. Lee, explora y reproduce. Manga, Manhwa, Novelas ligeras y Anime. Diferentes sitios web desde un solo lugar. GeckoView como motor de navegación. Sin cuentas propias de Mortal Reader. Todo se queda en el dispositivo. Administra sitios y cuentas desde una app.",
    download: "Descargar versión",
    repo: "Ver repositorio",
    phoneLabel: "En el teléfono",
    phoneAria: "Vista de la app",
    read: "Lectura",
    novel: "Novela",
    play: "Reproducción",
    phoneNote:
      "El contenido permanece alojado en sus respectivos sitios web externos. Navegación más segura que la habitual: el DNS de AdGuard va integrado para reforzar la privacidad. Pero no asegura que todo sea confiable.",
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
    p1t: "Sin cuenta propia",
    p1b: "Mortal Reader no requiere cuentas propias ni utiliza un servidor central para alojar el contenido. La navegación y las interacciones se realizan directamente con los sitios externos, que mantienen sus propias políticas de privacidad y seguimiento.",
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
    foot: "Mortal Reader ~ El contenido no es de esta app.",
    meta: "Aplicación Android independiente para leer manga, manhwa y novelas ligeras, y reproducir anime, desde un solo lugar.",
  },
  en: {
    skip: "Skip to content",
    profile: "Profile",
    langLabel: "Language",
    statusBoot: "Syncing",
    statusLive: "Live",
    statusBackup: "Backup data",
    kicker: "Local bridge",
    lede: "A standalone Android app. Different sites. One unified experience. Read, explore and play. Manga, manhwa, light novels and anime. Different websites from one place. GeckoView as the browsing engine. No Mortal Reader accounts of its own. Everything stays on the device. Manage sites and accounts from the app.",
    download: "Download version",
    repo: "View repository",
    phoneLabel: "On the phone",
    phoneAria: "App preview",
    read: "Reading",
    novel: "Novel",
    play: "Playback",
    phoneNote:
      "The content stays hosted on its own external websites. Safer browsing than usual: AdGuard DNS is built in to strengthen privacy. That does not mean everything can be trusted.",
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
    p1t: "No app account",
    p1b: "Mortal Reader does not require accounts of its own and does not use a central server to host the content. Browsing and interactions happen directly with the external sites, which keep their own privacy and tracking policies.",
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
    foot: "Mortal Reader ~ The content is not from this app.",
    meta: "A standalone Android app to read manga, manhwa and light novels, and to watch anime, from one place.",
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
  document.querySelectorAll(".sticker.cream, .sticker.red").forEach((el, index) => {
    const labels = currentLang() === "en"
      ? ["MANGA", "MANHWA", "NOVEL", "ANIME", "ES", "EN", "MULTI", "GECKO"]
      : ["MANGA", "MANHWA", "NOVELA", "ANIME", "ES", "EN", "MULTI", "GECKO"];
    el.textContent = labels[index % labels.length];
  });
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

function mountPoster() {
  const root = document.querySelector("[data-poster]");
  if (!root) return;
  const glyphs = ["📚", "📖", "📕", "🎬", "🐉", "🦊", "⭐", "🌙", "🛡️", "🎧", "✨", "🔖", "🎌", "💬", "📜", "🔥"];
  const labels = currentLang() === "en"
    ? ["MANGA", "MANHWA", "NOVEL", "ANIME", "ES", "EN", "MULTI", "GECKO"]
    : ["MANGA", "MANHWA", "NOVELA", "ANIME", "ES", "EN", "MULTI", "GECKO"];
  for (let i = 0; i < 70; i += 1) {
    const el = document.createElement("span");
    const label = i % 4 === 0;
    el.className = label ? (i % 8 === 0 ? "sticker red" : "sticker cream") : "sticker";
    el.textContent = label ? labels[Math.floor(i / 4) % labels.length] : glyphs[i % glyphs.length];
    const col = i % 5;
    const row = Math.floor(i / 5);
    const jitter = (i * 17) % 18 - 8;
    el.style.left = `calc(${col * 19 + 1}% + ${jitter}px)`;
    el.style.top = `${row * 7.6 + (i % 3) * 1.3}%`;
    el.style.setProperty("--r", `${(i * 29) % 28 - 14}deg`);
    el.style.setProperty("--s", `${2.5 + (i % 3) * 0.65}rem`);
    root.append(el);
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let frame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        root.style.transform = `translate3d(0, ${-window.scrollY * 0.42}px, 0)`;
        frame = 0;
      });
    },
    { passive: true },
  );
}

mountPoster();
