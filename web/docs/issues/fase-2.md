# Fase 2 — Issues

Issues con prefijo `F2-NN`. PRD: [`docs/prds/02-fase-2-foods.md`](../prds/02-fase-2-foods.md).

---

## F2-01: Tipos del dominio Food + Entry + schemas

**Labels**: feature:foods, types
**Estimate**: M
**Bloquea**: F2-02, F2-04, F2-07

### Descripción

- `src/types/food.ts`: tipo `Food` (id, name, brand?, barcode?, source, owner_id?, kcal/protein/carbs/fat por 100g, nutrients JSONB, serving_size_g, serving_name?, density_g_per_ml?, image_url?, off_id?, off_last_synced_at?, created_at, updated_at).
- `src/types/nutrients.ts`: schema Zod del JSONB `nutrients` (fiber_g, sugars_g, saturated_fat_g, salt_g, sodium_mg…) — todos opcionales. Exporta `type Nutrients = z.infer<...>`.
- `src/types/entry.ts`: tipo `Entry` con snapshot completo.
- `src/features/foods/schemas.ts`: Zod schemas para crear/editar food.
- `src/features/meals/schemas.ts`: Zod schemas para crear/editar entry.

### Aceptación

- [ ] Tipos exportados correctamente.
- [ ] Schemas Zod tienen sanity checks (kcal>=0, etc.).
- [ ] Tests Vitest del schema (`safeParse` con casos válidos e inválidos).

---

## F2-02: Migración: añadir columnas a foods (si falta algo del init)

**Labels**: supabase, migration
**Estimate**: XS
**Depende de**: F2-01

### Descripción

Comprobar que `0001_init.sql` ya tiene todas las columnas de `foods` que necesita Fase 2. Si falta algo (probablemente `density_g_per_ml`, `serving_name`, `off_id`, `off_last_synced_at`, índice trigram en `name`), crear `supabase/migrations/0002_foods_complete.sql`.

### Aceptación

- [ ] Schema en BD coincide con `src/types/food.ts`.
- [ ] Índice trigram funciona (test con LIKE '%apple%').

---

## F2-03: lib/openfoodfacts: cliente HTTP

**Labels**: feature:foods, lib
**Estimate**: M
**Depende de**: F2-01
**Bloquea**: F2-04

### Descripción

- `src/lib/openfoodfacts/client.ts`:
  - `searchByName(query, locale='es')` → llama a OFF Search API v2.
  - `getByBarcode(barcode)` → llama a OFF Product API.
  - User-Agent obligatorio (vía `env.OPENFOODFACTS_USER_AGENT`).
  - Timeout 5s, fallback gracioso si OFF cae.
  - Caché LRU en memoria server (5 min, max 200 entradas) para queries repetidas.
- `src/lib/openfoodfacts/mapper.ts`: convierte la respuesta OFF a nuestro tipo `Food` (con kcal, P/C/G, micros). Maneja unidades raras de OFF.
- Tests con respuestas mock de OFF en `__fixtures__/`.

### Aceptación

- [ ] Buscar "manzana" devuelve >= 5 resultados válidos.
- [ ] Buscar por barcode "5449000000996" (Coca-Cola) devuelve product.
- [ ] Si OFF responde 5xx, función devuelve array vacío sin throw.
- [ ] Tests pasan offline (con mocks).

---

## F2-04: Feature foods: queries + actions

**Labels**: feature:foods, server
**Estimate**: L
**Depende de**: F2-01, F2-02, F2-03

### Descripción

- `src/features/foods/queries.ts`:
  - `searchLocalFoods(query)` — busca en `foods` con ILIKE/trigram, prioriza custom propios.
  - `searchFoods(query)` — paralelo local + OFF, deduplica por barcode, devuelve unified list con flag `isLocal`.
  - `getFoodById(id)`.
  - `getFoodByBarcode(barcode)` — local first, OFF fallback.
- `src/features/foods/actions.ts`:
  - `createCustomFood(input)`.
  - `updateCustomFood(id, input)` — solo si `owner_id = current_user`.
  - `deleteCustomFood(id)` — solo si custom + propio.
  - `upsertOffFood(offProduct)` — upsert por `off_id` o `barcode`. Devuelve el `Food` local.
- Validar todo con Zod schemas de F2-01.

### Aceptación

- [ ] Buscar devuelve dedup correcto (local con mismo barcode que OFF → solo aparece local).
- [ ] Actions devuelven `ActionResult<T>`.
- [ ] Tests Vitest de actions con happy path + 2 errores.

---

## F2-05: UI búsqueda de alimentos

**Labels**: feature:foods, ui
**Estimate**: L
**Depende de**: F2-04

### Descripción

- Ruta `/foods/search` (en `(app)` group).
- Input de búsqueda con debounce 300ms.
- Lista de resultados: card por food (nombre, marca, kcal/100g, source badge).
- Loading skeleton mientras busca.
- Empty state si no hay resultados: CTA "Crear alimento personalizado" pre-rellenando el nombre.
- Botón flotante "Crear" → `/foods/new`.
- Query param `slot` si viene desde un meal: al seleccionar, pre-llena el slot en `AddEntryDialog`.

