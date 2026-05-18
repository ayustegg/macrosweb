# PRD 03 — Fase 3: Dashboard diario

## Goal

La pantalla `/today` deja de ser un placeholder y se convierte en la **pantalla central de la app**: el usuario abre la app y de un vistazo sabe cómo va el día. Es la pantalla que usará más, dedicarle pulido es prioritario.

## User journey

1. Usuario abre la app (instalada como PWA) → llega a `/today`.
2. Ve 4 **anillos de progreso** arriba: kcal totales + 3 macros (P/C/G).
   - Cada anillo muestra: total comido / objetivo, color verde si dentro del rango, ámbar si te pasas un poco, rojo si te pasas mucho.
3. Debajo, lista de **meal slots** del día con:
   - Nombre del slot ("Desayuno")
   - Suma de kcal de las entries
   - Entries individuales con nombre + cantidad + kcal
4. Toca una entry → editar/borrar.
5. Toca un slot → "+ Añadir comida" → va al buscador.
6. Navegación entre días: swipe horizontal (móvil) o flechas en cabecera (desktop). Indicador "Hoy" / "Ayer" / "DD/MM/YYYY".

## Scope

### Componentes nuevos

- `MacroRing` (componente reutilizable): círculo SVG animado, props (value, target, color, label, unit)
- `DailyMacroSummary`: layout con 4 rings (kcal principal + 3 macros)
- `MealSlotCard`: card con header + lista de entries + total + botón "añadir"
- `EntryItem`: con nombre, cantidad, kcal, swipe para borrar (móvil) o context menu
- `DayNavigator`: flechas + label (Hoy/Ayer/fecha)

### Comportamiento

- Navegación entre días via URL param: `/today?date=2026-05-17`
- Cache de React Query — no, lo hacemos con Server Components y `revalidatePath` ya que usamos App Router. Cada navegación es un fetch fresco.
- Empty state cuando un día no tiene entries: "Aún no has registrado nada. Empezar →"
- Skeleton en `loading.tsx` mientras streamea
- Pull-to-refresh en móvil (opcional)

### Edge cases

- Hoy aún no tiene `day_log`: se muestra UI vacía sin error (no se crea hasta primer entry).
- Usuario sin `Goal` activo: muestra "Configura tu objetivo en /profile" en lugar de los rings.
- Usuario cambió de timezone: los días pasados no se reinterpretan.

## Out of scope

- Gráficas semanales/mensuales (Fase 5)
- Comparativa de progreso histórico (Fase 5)
- Copiar día anterior (Fase 5)

## Criterios de aceptación

- [ ] `/today` carga en < 1.5s en móvil 4G (FCP).
- [ ] Anillos se animan suavemente al entrar.
- [ ] Navegación entre días funciona vía swipe en móvil y flechas en desktop.
- [ ] Empty state aparece cuando corresponde con CTA claro.
- [ ] Editar/borrar entry actualiza los anillos sin recargar la página entera.
- [ ] Funciona offline si ya se cargó la página antes (servicio worker).
- [ ] Tests E2E con Playwright del flujo básico (Fase 4+, no obligatorio aquí).

## Estimación

~6 issues, 1-2 semanas.

## Issues

Ver `web/docs/issues/fase-3.md`.
