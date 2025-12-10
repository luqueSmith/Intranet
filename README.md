# Intranet I.E. Julio C. Tello

Intranet sencilla hecha con **HTML + CSS + JavaScript puro**, pensada para usarse como demo o base de un proyecto real.

## Funcionalidades

- Panel principal (dashboard)
- Módulo de **Comunicados** (guardados en `localStorage`)
- **Chat efímero** (mensajes se borran a los 10 min)
- **Gestor documental** (guarda metadatos del archivo en `localStorage`)
- Enlaces institucionales con buscador
- Sección de configuración (maqueta)
- PWA básica:
  - Se puede **instalar** en PC o móvil
  - Icono y nombre configurables

## Estructura

```text
index.html         # Página principal
styles.css         # Estilos personalizados
app.js             # Lógica de la intranet
manifest.webmanifest
sw.js              # Service Worker para modo "instalable"
icons/             # Iconos de la app
logos/             # Logos usados en el dashboard y accesos rápidos