### Aceptación

- [ ] Búsqueda fluida sin lag percibido.
- [ ] Resultados muestran origen (local custom / cached OFF / live OFF).
- [ ] Empty state funcional.

---

## F2-06: UI CRUD de food custom

**Labels**: feature:foods, ui
**Estimate**: L
**Depende de**: F2-04

### Descripción

- Ruta `/foods/new` y `/foods/[id]/edit`.
- Form con react-hook-form + zodResolver:
  - Datos básicos: nombre, marca, código de barras (opcional).
  - Macros por 100g: kcal, protein_g, carbs_g, fat_g.
  - Micronutrientes (collapsible): fiber, sugars, saturated_fat, salt, sodium.
  - Servings: serving_size_g (default 100), serving_name (opcional).
  - Líquidos: checkbox "Es líquido" → muestra campo density_g_per_ml.
- Warning soft (no bloqueo) si kcal calculadas (4·P + 4·C + 9·G) difieren >20% del kcal introducido.
- Listado de "Mis alimentos" en `/foods?tab=custom` con editar/borrar.

### Aceptación

- [ ] Crear food funciona y aparece inmediatamente en búsqueda.
- [ ] Editar food NO modifica entries pasados (verificable manualmente).
- [ ] Validación impide kcal < 0 etc.

---

## F2-07: Feature meals: queries + actions

**Labels**: feature:meals, server
**Estimate**: L
**Depende de**: F2-01

### Descripción

- `src/features/meals/domain.ts`: función `computeEntrySnapshot(food | recipe, quantity, unit, profile)` → calcula kcal/P/C/G/nutrients usando `lib/nutrition`.
- `src/features/meals/queries.ts`:
  - `getDayLog(date)` — devuelve día con entries y totales agregados por slot.
  - `getOrCreateDayLog(date)` — upsert (se crea on-demand al añadir primer entry).
- `src/features/meals/actions.ts`:
  - `addEntry({ date, slotId, foodId | recipeId, quantity, unit })` → upsert day_log + insert entry con snapshot.
  - `updateEntry({ id, quantity, unit })` → recalcula snapshot.
  - `deleteEntry(id)`.
- Revalidate de `/today?date=...` tras cada mutation.

### Aceptación

- [ ] Tests Vitest de `domain.ts` (cálculo con varias unidades y foods).
- [ ] Adding entry crea day_log si no existe (transacción).
- [ ] Eliminar entry no borra day_log aunque quede vacío (decisión: mantener el log).

---

## F2-08: UI AddEntryDialog (compartido)

**Labels**: feature:meals, ui
**Estimate**: M
**Depende de**: F2-04, F2-07

### Descripción

- Componente `AddEntryDialog` reutilizable.
- Props: `food: Food` (o recipe en futuro), `defaultSlotId?`, `onConfirm`.
- Form: quantity (número), unit (Select según food: g siempre, ml si density, serving si serving_size_g), meal slot (Select con slots del usuario).
- Preview de macros calculadas en vivo según quantity/unit.
- Submit → llama `addEntry` action.

### Aceptación

- [ ] Cambiar quantity actualiza preview macros al instante.
- [ ] Cambiar unidad reconvierte correctamente.
- [ ] Submit cierra dialog y muestra toast "Añadido a Desayuno".

---

## F2-09: Integración en /today: lista de entries por slot

**Labels**: feature:meals, ui
**Estimate**: M
**Depende de**: F2-07, F2-08

### Descripción

- `/today` lee `getDayLog(today)`.
- Renderiza un `MealSlotCard` (placeholder, Fase 3 lo pulirá) por cada slot del usuario:
  - Nombre del slot + total kcal del slot.
  - Lista de entries: nombre + cantidad/unidad + kcal.
  - Botón "+ Añadir" abre `/foods/search?slot=...`.
- Por ahora, totales del día sin anillos (Fase 3): solo numérico arriba.

### Aceptación

- [ ] Si hay 0 entries → empty state global.
- [ ] Si hay entries → renderizan agrupados por slot en orden `order_index`.
- [ ] Tocar una entry → permitir editar/borrar.

---

## F2-10: Editar meal slots desde perfil

**Labels**: feature:profile, ui
**Estimate**: M

### Descripción

- En `/profile`, sección "Mis comidas":
  - Lista drag-and-drop de slots (reordenable).
  - Editar nombre inline.
  - Añadir nuevo slot.
  - Borrar slot (con confirmación, blocked si tiene entries; alternativa: mover entries a otro slot).
- Actions: `reorderSlots`, `renameSlot`, `addSlot`, `deleteSlot`.

### Aceptación

- [ ] Reordenar persiste tras refresh.
- [ ] Borrar slot con entries muestra opción de migración.
- [ ] Al menos 1 slot obligatorio (no permitir borrar el último).
