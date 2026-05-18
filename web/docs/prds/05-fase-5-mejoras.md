# PRD 05 — Fase 5: Mejoras (calidad de vida + cumplimiento)

## Goal

Cerrar el círculo de la app con features que la hacen **usable de verdad a largo plazo** (recetas, favoritos, copia de día, gráficas) y completar las **obligaciones legales** (export y borrado de datos RGPD) más OAuth para reducir fricción en signup.

Esta fase NO es atómica como las anteriores: son 8 epics que se pueden hacer en cualquier orden. Priorización sugerida abajo.

## Epics

### EPIC 5.1 — Recetas (alta prioridad)

**Goal**: usuario puede crear "platos" compuestos por varios alimentos y registrarlos en una comida como una unidad.

**User journey**:

1. `/recipes` → "+ Nueva receta" → form: nombre, número de porciones, ingredientes (lista de Food + cantidad).
2. Macros totales se calculan en vivo al añadir/editar ingredientes (composición viva, ver `ARCHITECTURE.md §3.2.H`).
3. Guardar → aparece en lista.
4. Al añadir comida a un meal, opción "Receta" además de "Alimento": elige receta + nº de porciones consumidas → Entry creada con macros snapshot (porciones × macros/porción).

**Schema**: `recipes`, `recipe_items` ya en migración inicial. Solo añadir UI + queries/actions.

### EPIC 5.2 — Favoritos y recientes (alta prioridad)

**Goal**: que la búsqueda recupere primero lo que el usuario usa más, sin tener que escribir.

- Sin schema nuevo: query agrega por `(owner_id, source_id) GROUP BY` con `COUNT` y `MAX(created_at)`.
- Buscador muestra 2 secciones cuando query está vacío: "Recientes" (últimos 10) y "Frecuentes" (top 10 por uso).

### EPIC 5.3 — Copiar día / comida anterior (media)

**Goal**: si comes lo mismo varios días, no tener que registrarlo desde cero.

- En `/today`: botón "Copiar de…" → selector de fecha → copia todas las entries de ese día al día actual.
- En un meal slot: opción "Repetir desde anteayer" copia solo ese slot.

### EPIC 5.4 — Gráficas semana/mes (media)

**Goal**: ver tendencias.

- `/stats` (nuevo, añadir al BottomNav O en `/profile`).
- Gráfica con Recharts: kcal diarias últimos 7/30 días + línea de objetivo.
- Gráfica peso (de `weight_logs`).
- Gráfica adherencia: % de días dentro de rango ±10% kcal.

### EPIC 5.5 — Foto del alimento (baja)

**Goal**: foto de los alimentos custom + opcional foto en cada entry.

- Supabase Storage bucket `food-photos`.
- Upload con compresión cliente (max 1MB, recompress).
- `Food.image_url` (ya previsto).
- Foto en card de food en búsqueda.

### EPIC 5.6 — Login con Google + Apple (media)

**Goal**: reducir fricción de signup.

- Configurar OAuth providers en Supabase (Google + Apple).
- Botones en `/login` y `/signup`.
- Flow: callback en `/auth/callback` → middleware redirige a onboarding si perfil incompleto.

### EPIC 5.7 — Export datos (RGPD, alta — bloqueante para EU prod)

**Goal**: cumplir obligación legal.

- Endpoint `GET /api/account/export` (autenticado).
- Devuelve JSON con todos los datos del usuario.
- Schema versionado: `{ "version": "1", "exported_at": "...", "user": {...}, "foods": [...], ... }`.
- UI en `/profile` con botón "Descargar mis datos".

### EPIC 5.8 — Borrar cuenta (RGPD, alta — bloqueante para EU prod)

**Goal**: cumplir obligación legal.

- Endpoint `DELETE /api/account` (Server Action).
- UI en `/profile` con sección "Zona peligrosa" → "Borrar mi cuenta".
- Confirmación doble: escribir email + checkbox "Entiendo que es irreversible".
- Cascada de borrado vía FK + ON DELETE CASCADE; foods públicos NO se borran.

## Priorización sugerida

| Orden | Epic                    | Razón                                    |
| ----- | ----------------------- | ---------------------------------------- |
| 1     | 5.7 Export + 5.8 Delete | Bloqueantes para lanzar en EU            |
| 2     | 5.1 Recetas             | Feature core que muchos usuarios pedirán |
| 3     | 5.2 Favoritos/recientes | Mejora masiva de UX, coste bajo          |
| 4     | 5.6 OAuth               | Reduce fricción signup                   |
| 5     | 5.3 Copiar día          | Calidad de vida importante               |
| 6     | 5.4 Gráficas            | Engagement a largo plazo                 |
| 7     | 5.5 Foto                | Nice to have                             |

## Out of scope (post-MVP)

Ver `ARCHITECTURE.md §9` para roadmap completo: agua, ejercicio, push, offline real, Apple Health, multi-idioma, etc.

## Estimación

8 epics, cada uno es 3-8 issues más pequeños. Esta fase no tiene fecha de cierre — se va completando según prioridad.

## Issues

Ver `web/docs/issues/fase-5.md` (epics; cada uno se desglosa en sub-issues al empezarlo).
