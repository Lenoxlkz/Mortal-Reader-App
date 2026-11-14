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
   - Secret `GITHUB_TOKEN` = el token.
   - Secret `RECAPTCHA_SECRET` = clave secreta de reCAPTCHA (paso 4).
   - Text `REPO` = `Lenoxlkz/Mortal-Reader-App`
   - Text `ALLOWED_ORIGIN` = `https://lenoxlkz.github.io`
4. Opcional, recomendado (límite de 5 sugerencias por hora por IP): KV → Create `mortal-rate`. Luego Worker → Settings → Bindings → Add → KV namespace → variable `RATE`.

## 3. Conectar la página
Pega la URL del Worker en `ENDPOINT` al inicio de `docs/suggest.js`.
Si `ENDPOINT` está vacío, o el Worker falla, la página abre GitHub con el issue ya escrito.

## 4. reCAPTCHA v2
1. https://www.google.com/recaptcha/admin/create
2. Etiqueta: `Mortal Reader`. Tipo: **reCAPTCHA v2** → casilla «No soy un robot».
3. Dominios: `lenoxlkz.github.io` (sin https ni rutas). Envía.
4. **Clave del sitio** (pública) → pégala en `SITE_KEY` de `docs/suggest.js`.
5. **Clave secreta** → solo como secreto `RECAPTCHA_SECRET` del Worker. Nunca en el código ni en el chat.
6. Vuelve a desplegar el Worker con el código nuevo (Edit code → pegar → Deploy).

Si no se define `RECAPTCHA_SECRET`, el Worker no exige el captcha.
