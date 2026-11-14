// Mortal Reader · Worker que crea el issue de una sugerencia de sitio web
// y que controla, mediante un panel con usuario y contraseña, si la página
// puede recibir sugerencias nuevas. Los secretos viven solo aquí, como
// secretos de Cloudflare. Nunca llegan al navegador.
//
// Secretos:  GITHUB_TOKEN      (fine-grained, solo permiso Issues en este repo)
//            TURNSTILE_SECRET  (clave secreta del widget de Turnstile)
//            ADMIN_USER        (usuario del panel de administración)
//            ADMIN_PASS        (contraseña del panel de administración)
// Variables: REPO              (por defecto Lenoxlkz/Mortal-Reader-App)
//            ALLOWED_ORIGIN    (por defecto https://lenoxlkz.github.io)
// KV:        CONFIG            (obligatorio para el panel: guarda si las sugerencias
//                               están habilitadas; sin este binding nunca se bloquean)
//            RATE              (opcional: limita a 5 sugerencias por hora por IP,
//                               y también acota los intentos de acceso al panel)

const MAX_TEXT = 2000;
const MAX_URL = 300;
const ACTION = "suggest"; // debe coincidir con data-action / action del widget en la página
const LANGS = ["ES", "EN", "Multi", ""];
const ENABLED_KEY = "suggest_enabled";

const corsHeaders = (allowed) => ({
  "Access-Control-Allow-Origin": allowed,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const reply = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...headers } });

// Evita menciones (@usuario) que notifiquen a otras personas
const clean = (s) => s.replace(/@/g, "@\u200b").replace(/\r/g, "");

// Compara dos cadenas en tiempo constante, para no filtrar su longitud por temporización
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Sin el KV de configuración, nunca se bloquea nada (falla abierto para no
// dejar la página rota si alguien olvida crear el binding).
async function isEnabled(env) {
  if (!env.CONFIG) return true;
  const v = await env.CONFIG.get(ENABLED_KEY);
  return v !== "0";
}

// Sin ADMIN_USER / ADMIN_PASS configurados, el panel falla cerrado: nadie entra.
function checkAdmin(env, body) {
  if (!env.ADMIN_USER || !env.ADMIN_PASS) return false;
  const user = String((body && body.username) || "");
  const pass = String((body && body.password) || "");
  return safeEqual(user, env.ADMIN_USER) && safeEqual(pass, env.ADMIN_PASS);
}

async function rateLimited(env, bucket, limit, request) {
  if (!env.RATE) return false;
  const ip = request.headers.get("CF-Connecting-IP") || "x";
  const key = `${bucket}:${ip}`;
  const n = parseInt((await env.RATE.get(key)) || "0", 10);
  if (n >= limit) return true;
  await env.RATE.put(key, String(n + 1), { expirationTtl: 3600 });
  return false;
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "https://lenoxlkz.github.io";
    const h = corsHeaders(allowed);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: h });

    const path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";

    // ---- Estado público: la página lo consulta para saber si mostrar el formulario ----
    if (path === "/admin/status") {
      if (request.method !== "GET") return reply({ error: "method" }, 405, h);
      return reply({ enabled: await isEnabled(env) }, 200, h);
    }

    // A partir de aquí, todo exige que el origen coincida (igual que la creación de issues)
    if (request.headers.get("Origin") !== allowed) return reply({ error: "origin" }, 403, h);

    // ---- Inicio de sesión del panel: solo comprueba las credenciales, no guarda sesión ----
    if (path === "/admin/login") {
      if (request.method !== "POST") return reply({ error: "method" }, 405, h);
      if (await rateLimited(env, "admin", 20, request)) return reply({ error: "rate" }, 429, h);
      const body = await readJson(request);
      if (!checkAdmin(env, body)) return reply({ error: "auth" }, 401, h);
      return reply({ ok: true }, 200, h);
    }

    // ---- Habilitar/deshabilitar el envío de sugerencias ----
    if (path === "/admin/toggle") {
      if (request.method !== "POST") return reply({ error: "method" }, 405, h);
      if (await rateLimited(env, "admin", 20, request)) return reply({ error: "rate" }, 429, h);
      const body = await readJson(request);
      if (!checkAdmin(env, body)) return reply({ error: "auth" }, 401, h);
      if (!env.CONFIG) return reply({ error: "config" }, 500, h);
      const nextEnabled = !!(body && body.enabled !== false);
      await env.CONFIG.put(ENABLED_KEY, nextEnabled ? "1" : "0");
      return reply({ ok: true, enabled: nextEnabled }, 200, h);
    }

    // ---- Crear la sugerencia como issue (comportamiento original) ----
    if (request.method !== "POST") return reply({ error: "method" }, 405, h);
    if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET) return reply({ error: "config" }, 500, h); // falla cerrado
    if (!(await isEnabled(env))) return reply({ error: "disabled" }, 403, h);

    const d = await readJson(request);
    if (!d) return reply({ error: "json" }, 400, h);
    if (d.company) return reply({ ok: true }, 200, h); // trampa para bots: finge éxito

    const text = clean(String(d.text || "").trim().slice(0, MAX_TEXT));
    const siteLang = LANGS.includes(d.siteLang) ? d.siteLang : "";
    const en = d.lang === "en";
    let url = String(d.url || "").trim().slice(0, MAX_URL);
    if (text.length < 12) return reply({ error: "short" }, 400, h);
    try {
      const u = new URL(url);
      url = /^https?:$/.test(u.protocol) ? u.href : "";
    } catch {
      url = "";
    }

    const ip = request.headers.get("CF-Connecting-IP") || "";

    // Turnstile: se verifica en el servidor (token, acción y dominio). Acepta el estandar y el nombre antiguo.
    const token = String(d["cf-turnstile-response"] || d.captcha || "");
    if (!token || token.length > 2048) return reply({ error: "captcha" }, 403, h);
    let verified = false;
    try {
      const params = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
      if (ip) params.set("remoteip", ip);
      const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10000),
        body: params,
      });
      if (check.ok) {
        const v = await check.json();
        verified = v.success === true && v.action === ACTION && v.hostname === new URL(allowed).hostname;
      }
    } catch {}
    if (!verified) return reply({ error: "captcha" }, 403, h);

    if (await rateLimited(env, "ip", 5, request)) return reply({ error: "rate" }, 429, h);

    const first = text.split("\n").map((x) => x.trim()).find(Boolean) || "";
    const short = first.length > 72 ? first.slice(0, 69) + "…" : first;
    const title = (en ? "Suggestion: " : "Sugerencia: ") + short;
    const none = en ? "Not provided" : "No indicado";
    const body = en
      ? `### Suggestion\n${text}\n\n### Link\n${url || none}\n\n### Language\n${siteLang || none}\n\n---\nSent from the Mortal Reader page.`
      : `### Sugerencia\n${text}\n\n### Enlace\n${url || none}\n\n### Idioma\n${siteLang || none}\n\n---\nEnviado desde la página de Mortal Reader.`;

    const res = await fetch(`https://api.github.com/repos/${env.REPO || "Lenoxlkz/Mortal-Reader-App"}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "mortal-suggest-worker",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ title, body, labels: ["sugerencia"] }),
    });
    if (!res.ok) return reply({ error: "github", status: res.status }, 502, h);
    const issue = await res.json();
    return reply({ ok: true, number: issue.number, url: issue.html_url }, 201, h);
  },
};
