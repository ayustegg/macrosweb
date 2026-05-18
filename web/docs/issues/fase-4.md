# Fase 4 — Issues

Issues con prefijo `F4-NN`. PRD: [`docs/prds/04-fase-4-pwa-scanner.md`](../prds/04-fase-4-pwa-scanner.md).

---

## F4-01: Manifest definitivo + iconos producción

**Labels**: pwa
**Estimate**: M
**Depende de**: F1-04

### Descripción

- Reemplazar manifest placeholder con versión final:
  - `name`: "macrosweb — Tu diario de macros"
  - `short_name`: "macrosweb"
  - `description`
  - `theme_color`, `background_color` que matchen el diseño
  - `display: "standalone"`, `orientation: "portrait"`
  - `start_url: "/today"`
  - `scope: "/"`
  - `categories: ["health", "fitness", "food"]`
  - `screenshots` (mobile + desktop) para install prompt enriquecido
- Iconos PNG: 192×192, 512×512, 512×512 maskable, apple-touch-icon 180×180, favicons.
- Diseño del icono: simple, reconocible, funciona en tamaño pequeño.

### Aceptación

- [ ] Chrome DevTools → Manifest sin warnings.
- [ ] Iconos se ven correctamente en pantalla de inicio (Android e iOS).
- [ ] Maskable icon respeta el safe area circular.

---

## F4-02: Service Worker con Serwist (precache + runtime)

**Labels**: pwa
**Estimate**: L
**Depende de**: F4-01

### Descripción

- Configurar `src/app/sw.ts` con Serwist:
  - Precache de `/_next/static/*` y rutas estáticas.
  - `NetworkFirst` para navegación HTML, con fallback a página `/offline`.
  - `CacheFirst` para `/icons/*`, fuentes, imágenes (max 50 entradas, 30 días).
  - NO cachear `/api/*`, Server Actions ni Supabase requests.
- Crear `/offline` route con mensaje "Sin conexión".
- Versionar el SW (auto via Serwist).

### Aceptación

- [ ] App carga offline tras una primera visita (probar con DevTools Offline).
- [ ] Acciones de mutación fallan gracefully con mensaje.
- [ ] Update del SW funciona sin requerir cierre forzado.

---

## F4-03: Install prompt customizado

**Labels**: pwa, ui
**Estimate**: M

### Descripción

- Hook `useInstallPrompt`:
  - Captura `beforeinstallprompt` y lo guarda.
  - Detecta si ya está instalada (`window.matchMedia('(display-mode: standalone)')`).
  - Estado: `canInstall` (Chrome/Android) o `isIOSSafari` (otros mensaje manual).
- Componente `InstallBanner`:
  - Aparece en `/today` solo si: sesión >= 2 y aún no instalada y no rechazado.
  - Persistir rechazo en localStorage (`pwa_install_dismissed`, expira 30 días).
  - Botón "Instalar" llama `prompt()` o muestra instrucciones iOS.
- Página `/install` con guía visual paso a paso para iOS (screenshots).

### Aceptación

- [ ] Banner aparece tras 2ª sesión en Chrome Android.
- [ ] Banner no reaparece si se rechaza durante 30 días.
- [ ] Página `/install` muestra instrucciones específicas según el navegador detectado.

---

## F4-04: iOS PWA: meta tags + safe area + status bar

**Labels**: pwa, ios
**Estimate**: S

### Descripción

- En root layout, añadir:
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
  - `<meta name="apple-mobile-web-app-title" content="macrosweb" />`
  - `<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />`
  - `viewport-fit=cover` en viewport.
- CSS: usar `env(safe-area-inset-*)` para padding del AppShell y BottomNav.

### Aceptación

- [ ] En iPhone con notch, BottomNav respeta safe-area-bottom.
- [ ] Header respeta safe-area-top.
- [ ] Status bar se ve correctamente al instalar.

---

## F4-05: Scanner de códigos de barras

**Labels**: feature:foods, scanner
**Estimate**: L

### Descripción

- Instalar `html5-qrcode`.
- Componente `BarcodeScanner` en `features/foods/components/`:
  - Pide permiso cámara con mensaje claro.
  - Muestra preview de cámara con overlay de cuadro.
  - Reconoce EAN-13, EAN-8, UPC-A (formatos OFF estándar).
  - Callback `onScan(barcode)`.
  - Botón "Cancelar" + manejo de error si no hay cámara.
- Ruta `/scan` (autenticada): página fullscreen.
- Botón cámara en header de `/today` y `/foods/search`.

### Aceptación

- [ ] Escanea código EAN-13 de un producto real en < 2s con luz normal.
- [ ] Pide permiso cámara correctamente.
- [ ] Maneja rechazo de permiso con mensaje claro.
- [ ] Funciona en Chrome Android y Safari iOS.

---

## F4-06: Flow completo: scan → search by barcode → add to meal

**Labels**: feature:foods, integration
**Estimate**: M
**Depende de**: F4-05

### Descripción

- En `/scan`, al detectar barcode:
  - Llamar `getFoodByBarcode(barcode)`.
  - Si local: navegar a AddEntryDialog con el food + último meal slot activo.
  - Si OFF: hacer `upsertOffFood` automáticamente + AddEntryDialog.
  - Si no existe en ningún lado: ofrecer "Crear este alimento (barcode pre-rellenado)" → `/foods/new?barcode=...`.
- Toast feedback inmediato durante el flujo.

### Aceptación

- [ ] Escanear un producto conocido (Coca-Cola) → directo a "añadir a comida".
- [ ] Escanear un producto desconocido → opción crear.
- [ ] Flujo entero en < 5s desde scan a entry creado.
