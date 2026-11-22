# Mortal Reader

Este es un proyecto de Android Studio que puedes abrir y compilar.

- MainActivity en app/src/main/java abre la página o los archivos locales de esta aplicación en un WebView.
- app/src/main/AndroidManifest.xml lleva el nombre del paquete, los permisos y el icono.
- app/src/main/assets/app_config.json es la configuración de ejecución que WebToApp incluye en el APK. Una compilación cifrada guarda ese archivo como texto cifrado; esta copia es texto plano.
- app/src/main/res/xml/network_security_config.xml y res/raw/ son los ajustes de confianza de red.
- app/src/main/assets/www/ y assets/files/ guardan HTML, frontend, galería, splash y audio locales. Se omiten node_modules y .git.

Abre esta carpeta en Android Studio para sincronizar y compilar. El archivo no incluye el almacén de claves de firma ni todo el runtime del shell de WebToApp. Puede incluir secretos de activación y credenciales de proxy.

## Restaurar el proyecto

Este archivo también es una copia de seguridad de WebToApp. apps.json en la raíz guarda la configuración completa, resources/ guarda iconos y multimedia, y local/files/ guarda los fuentes de HTML, frontend y de los proyectos Node.js, PHP, Python, Go y WordPress. Tras reinstalar, abre Menú > Copia de datos > Importar datos y elige este zip para restaurar la app.

Solo contiene esta app, sin ajustes globales, módulos de extensión ni almacenes de claves de firma. Usa Exportar datos para una instantánea completa.