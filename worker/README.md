# Worker de sugerencias

Crea el issue en GitHub sin exponer ningún token en la página, y además controla,
con usuario y contraseña, si la página puede recibir sugerencias nuevas.

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
   - Secret `ADMIN_USER` = el usuario con el que entras al panel.
   - Secret `ADMIN_PASS` = la contraseña del panel. Usa una contraseña larga
     y que no uses en ningún otro sitio; quien la tenga puede apagar las
     sugerencias de la página.
   - Text `REPO` = `Lenoxlkz/Mortal-Reader-App`
   - Text `ALLOWED_ORIGIN` = `https://lenoxlkz.github.io`
4. KV para el panel (obligatorio para poder habilitar/deshabilitar):
   - Workers & Pages → KV → Create → nombre `mortal-config`.
   - Worker → Settings → Bindings → Add → KV namespace → variable `CONFIG` → selecciona `mortal-config`.
   - Sin este binding, el botón del panel sigue funcionando pero el Worker nunca bloqueará nada (falla abierto).
5. Opcional, recomendado (límite de 5 sugerencias por hora por IP, y también
   acota los intentos de acceso al panel): KV → Create `mortal-rate`. Luego
   Worker → Settings → Bindings → Add → KV namespace → variable `RATE`.

## 3. Conectar la página
- `ENDPOINT` en `docs/suggest.js` y en `docs/admin.js` = URL del Worker (debe ser la misma en los dos archivos).
- `SITE_KEY` en `docs/suggest.js` = sitekey (pública) del widget de Turnstile.
- Si `ENDPOINT` está vacío, o el Worker o Turnstile fallan, la página abre GitHub con el issue ya escrito.

## 4. Turnstile
- El widget debe tener el dominio `lenoxlkz.github.io` en su lista.
- La página lo dibuja con `action: "suggest"`. El Worker rechaza cualquier token cuya acción o dominio no coincidan.
- Cada token sirve una sola vez. La página pide uno nuevo tras cada intento.
- La clave secreta solo existe como secreto del Worker. Nunca en el código ni en el chat.

## 5. Panel de administración
- Botón "Panel admin" al final de la página. Pide usuario y contraseña; si
  no coinciden con `ADMIN_USER` / `ADMIN_PASS`, el panel indica que el
  acceso fue denegado y no muestra ningún control.
- Con acceso correcto, el panel muestra el estado actual (habilitadas /
  bloqueadas) y un botón para cambiarlo. El cambio se guarda en el KV
  `CONFIG` y aplica de inmediato para cualquier visitante.
- Mientras está deshabilitado, el botón de sugerencias desaparece de la página. Si el modal ya estaba abierto, muestra el aviso de bloqueo indefinido y el botón de envío deja de poder usarse. El Worker también rechaza el envío.
- Las credenciales no quedan guardadas en el navegador: hay que iniciar
  sesión otra vez cada vez que se abre el panel.
