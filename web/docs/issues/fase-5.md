# Fase 5 — Epics

Esta fase NO es secuencial. Son 8 epics independientes. Priorización en el PRD: [`docs/prds/05-fase-5-mejoras.md`](../prds/05-fase-5-mejoras.md).

Cada epic se desglosa en sub-issues al empezarlo. Aquí están las descripciones de alto nivel listas para crearse en Linear como "Issue → Initiative/Project" o como Epic-tag.

---

## F5-EPIC-01: Recetas (Recipe + RecipeItem + UI)

**Labels**: feature:recipes, epic
**Estimate**: XL (~8-12 sub-issues)
**Prioridad**: 🟡 Alta

### Descripción

Usuario puede componer "platos" (recipe) con varios alimentos y registrarlos en una comida como una unidad. Schema en migración inicial.

Sub-issues típicos:

- F5-01-01: Feature recipes - queries (getRecipe, listRecipes)
- F5-01-02: Feature recipes - actions (createRecipe, updateRecipe, deleteRecipe, addItem, removeItem)
- F5-01-03: UI `/recipes` listado con CRUD
- F5-01-04: UI `/recipes/new` y `/recipes/[id]/edit` con cálculo en vivo
- F5-01-05: Integrar en AddEntryDialog "Tab Alimento | Tab Receta"
- F5-01-06: Tests domain de cálculo de macros de receta y conversión por porciones
- F5-01-07: UX: duplicar receta existente

### Aceptación general

- [ ] Editar un Food usado en una receta SÍ actualiza las macros de la receta (composición viva).
- [ ] Registrar una receta en una comida crea un Entry con snapshot.

---

## F5-EPIC-02: Favoritos y recientes en búsqueda

**Labels**: feature:foods, epic
**Estimate**: M (~3-4 sub-issues)
**Prioridad**: 🟢 Alta

### Descripción

Mejorar drásticamente la UX de búsqueda mostrando primero lo que el usuario más usa.

Sub-issues:

- F5-02-01: Query agregada `getFrequentFoods(userId, limit=10)` (COUNT por source_id).
- F5-02-02: Query `getRecentFoods(userId, limit=10)` (MAX created_at).
- F5-02-03: UI: secciones "Recientes" y "Frecuentes" cuando search input vacío.

### Aceptación general

- [ ] Al abrir buscador sin query, ves tus 5 alimentos más comunes y los últimos 5 usados.

---

## F5-EPIC-03: Copiar día / comida anterior

**Labels**: feature:meals, epic
**Estimate**: M (~3 sub-issues)
**Prioridad**: 🟡 Media

### Descripción

Acción rápida para replicar un día completo o un meal slot desde otra fecha.

Sub-issues:

- F5-03-01: Action `copyDayLog(sourceDate, targetDate)` que clona todas las entries con NEW snapshot.
- F5-03-02: UI: botón "Copiar de…" en `/today` con date picker.
- F5-03-03: Action y UI para copiar solo un meal slot.

### Aceptación general

- [ ] Copiar funciona y los nuevos Entries son snapshots independientes.
- [ ] Si el food origen ha cambiado, el snapshot usa los valores actuales (consistencia con "comer hoy").

---

## F5-EPIC-04: Gráficas semana / mes

**Labels**: stats, epic
**Estimate**: L (~5-6 sub-issues)
**Prioridad**: 🟡 Media

### Descripción

Ver tendencias de kcal, macros, peso y adherencia.

Sub-issues:

- F5-04-01: Query `getDailySummaries(userId, dateRange)`.
- F5-04-02: Query `getWeightSeries(userId, dateRange)`.
- F5-04-03: Query `getAdherenceStats(userId, dateRange)` — % días dentro de ±10% kcal.
- F5-04-04: Componente charts con Recharts (línea kcal, área macros stack, línea peso).
- F5-04-05: Página `/stats` (¿añadir a BottomNav o dentro de `/profile`? decidir).
- F5-04-06: Selector de rango (7d / 30d / 90d / custom).

