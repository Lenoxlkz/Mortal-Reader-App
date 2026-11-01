const FALLBACK = {
  schema: 1,
  appName: "Mortal Reader",
  versionName: "3.5",
  sitesEnabled: 138,
  updatedAt: "2026-11-01T01:04:29Z",
  commit: "0d59d7fc",
  release: {
    name: "Actualización a v3.5",
    tag: "Nuevo/Ahora",
    body: "Actualización de versión v3.5\n~ Solo dispositivos arm64-v8a.",
    publishedAt: "2026-10-31T23:40:08Z",
    url: "https://github.com/Lenoxlkz/Mortal-Reader-App/releases/tag/Nuevo/Ahora",
  },
  repo: "https://github.com/Lenoxlkz/Mortal-Reader-App",
};

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
  const status = phase === "live" ? "En vivo" : "Copia local";
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = status;
  });
  const version = document.querySelector("[data-version]");
  if (version) version.textContent = snap.versionName;
  const versionBtn = document.querySelector("[data-version-btn]");
  if (versionBtn) versionBtn.textContent = `Versión ${snap.versionName}`;
  const sites = document.querySelector("[data-sites]");
  if (sites) sites.textContent = String(snap.sitesEnabled);
  const when = document.querySelector("[data-published]");
  if (when) when.textContent = snap.release ? formatUtc(snap.release.publishedAt) : "—";
  const note = document.querySelector("[data-note]");
  if (note) {
    note.textContent =
      phase === "live"
        ? `Leído del repositorio${snap.commit ? ` · ${snap.commit}` : ""}.`
        : "Mostrando la última copia conocida. Las direcciones no se publican aquí.";
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
  if (release && snap.release) {
    const title = release.querySelector("[data-release-name]");
    const body = release.querySelector("[data-release-body]");
    const link = release.querySelector("[data-release-link]");
    if (title) title.textContent = snap.release.name;
    if (body) body.textContent = snap.release.body;
    if (link) link.href = snap.release.url;
    const buttons = document.querySelectorAll("[data-release-href]");
    buttons.forEach((node) => {
      node.href = snap.release.url;
    });
  }
  document.querySelectorAll("[data-repo]").forEach((node) => {
    node.href = snap.repo;
  });
}

paint(FALLBACK, "local");
document.querySelectorAll("[data-status]").forEach((node) => {
  node.textContent = "Sincronizando";
});

loadLive().then((snap) => {
  if (snap) paint(snap, "live");
  else paint(FALLBACK, "local");
});
