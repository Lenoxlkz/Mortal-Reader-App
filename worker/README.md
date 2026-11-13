# Worker de sugerencias

Crea el issue en GitHub sin exponer ningún token en la página.

## 1. Token nuevo (el anterior se publicó, revócalo)
GitHub → Settings → Developer settings → Fine-grained tokens → Generate.
- Repository access: solo `Mortal-Reader-App`.
- Permissions: **Issues: Read and write**. Nada más.
- Expiración: la que prefieras.

## 2. Worker en Cloudflare
1. Workers & Pages → Create → Worker → nombre `mortal-suggest` → Deploy.
2. Edit code → pega `worker/suggest-worker.js` → Deploy.
3. Settings → Variables and Secrets:
   - Secret `GITHUB_TOKEN` = el token nuevo.
   - Text `REPO` = `Lenoxlkz/Mortal-Reader-App`
   - Text `ALLOWED_ORIGIN` = `https://lenoxlkz.github.io`
4. Opcional, recomendado (límite de 5 sugerencias por hora por IP): Storage & Databases → KV → Create `mortal-rate`. Luego Worker → Settings → Bindings → Add → KV namespace → variable `RATE`.

## 3. Conectar la página
Copia la URL del Worker (`https://mortal-suggest.<tu-subdominio>.workers.dev`) y pégala en `ENDPOINT` al inicio de `docs/suggest.js`.

Si `ENDPOINT` está vacío, o el Worker falla, la página abre GitHub con el issue ya escrito.
