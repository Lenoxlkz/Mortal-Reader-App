// sync:fallback:start
const FALLBACK = {
  "schema": 1,
  "appName": "Mortal Reader",
  "versionName": "3.6",
  "sitesEnabled": 181,
  "updatedAt": "2026-11-03T11:51:07Z",
  "commit": "ebeae68",
  "release": {
    "name": "Actualización ",
    "tag": "v3.8.1",
    "body": "Se añadieron algunas utilidades:\r\n- Cambio inteligente entre modo oscuro y modo claro. \r\n- Guardador rápido para intercambiar entre sitios. \r\n- Anti-adblocker para sitios que bloquean los DNS. \r\n- Se añadió 1 sitio más.",
    "publishedAt": "2026-11-03T11:50:59Z",
    "url": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/tag/v3.8.1",
    "downloadUrl": "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/download/v3.8.1/Mortal_Reader_v3.8.APK"
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

function formatUtc(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function paint(snap, phase) {
  const status = phase === "live" ? "En vivo" : "Datos de respaldo";
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = status;
  });
  const version = document.querySelector("[data-version]");
  if (version) version.textContent = snap.versionName;
  const versionBtn = document.querySelector("[data-version-btn]");
  if (versionBtn) {
    versionBtn.textContent = `Descargar versión ${snap.versionName}`;
    versionBtn.href = (snap.release && snap.release.downloadUrl) || (snap.release && snap.release.url) || snap.repo;
  }
  const sites = document.querySelector("[data-sites]");
  if (sites) sites.textContent = String(snap.sitesEnabled);
  const when = document.querySelector("[data-published]");
  if (when) when.textContent = snap.release ? formatUtc(snap.release.publishedAt) : "—";
  const note = document.querySelector("[data-note]");
  if (note) {
    note.textContent =
      phase === "live"
        ? `Leído del repositorio${snap.commit ? ` · ${snap.commit}` : ""}.`
        : "Datos de respaldo. No se pudo consultar el repositorio.";
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
    countLine.textContent = `${snap.sitesEnabled} sitios habilitados. Ninguna URL sale del teléfono.`;
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
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = "Sincronizando";
  });
  const note = document.querySelector("[data-note]");
  if (note) note.textContent = "Consultando el repositorio…";
  const countLine = document.querySelector("[data-count-line]");
  if (countLine) countLine.textContent = "Consultando el catálogo…";
  const release = document.querySelector("[data-release]");
  if (release) release.hidden = true;
}

paintPending();
loadLive().then((snap) => {
  if (snap) paint(snap, "live");
  else paint(FALLBACK, "backup");
});
