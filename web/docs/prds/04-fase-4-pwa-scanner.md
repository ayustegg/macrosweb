# PRD 04 — Fase 4: PWA + escáner de códigos de barras

## Goal

La app se siente como una app nativa: **instalable en pantalla de inicio** (iOS y Android), funciona offline (lectura de datos cacheados), y el usuario puede **escanear un código de barras** para encontrar y registrar un producto.

## User journeys

### Instalación

1. Usuario visita la web en móvil 2-3 veces → aparece banner sutil "Instala macrosweb como app".
2. Click → en Android, prompt nativo de PWA → instalado.
3. En iOS, se muestran instrucciones "Compartir → Añadir a pantalla de inicio" con screenshot.
4. Tras instalar, abre desde icono → app a pantalla completa, sin barra de URL.

### Escaneo

1. Usuario en `/today` → toca botón cámara o entra a `/scan`.
2. Pide permiso de cámara (primera vez).
3. Apunta a un código de barras → reconocido en < 1s.
4. App busca en `foods` local primero, luego en OFF.
5. Si encuentra: salta a la pantalla de "añadir a meal" con el food preseleccionado.
6. Si no encuentra: opción "Crear este alimento" con barcode pre-rellenado.

### Offline

1. Usuario abre la app sin conexión.
2. Ve la última versión cacheada de `/today` (datos del último uso).
3. Banner "Sin conexión. Algunos datos pueden estar desactualizados."
4. Acciones de escritura (añadir entry) se deshabilitan o muestran "Conéctate para guardar".

## Scope

### PWA

- `public/manifest.webmanifest`: nombre, short_name, theme, display=standalone, icons (192/512/maskable), screenshots
- Iconos en `public/icons/` (192, 512, maskable, apple-touch-icon, favicons)
- Service Worker vía Serwist (`src/app/sw.ts`):
  - Strategy `NetworkFirst` para navegación con fallback offline
  - Strategy `CacheFirst` para `/icons/*` y `_next/static/*`
  - NO cachear `/api/*` ni Server Actions
- Banner de instalación custom: captura `beforeinstallprompt`, lógica para mostrarlo tras 2ª sesión (cookie/localStorage), no insistir si rechazado
- Página `/install` con instrucciones específicas iOS (screenshots paso a paso)
- Meta tags iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style=black-translucent`, `apple-touch-icon`
- Viewport `viewport-fit=cover` + safe-area-insets en CSS

### Scanner

- Instalar `html5-qrcode`
- Componente `BarcodeScanner` (`features/foods/components/`)
- Ruta `/scan` (autenticada) con interfaz fullscreen de cámara
- Botón cámara en `/today` y en `/foods/search` (header)
- Integración con queries existentes: `getFoodByBarcode(barcode)` → local first, OFF fallback
- Si OFF devuelve resultado: upsert en `foods` local
- Si no hay resultado: navegar a `/foods/new?barcode=...`

### Offline base

- Mensaje banner cuando `navigator.onLine === false`
- Server Actions deshabilitadas con tooltip "Necesitas conexión"
- **NO** es offline-first real (eso está en roadmap)

## Out of scope

- Offline real con cola de sincronización (roadmap)
- Notificaciones push (roadmap)
- Background sync (roadmap)
- App Store / Play Store (no aplica, es PWA)

## Criterios de aceptación

- [ ] `npx lighthouse https://prod-url --view` da score PWA verde.
- [ ] App instalable en Chrome Android y "Add to Home Screen" funciona en iOS Safari.
- [ ] Tras instalar, app abre en standalone sin barra URL.
- [ ] Sin red, `/today` muestra la última versión vista.
- [ ] Scanner reconoce un código de barras EAN-13 en < 2s con luz normal.
- [ ] Scanner solicita permiso cámara correctamente y maneja el rechazo con UI clara.

## Estimación

~6 issues, 1-2 semanas.

## Issues

Ver `web/docs/issues/fase-4.md`.