### Aceptación general

- [ ] Gráficas legibles en móvil.
- [ ] Performance: render con 90 días de datos en < 500ms.

---

## F5-EPIC-05: Foto del alimento (Supabase Storage)

**Labels**: feature:foods, storage, epic
**Estimate**: M (~3-4 sub-issues)
**Prioridad**: 🔵 Baja

### Descripción

Subir foto a alimentos custom. Mejora reconocimiento visual en búsqueda.

Sub-issues:

- F5-05-01: Configurar bucket `food-photos` en Supabase Storage con políticas RLS.
- F5-05-02: Componente `FoodImageUpload` con compresión cliente (max 1MB).
- F5-05-03: Mostrar imagen en cards de búsqueda y en detalle.
- F5-05-04: Migración: añadir `foods.image_url` (si no estaba).

### Aceptación general

- [ ] Upload funciona en móvil con cámara.
- [ ] Compresión reduce a < 1MB sin perder claridad.
- [ ] Borrar food borra también la imagen del storage.

---

## F5-EPIC-06: Login con Google + Apple

**Labels**: feature:auth, oauth, epic
**Estimate**: M (~3-4 sub-issues)
**Prioridad**: 🟡 Media

### Descripción

Reducir fricción de signup.

Sub-issues:

- F5-06-01: Configurar Google OAuth en Supabase (credenciales en Console).
- F5-06-02: Configurar Apple OAuth en Supabase (más burocracia: certificado de developer).
- F5-06-03: Botones "Continuar con Google" / "Continuar con Apple" en /login y /signup.
- F5-06-04: Manejo de callback en `/auth/callback` + integración con middleware onboarding.

### Aceptación general

- [ ] Signup con Google crea usuario y va a onboarding.
- [ ] Login posterior con misma cuenta entra directo.
- [ ] Email del usuario se obtiene del provider correctamente.

---

## F5-EPIC-07: Exportar datos (RGPD)

**Labels**: gdpr, account, epic, **blocker**
**Estimate**: M (~2-3 sub-issues)
**Prioridad**: 🔴 Bloqueante para producción en EU

### Descripción

Cumplir obligación legal de portabilidad de datos.

Sub-issues:

- F5-07-01: Feature `account`: query `exportUserData(userId)` que agrega de todas las tablas.
- F5-07-02: Endpoint `GET /api/account/export` autenticado, devuelve JSON con header `Content-Disposition: attachment`.
- F5-07-03: UI en `/profile` → "Descargar mis datos" con loading mientras genera.

### Aceptación general

- [ ] JSON exportado contiene TODOS los datos del usuario (verificable contra schema).
- [ ] Schema versionado (`"version": "1"`) para futuras compatibilidades.
- [ ] No incluye datos de otros usuarios ni Foods públicos.

---

## F5-EPIC-08: Borrar cuenta (RGPD)

**Labels**: gdpr, account, epic, **blocker**
**Estimate**: M (~3 sub-issues)
**Prioridad**: 🔴 Bloqueante para producción en EU

### Descripción

Cumplir obligación legal de derecho al olvido.

Sub-issues:

- F5-08-01: Server Action `deleteAccount(confirmationEmail)` valida email == user.email, ejecuta delete con service_role.
- F5-08-02: Cascada vía FK ON DELETE en migración (asegurar coverage en F1-07).
- F5-08-03: UI en `/profile` → sección "Zona peligrosa" → Dialog confirmación doble (escribir email + checkbox).

### Aceptación general

- [ ] Al borrar, todas las tablas con `owner_id=user` quedan sin sus filas.
- [ ] Foods públicos (sin owner) NO se borran aunque el usuario los haya usado.
- [ ] Sesión se cierra y cookies se borran tras el delete.
- [ ] No queda PII en ningún log.
