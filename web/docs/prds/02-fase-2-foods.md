# PRD 02 — Fase 2: Foods y registro manual

## Goal

El usuario puede **buscar alimentos** (de Open Food Facts y de los suyos propios), **crear sus propios alimentos**, y **registrarlos en cualquier meal slot del día**. Al final de la fase, un usuario puede tener su día registrado al completo, aunque la visualización del progreso aún sea básica (Fase 3 pulirá el dashboard).

## User journeys

### Buscar y registrar alimento existente

1. Usuario está en `/today`, click en "Añadir a Desayuno" (botón en el slot).
2. Llega a `/foods/search?slot=breakfast` con buscador focado.
3. Escribe "manzana" → ve resultados: locales primero, OFF después.
4. Selecciona "Manzana (Open Food Facts)".
5. Pantalla con cantidad: 100g (default según `serving_size_g`) + unidad (g/unidad/ml según food).
6. Confirma → Entry creado con snapshot de macros → vuelve a `/today`.

### Crear alimento personalizado

1. Usuario en `/foods/search`, no encuentra lo que busca.
2. Click "Crear alimento personalizado".
3. Form: nombre, marca opcional, kcal/100g, P/C/G/100g, micronutrientes opcionales, serving_size_g, serving_name, densidad si líquido.
4. Guarda → Food creado con `source='custom'`, `owner_id=user`.
5. Lo puede usar inmediatamente.

### Editar / borrar entry

1. En `/today` → toca una entry → opciones: editar cantidad / borrar (con confirmación).
2. Al editar: recalcula macros del snapshot. Al borrar: confirmación, luego desaparece.

## Scope

### Foods

- Migración: añadir/refinar columnas en `foods` (`nutrients JSONB`, `serving_size_g`, `serving_name`, `density_g_per_ml`, `barcode`, `source`, `off_id`, `off_last_synced_at`)
- `lib/openfoodfacts`: cliente para search by name + by barcode
- `features/foods/queries.ts`: searchLocalFoods, getFoodById, searchOpenFoodFacts
- `features/foods/actions.ts`: createCustomFood, updateCustomFood, deleteCustomFood, upsertOffFood (cuando seleccionas un OFF, lo inserta local)
- UI: `/foods/search`, `/foods/new`, `/foods/[id]/edit`
- Caché en memoria de servidor para búsquedas OFF (5 min)

### Meals (registro)

- Migración: `day_logs`, `entries`, `meal_slots` con datos seed por defecto
- `features/meals/domain.ts`: cálculo de macros del snapshot a partir de (food, quantity, unit)
- `features/meals/queries.ts`: getDayLog(date), getEntriesForDay(date)
- `features/meals/actions.ts`: addEntry, updateEntry, deleteEntry
- UI: AddEntryDialog (compartido por search y custom food)
- Integración en `/today`: lista básica de entries por slot

### Profile (mejora)

- Editar meal slots: añadir, renombrar, reordenar, borrar (al menos 1 obligatorio)

## Out of scope

- Recetas (Fase 5)
- Foto del alimento (Fase 5)
- Búsqueda inteligente por frecuencia (Fase 5)
- Favoritos / recientes (Fase 5)
- Copiar día anterior (Fase 5)
- Dashboard con anillos (Fase 3)
- Scanner de barras (Fase 4)

## Criterios de aceptación

- [ ] Búsqueda devuelve resultados locales + OFF deduplicados en < 1 s con conexión decente.
- [ ] Al seleccionar un food de OFF, queda en nuestra BD (`SELECT * FROM foods WHERE source='off'` lo encuentra).
- [ ] Crear food custom valida que las macros sean coherentes (kcal ≈ 4·P + 4·C + 9·G ± 20% — warning, no bloqueo).
- [ ] Entries son inmutables al editar el Food original (test: editar Food, ver que Entry no cambia).
- [ ] Borrar Food orphans las Entries pero el `source_name` y macros siguen visibles.
- [ ] Toda Server Action devuelve `ActionResult<T>` y errores se muestran en Toast/inline.
- [ ] Tests Vitest para `domain.ts` de foods y meals.

## Estimación

~10 issues, 2-3 semanas.

## Issues

Ver `web/docs/issues/fase-2.md`.
