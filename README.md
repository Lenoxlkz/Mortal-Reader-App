# Mortal Reader

Sitio: https://lenoxlkz.github.io/Mortal-Reader-App/

Puente local para leer y reproducir en sitios de terceros, en distintos idiomas. Sin cuentas: todo queda en la app del dispositivo. La página muestra la versión y el número de sitios, sincronizados con este repositorio. Las direcciones no salen de la app.

Este es un proyecto de Android Studio que puedes abrir y compilar.

- MainActivity en app/src/main/java abre la página o los archivos locales de esta aplicación en un WebView.
- app/src/main/AndroidManifest.xml lleva el nombre del paquete, los permisos y el icono.
- app/src/main/assets/app_config.json es la configuración de ejecución que WebToApp incluye en el APK. Una compilación cifrada guarda ese archivo como texto cifrado; esta copia es texto plano.
- app/src/main/res/xml/network_security_config.xml y res/raw/ son los ajustes de confianza de red.
- app/src/main/assets/www/ y assets/files/ guardan HTML, frontend, galería, splash y audio locales. Se omiten node_modules y .git.

Abre esta carpeta en Android Studio para sincronizar y compilar. El archivo no incluye el almacén de claves de firma ni todo el runtime del shell de WebToApp. Puede incluir secretos de activación y credenciales de proxy.