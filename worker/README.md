# Worker de sugerencias

Crea el issue en GitHub sin exponer ningún token en la página.

## 1. Token de GitHub
GitHub → Settings → Developer settings → Fine-grained tokens → Generate.
- Repository access: solo `Mortal-Reader-App`.
- Permissions: **Issues: Read and write**. Nada más.

## 2. Worker en Cloudflare
1. Workers & Pages → Create → Worker → nombre `mortal-suggest` → Deploy.
2. Edit code → pega `worker/suggest-worker.js` → Deploy.
3. Settings → Variables and Secrets:
   - Secret `GITHUB_TOKEN` = el token de GitHub.
   - Secret `TURNSTILE_SECRET` = clave secreta del widget de Turnstile.
   - Text `REPO` = `Lenoxlkz/Mortal-Reader-App`
   - Text `ALLOWED_ORIGIN` = `https://lenoxlkz.github.io`
4. Opcional, recomendado (límite de 5 sugerencias por hora por IP): KV → Create `mortal-rate`. Luego Worker → Settings → Bindings → Add → KV namespace → variable `RATE`.

## 3. Conectar la página
- `ENDPOINT` en `docs/suggest.js` = URL del Worker.
- `SITE_KEY` en `docs/suggest.js` = sitekey (pública) del widget de Turnstile.
- Si `ENDPOINT` está vacío, o el Worker o Turnstile fallan, la página abre GitHub con el issue ya escrito.

## 4. Turnstile
- El widget debe tener el dominio `lenoxlkz.github.io` en su lista.
- La página lo dibuja con `action: "suggest"`. El Worker rechaza cualquier token cuya acción o dominio no coincidan.
- Cada token sirve una sola vez. La página pide uno nuevo tras cada intento.
- La clave secreta solo existe como secreto del Worker. Nunca en el código ni en el chat.
