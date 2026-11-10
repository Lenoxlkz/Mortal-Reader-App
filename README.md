<p align="center">
  <img src="docs/img/logo.jpg" alt="Mortal Reader" width="300" />
</p>

<h3 align="center">An app, an experiment. Curious? Read on.</h3>

<p align="center">
  <a href="https://lenoxlkz.github.io/Mortal-Reader-App/">Website</a> ·
  <a href="https://github.com/Lenoxlkz/Mortal-Reader-App/releases/latest">Download</a> ·
  <a href="https://whatsapp.com/channel/0029Vb90L58F1YlaitN2hx3R">WhatsApp channel</a>
</p>

---

### 1. WHAT IS IT?

Mortal Reader is a standalone Android app. It brings together different sites for reading manga, manhwa and light novels, and for watching anime, in one experience.

### 2. WHAT DOES IT OFFER?

Reading and playback from one place, in Spanish, English or multiple languages. It uses GeckoView as its browsing engine and AdGuard DNS for safer browsing than usual. It also includes auto-scroll while reading, plus cache and cookie cleaning. It does not ask for a Mortal Reader account, and it does not store the content on a server of its own.

### 3. HOW DOES IT WORK?

The app opens the site. Browsing happens directly with that external page, which keeps its own ads, privacy policy and tracking. The content is not Mortal Reader's: if a site shows advertising or fails to load, that belongs to whoever publishes it. AdGuard strengthens privacy, but it does not guarantee that every site can be trusted.

> If you want to feed your curiosity, give the apple a taste…

**[Download app →](https://github.com/Lenoxlkz/Mortal-Reader-App/releases/latest)**

---

<details>
<summary><b>Español</b></summary>

<br />

**Una app, un experimento. ¿Curioso? Sigue leyendo.**

#### 1. ¿QUÉ ES?

Mortal Reader es una aplicación Android independiente. Reúne distintos sitios para leer manga, manhwa y novelas ligeras, y para ver anime, en una sola experiencia.

#### 2. ¿QUÉ OFRECE?

Lectura y reproducción desde un solo lugar, en español, inglés o varios idiomas. Usa GeckoView como motor de navegación y el DNS de AdGuard para una navegación más segura que la habitual. Incluye desplazamiento automático al leer, además de limpieza de caché y cookies. No pide una cuenta de Mortal Reader y no guarda el contenido en un servidor propio.

#### 3. ¿CÓMO FUNCIONA?

La app abre el sitio. La navegación ocurre directamente con esa página externa, que mantiene sus propios anuncios, política de privacidad y seguimiento. El contenido no es de Mortal Reader: si un sitio muestra publicidad o no carga, eso es responsabilidad de quien lo publica. AdGuard refuerza la privacidad, pero no garantiza que todos los sitios sean confiables.

> Si quieres alimentar tu curiosidad, dale una probada a la manzana…

**[Descargar app →](https://github.com/Lenoxlkz/Mortal-Reader-App/releases/latest)**

</details>

---

### For developers

The website lives in `docs/` and is published with GitHub Pages. The version and the number of sites are read live from the `live-data` branch. That file is regenerated automatically whenever `app/src/main/assets/app_config.json` changes. It publishes no names or addresses.

This is an Android Studio project you can open and build:

- `MainActivity` in `app/src/main/java` opens the page or the local files of this app in a WebView.
- `app/src/main/AndroidManifest.xml` holds the package name, permissions and icon.
- `app/src/main/assets/app_config.json` is the runtime configuration that WebToApp bundles in the APK. An encrypted build stores it as ciphertext; this copy is plain text.
- `app/src/main/res/xml/network_security_config.xml` and `res/raw/` hold the network trust settings.
- `app/src/main/assets/www/` and `assets/files/` hold local HTML, frontend, gallery, splash and audio. `node_modules` and `.git` are left out.

Open the folder in Android Studio to sync and build. It does not include the signing keystore or the full WebToApp shell runtime. It may include activation secrets and proxy credentials.
