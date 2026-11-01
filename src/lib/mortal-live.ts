export type LiveRelease = {
  name: string;
  tag: string;
  body: string;
  publishedAt: string;
  url: string;
};

export type LiveSnap = {
  schema: 1;
  appName: string;
  versionName: string;
  sitesEnabled: number;
  updatedAt: string;
  commit: string;
  release: LiveRelease | null;
  repo: string;
};

export const FALLBACK: LiveSnap = {
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
  "https://raw.githubusercontent.com/Lenoxlkz/Mortal-Reader-App/main/docs/live.json",
];

function asRelease(value: unknown): LiveRelease | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  if (typeof r.url !== "string" || typeof r.name !== "string") return null;
  return {
    name: r.name,
    tag: typeof r.tag === "string" ? r.tag : "",
    body: typeof r.body === "string" ? r.body : "",
    publishedAt: typeof r.publishedAt === "string" ? r.publishedAt : "",
    url: r.url,
  };
}

export function parseSnap(value: unknown): LiveSnap | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (v.schema !== 1) return null;
  if (typeof v.appName !== "string" || typeof v.versionName !== "string") return null;
  if (typeof v.sitesEnabled !== "number" || !Number.isFinite(v.sitesEnabled)) return null;
  if (typeof v.repo !== "string") return null;
  return {
    schema: 1,
    appName: v.appName,
    versionName: v.versionName,
    sitesEnabled: Math.max(0, Math.round(v.sitesEnabled)),
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : "",
    commit: typeof v.commit === "string" ? v.commit : "",
    release: asRelease(v.release),
    repo: v.repo,
  };
}

async function pull(url: string, signal: AbortSignal): Promise<LiveSnap> {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(String(response.status));
  const snap = parseSnap(await response.json());
  if (!snap) throw new Error("shape");
  return snap;
}

export async function loadLive(parent: AbortSignal): Promise<LiveSnap | null> {
  for (const url of SOURCES) {
    if (parent.aborted) return null;
    const timeout = AbortSignal.timeout(2800);
    const signal = AbortSignal.any([parent, timeout]);
    try {
      return await pull(url, signal);
    } catch {
      /* next mirror */
    }
  }
  return null;
}

export function formatUtc(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
