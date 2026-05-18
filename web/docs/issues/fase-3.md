# Fase 3 — Issues

Issues con prefijo `F3-NN`. PRD: [`docs/prds/03-fase-3-dashboard.md`](../prds/03-fase-3-dashboard.md).

---

## F3-01: Componente MacroRing reutilizable

**Labels**: ui, component
**Estimate**: M

### Descripción

- `src/components/features/macros/macro-ring.tsx`.
- Anillo SVG circular animado.
- Props: `value`, `target`, `color`, `label`, `unit`, `size?`.
- Color del trazo: verde si value <= target, ámbar si target < value <= target*1.1, rojo si value > target*1.1.
- Centro: número grande (value) y debajo "/ target unit".
- Animación: anillo crece desde 0 al montar (300ms ease-out).
- Accesible: `role="img"` + `aria-label="450 de 2200 kcal"`.

### Aceptación

- [ ] Funciona para los 4 macros con sus colores específicos.
- [ ] Storybook-like demo page que prueba: 0%, 50%, 100%, 110%, 150%.
- [ ] Test snapshot Vitest del SVG output.

---

## F3-02: DailyMacroSummary (4 rings)

**Labels**: ui, component
**Estimate**: M
**Depende de**: F3-01

### Descripción

- `src/components/features/macros/daily-macro-summary.tsx`.
- 4 rings: kcal grande arriba, 3 macros (P/C/G) abajo en fila.
- Recibe `summary: { kcal, protein_g, carbs_g, fat_g }` y `goal: Goal`.
- Mobile: kcal grande arriba, 3 macros en una fila debajo.
- Si no hay `goal` activo → muestra "Configura tu objetivo →" linkeado a /profile.

### Aceptación

- [ ] Layout adapta de móvil a desktop.
- [ ] Fallback si no hay goal.

---

## F3-03: /today integra dashboard completo

**Labels**: feature:meals, ui
**Estimate**: M
**Depende de**: F3-02

### Descripción

- Reemplazar la lista básica de Fase 2 con un layout completo:
  - Header con `DayNavigator` (F3-04).
  - `DailyMacroSummary` con totales del día.
  - Lista de `MealSlotCard` con entries.
- Calculo de totales hecho server-side en `getDayLog`.

### Aceptación

- [ ] Resumen actualiza al añadir/editar/borrar entry.
- [ ] Tiempo de carga FCP < 1.5s en móvil 4G simulado.

---

## F3-04: DayNavigator (navegación entre días)

**Labels**: ui, component
**Estimate**: M

### Descripción

- `src/components/features/meals/day-navigator.tsx`.
- Flechas izq/der.
- Centro: label dinámico ("Hoy", "Ayer", "Mañana" o "DD MMM YYYY" en español).
- Click central abre date picker (shadcn `Calendar`).
- Swipe horizontal en móvil cambia día (usa `framer-motion` o handler nativo simple).
- URL param `?date=YYYY-MM-DD`. Sin param = hoy.
- No permite navegar más allá de hoy (futuro deshabilitado).

### Aceptación

- [ ] Navegar funciona con flecha, swipe y date picker.
- [ ] URL persiste la fecha (compartir link funciona).
- [ ] Ayer/Hoy/Mañana se calculan en zona horaria del Profile.

---

## F3-05: Edición/eliminación de entry con confirmación

**Labels**: feature:meals, ui
**Estimate**: M

### Descripción

- Tocar una entry en MealSlotCard abre acciones:
  - Editar: dialog reutilizando el flow de `AddEntryDialog` en modo edit.
  - Mover de slot: dropdown con otros slots.
  - Borrar: Dialog "¿Borrar 'Manzana 100g'?" con botones Cancelar/Borrar.
- Optimistic UI: anillos se actualizan al instante, rollback si falla.

### Aceptación

- [ ] Borrar requiere confirmación.
- [ ] Optimistic UI con rollback funciona (probar con red lenta).
- [ ] Mover entry entre slots persiste y refleja en UI.

---

## F3-06: Empty state + skeleton + loading en /today

**Labels**: ui, polish
**Estimate**: S

### Descripción

- `src/app/(app)/today/loading.tsx`: skeleton con 4 ring placeholders + 3-5 slot cards placeholder.
- Empty state si día sin entries: ilustración SVG simple + texto + CTA "Empezar a registrar →".
- Empty state global (primera vez ever): mensaje de bienvenida.

### Aceptación

- [ ] Skeleton aparece en navegación entre días.
- [ ] Empty state es bonito y orienta al usuario.
