# Architecture

Guía de arquitectura del proyecto. Léela antes de añadir cualquier funcionalidad. Las reglas duras y operativas viven en [CLAUDE.md](./CLAUDE.md).

---

## 1. Filosofía

1. **Feature-first**. El código vive junto a la funcionalidad que lo usa. Una feature se puede borrar como una unidad sin romper el resto.
2. **Server-first**. React Server Components por defecto. `"use client"` solo cuando hace falta (estado, eventos, APIs del navegador).
3. **Tipado end-to-end**. Los tipos fluyen desde la BD (tipos generados de Supabase) → server → componentes.
4. **Sin abstracciones prematuras**. No se extrae un patrón hasta que 2+ features lo necesitan. Tres líneas repetidas son mejores que una abstracción equivocada.
5. **Fronteras explícitas**. Cada carpeta tiene reglas sobre qué puede importar y qué no. Ver [§4 Layer boundaries](#4-layer-boundaries).
6. **Genérico, no acoplado**. La arquitectura describe _cómo_ añadir cualquier feature. Las features actuales son ejemplos, no son la arquitectura.

---

## 2. Estructura de carpetas

```
web/
├── src/
│   ├── app/                          # Next.js App Router — SOLO rutas, layouts, loading/error
│   │   ├── (auth)/                   # Grupo de rutas públicas (login, signup)
│   │   ├── (app)/                    # Grupo de rutas autenticadas (middleware redirige si no hay sesión)
│   │   ├── api/                      # API routes (proxies, webhooks)
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing / redirect
│   │
│   ├── features/                     # Módulos de feature, autocontenidos
│   │   └── <feature-name>/
│   │       ├── components/           # Componentes React de esta feature
│   │       ├── hooks/                # Hooks de esta feature
│   │       ├── queries.ts            # Lecturas a BD (server-only)
│   │       ├── actions.ts            # Server Actions (escrituras)
│   │       ├── domain.ts             # Lógica pura de negocio (sin I/O, sin React)
│   │       ├── schemas.ts            # Validación con Zod
│   │       └── types.ts              # Tipos internos de la feature
│   │
│   ├── components/
│   │   ├── ui/                       # Sistema de diseño (shadcn). PUROS. Cero lógica de negocio.
│   │   └── layout/                   # AppShell, BottomNav, Header
│   │
│   ├── lib/                          # Infraestructura y utilidades puras (cross-cutting)
│   │   ├── supabase/                 # Cliente Supabase (server + browser)
│   │   ├── openfoodfacts/            # Wrapper de la API externa
│   │   ├── nutrition/                # Cálculos puros (macros, BMR, TDEE) — sin I/O
│   │   └── utils.ts                  # cn(), formatDate(), debounce()…
│   │
│   ├── hooks/                        # Hooks compartidos por 2+ features
│   ├── types/                        # Tipos del dominio compartidos por 2+ features
│   └── styles/                       # globals.css
│
├── supabase/
│   ├── migrations/                   # SQL versionado (una migración por cambio)
│   └── seed.sql                      # Datos seed para desarrollo
│
├── ARCHITECTURE.md                   # Este fichero
├── CLAUDE.md                         # Reglas duras para la IA (leído automáticamente)
└── package.json
```

---

## 3. Modelo de dominio

Estas son las entidades iniciales. **No es la arquitectura**, es lo que vamos a modelar. La arquitectura permite añadir nuevas entidades sin tocar lo existente.

### 3.1 Entidades

| Entidad      | Descripción                                                                | Pertenece a    |
| ------------ | -------------------------------------------------------------------------- | -------------- |
| `Profile`    | Perfil del usuario (extiende `auth.users` de Supabase).                    | User           |
| `WeightLog`  | Pesada con fecha local.                                                    | User           |
| `Goal`       | Objetivos diarios versionados (con `valid_from`/`valid_to`).               | User           |
| `Food`       | Alimento atómico (público o privado del usuario).                          | User o público |
| `Recipe`     | "Plato": composición de alimentos. Privada del usuario.                    | User           |
| `RecipeItem` | Ingrediente dentro de una receta `(recipe_id, food_id, quantity, unit)`.   | Recipe         |
| `MealSlot`   | Slot de comida configurable ("Desayuno", "Comida"…). Por usuario.          | User           |
| `DayLog`     | Día de registro, identificado por `date` **LOCAL** del usuario.            | User           |
| `Entry`      | **Snapshot inmutable** de algo comido. Referencia origen + datos copiados. | DayLog         |

### 3.2 Reglas críticas

#### A) Fechas y zona horaria

- Cada `Profile` tiene `timezone` (string IANA, p.ej. `Europe/Madrid`). Default según navegador en onboarding.
- `DayLog.date` es de tipo `DATE` (no `TIMESTAMP`), interpretado en la zona del usuario.
- "Lo que comí hoy" = query contra `DayLog.date = today_in_user_tz()`.
- En servidor: convertir UTC → zona del usuario antes de derivar la fecha. Helper en `lib/date/`.
- Cambiar de zona horaria NO migra los `DayLog` pasados (la cena de Madrid sigue siendo del día que fue).

#### B) Snapshots inmutables en `Entry`

Cuando se crea un `Entry`, se **copian** los nutrientes desde el `Food` o `Recipe` origen. El `Entry` guarda:

- `source_type`: `'food' | 'recipe'`
- `source_id`: UUID del origen (puede quedar huérfano si se borra el origen)
- `source_name`: nombre copiado (sobrevive a borrado del origen)
- `quantity`, `unit` (`'g' | 'ml' | 'serving'`)
- `kcal`, `protein_g`, `carbs_g`, `fat_g` calculados a partir de `quantity` y los valores del origen
- `nutrients` (JSONB) con micronutrientes copiados

**Consecuencia**: editar o borrar un `Food` NO altera el histórico. Cumple expectativa de usuario y simplifica reportes.

#### C) Macros + Micronutrientes

- Cuatro columnas fijas en `Food`, `Recipe` y `Entry`: `kcal`, `protein_g`, `carbs_g`, `fat_g`. Se consultan en TODAS las pantallas → índices baratos.
- Columna `nutrients` JSONB para el resto: `{ "fiber_g": 3.5, "sugars_g": 8, "saturated_fat_g": 1.2, "salt_g": 0.5, "sodium_mg": 200, ... }`.
- Schema del JSONB documentado en `src/types/nutrients.ts`. Validado con Zod al insertar.
- Razón: las 4 columnas fijas son consultas baratas y rápidas; el JSONB nos permite añadir nutrientes nuevos sin migración.

#### D) Unidades de medida

- `Food` define `serving_size_g` (default 100) y opcionalmente `serving_name` ("unidad", "vaso", "rebanada"…).
- `Food` define `density_g_per_ml` (nullable) — necesario para líquidos. Leche ≈ 1.03, aceite ≈ 0.92, agua = 1.
- `Entry.unit` admite `'g'`, `'ml'` (solo si el food tiene `density_g_per_ml`) o `'serving'` (solo si el food tiene `serving_size_g`).
- Conversión a gramos en `lib/nutrition/units.ts`. Las macros del snapshot se calculan a partir de gramos.

#### E) Goals con historial (`valid_from` / `valid_to`)

- Solo un `Goal` "activo" por usuario en cualquier momento (`valid_to IS NULL`).
- Al cambiar objetivos: se cierra el anterior (`valid_to = today`) y se crea uno nuevo. No se sobreescribe.
- Permite mostrar "tu objetivo era X cuando comiste esto" en reportes.
- `is_auto` (boolean): true si fue calculado desde `Profile`, false si el usuario lo editó.

#### F) MealSlot configurable (no enum)

- Cada usuario tiene sus propios slots ("Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"…).
- Se generan unos por defecto al hacer onboarding pero son editables: renombrar, reordenar, añadir, borrar.
- `Entry.meal_slot_id` es FK a `meal_slots`. Sin enum hardcodeado.

#### G) Foods públicos vs privados

- `Food` con `source='off' AND owner_id IS NULL` → público, compartido por toda la app, solo lectura para usuarios.
- `Food` con `source='custom' AND owner_id=<user>` → propio del usuario.
- Buscador prioriza `custom` propios > `off` públicos.

#### H) Recipe vive, Entry congela

Dos modelos de composición distintos, no confundir:

- `Recipe` + `RecipeItem` es **composición viva**: si editas un `Food` (corriges macros), la receta refleja el cambio. Las macros del `Recipe` se calculan dinámicamente sumando sus `RecipeItem` (no se guardan).
- `Entry` es **snapshot congelado** (§B): si añades una receta a una comida, copiamos las macros calculadas del momento en el `Entry`. Editar la receta después NO altera el `Entry`.

#### I) Onboarding y perfil completo

- `Profile.profile_completed_at` (TIMESTAMP, nullable) marca que el usuario terminó onboarding. Middleware redirige a `/onboarding` si está NULL.
- `Profile.avatar_url` (nullable) — Supabase Storage en bucket `avatars/`. Tamaño máx 2 MB, formatos JPEG/PNG/WebP.
- `auth.users.id` ↔ `Profile.id` es 1:1 (mismo UUID). Trigger `handle_new_user()` en `auth.users` AFTER INSERT crea fila vacía en `profiles` automáticamente.
- **Default meal slots sembrados al completar onboarding**: 5 slots con `order_index` 0–4: "Desayuno", "Almuerzo", "Comida", "Merienda", "Cena". Editables después.

#### J) Open Food Facts: estrategia de búsqueda y caché

- **Local first, OFF en paralelo**: el buscador llama a `lib/openfoodfacts/search()` y a `queries.searchLocalFoods()` en paralelo, deduplica por `barcode`, devuelve resultados ordenados (custom propios → cached OFF → OFF live).
- **Insertar al seleccionar**: cuando el usuario _elige_ un alimento que viene de OFF live (aún no está en nuestra BD), lo **insertamos** en `foods` con `source='off'`, `owner_id=NULL`, `off_last_synced_at=now()`. La próxima búsqueda lo encuentra local.
- **OFF como semilla, no como dependencia runtime**: una vez insertado, OFF puede caerse y nada se rompe. Job opcional (futuro) para refrescar `off_last_synced_at` periódicamente.
- **Sin abusar de OFF**: respetar su rate limit razonable (~100 req/min). Caché de búsquedas en memoria del servidor (5 min). Si OFF responde 5xx, devolver solo resultados locales y mostrar aviso.

### 3.3 Mapa entre features y entidades

| Feature   | Entidades que gestiona                     |
| --------- | ------------------------------------------ |
| `auth`    | (sesión Supabase, sin entidad propia)      |
| `profile` | `Profile`, `WeightLog`, `Goal`, `MealSlot` |
| `foods`   | `Food`                                     |
| `recipes` | `Recipe`, `RecipeItem`                     |
| `meals`   | `DayLog`, `Entry`                          |
| `account` | (export/delete data; no entidad propia)    |

`lib/nutrition` provee funciones puras (sin I/O):

- `calculateBmr(profile)` → Mifflin-St Jeor
- `calculateTdee(bmr, activityLevel)`
- `suggestedGoal(tdee, goalType)` → kcal y macros sugeridos
- `convertToGrams(quantity, unit, food)` → gramos
- `aggregateEntries(entries[])` → suma de kcal/macros
- `applyServingFactor(food, grams)` → macros para `grams` de `food`

---

## 4. Layer boundaries

Reglas de imports. Si una regla se rompe, hay un problema de diseño.

| Desde                | Puede importar de                                                     | NO puede importar de                      |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| `app/`               | `features/*`, `components/*`, `lib/*`, `hooks/`, `types/`             | —                                         |
| `features/X/`        | `lib/*`, `components/ui/*`, `components/layout/*`, `hooks/`, `types/` | `features/Y/` (otra feature)              |
| `components/ui/`     | `lib/utils.ts`                                                        | `features/*`, `lib/supabase`, server-only |
| `components/layout/` | `components/ui/*`, `lib/utils.ts`, `hooks/`                           | `features/*`, server-only                 |
| `lib/`               | `types/`, otros `lib/` solo si tiene sentido                          | `features/*`, `components/*`              |
| `hooks/`             | `lib/*`, `types/`                                                     | `features/*`, `components/*`              |
| `types/`             | (nada, solo tipos)                                                    | todo                                      |

**Principio**: las dependencias fluyen _hacia abajo_. `app` → `features` → `lib`/`components-ui`/`types`. Nunca al revés. Nunca lateral entre features.

### ¿Qué hacer cuando dos features necesitan lo mismo?

Tres opciones, **por orden de preferencia**:

1. **Si es un tipo del dominio** (`Food`, `Meal`, etc.) → moverlo a `src/types/`.
2. **Si es lógica pura** (función de cálculo, formato) → moverlo a `src/lib/<categoria>/`.
3. **Si es un componente o hook reutilizable** → moverlo a `src/components/` o `src/hooks/`.

Si lo compartido es lógica con I/O (queries, acciones), **probablemente la frontera entre features está mal trazada**. Para. Pregunta.

---

## 5. Data flow

### Lectura (Read)

```
Server Component (app/.../page.tsx)
        │
        ▼ await
features/<X>/queries.ts  ──►  lib/supabase/server.ts  ──►  Supabase
        │
        ▼ devuelve datos tipados
Server Component renderiza HTML
        │
        ▼ hidrata
Client Components reciben datos vía props
```

- Las queries son **funciones async server-only**. Empiezan con `import "server-only";`.
- Devuelven tipos del dominio, no filas crudas de Supabase.
- Errores: lanzar excepción y dejar que el `error.tsx` de Next.js la capture.

### Escritura (Write)

```
Client Component (form)
        │
        ▼ submit
features/<X>/actions.ts (Server Action, "use server")
        │
        ▼ valida con Zod (schemas.ts)
        ▼ aplica lógica de dominio (domain.ts)
        ▼ llama a Supabase
        ▼ revalida con revalidatePath() o revalidateTag()
        │
        ▼ devuelve { ok: true } | { ok: false, errors }
Client Component muestra resultado
```

- Las Server Actions empiezan con `"use server";`.
- **Siempre validar input con Zod** antes de tocar BD.
- Usar `revalidatePath` / `revalidateTag` después de mutaciones, no recargar la página entera.

### 5.3 Forma de retorno de Server Actions

Todas las Server Actions devuelven un objeto discriminado:

```typescript
type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
```

- Errores **esperados** (validación, "ya existe", permisos) → `{ ok: false, error: "mensaje en español" }`.
- Errores **inesperados** (BD caída, bug) → `throw` y dejar que el error boundary los capture.
- El cliente comprueba `result.ok`; si falso, muestra `Toast` con `result.error` (o errores por campo en el form).

### 5.4 Loading y streaming

- **A nivel de ruta**: `loading.tsx` junto al `page.tsx`. Se muestra mientras el RSC streamea.
- **A nivel de componente**: envolver con `<Suspense fallback={<Skeleton />}>` cuando hay sub-fetches independientes que no deben bloquearse entre sí.
- **A nivel de mutación**: `useTransition()` + estado local. Botones muestran `loading` y se deshabilitan durante el submit.
- Pantallas vacías nunca. Siempre uno de: contenido | skeleton | mensaje empty con CTA.

---

## 6. Cómo añadir una nueva feature

Ejemplo: añadir una feature `exercise` (registro de ejercicio físico).

1. **Crear la migración SQL** en `supabase/migrations/NNNN_exercise.sql` con las tablas y RLS.
2. **Generar tipos** de Supabase: `pnpm supabase:types` (lo configuraremos cuando toque).
3. **Crear el módulo de feature**: `src/features/exercise/` con la estructura estándar (ver §2).
4. **Si la entidad la usan otras features**, mover el tipo a `src/types/exercise.ts`.
5. **Crear las rutas**: `src/app/(app)/exercise/page.tsx` (la página _llama_ a las queries/actions de la feature; no contiene lógica).
6. **Añadir al BottomNav** si es una sección top-level: `src/components/layout/bottom-nav.tsx`.
7. **Tests** (cuando los tengamos): en `src/features/exercise/__tests__/`.

**No** se toca otra feature. **No** se mete lógica en `app/`. **No** se duplica un tipo que ya existe.

---

## 7. Convenciones

### Naming

| Cosa               | Convención              | Ejemplo                   |
| ------------------ | ----------------------- | ------------------------- |
| Fichero            | kebab-case              | `food-card.tsx`           |
| Componente React   | PascalCase              | `FoodCard`                |
| Función / variable | camelCase               | `calculateBmr()`          |
| Constante          | UPPER_SNAKE_CASE        | `MAX_FOODS_PER_MEAL`      |
| Tipo / Interface   | PascalCase, sin prefijo | `Food`, no `IFood`        |
| Tabla SQL          | snake_case plural       | `foods`, `weight_logs`    |
| Columna SQL        | snake_case              | `created_at`, `protein_g` |

### Imports

- Siempre usar el alias `@/`, nunca `../../`.
- Orden: react → next → libs externas → `@/` → relativos.

### Tipos

- Tipos de dominio: en `types/` o `features/X/types.ts`. **Inmutables** (`readonly` props cuando aplique).
- Tipos generados de Supabase: en `lib/supabase/database.types.ts` (auto-generados, no editar).
- **Nunca** redefinir un tipo del dominio en otro sitio.

### Estilos

- Tailwind para todo. Sin CSS modules, sin styled-components.
- Tokens de diseño en `tailwind.config.ts` (colores, espaciado).
- Mobile-first: las clases sin prefijo son móvil; `md:` y `lg:` añaden desktop.

### Base de datos (en migraciones SQL)

Toda migración nueva debe cumplir:

- **Tipos**:
  - `id` siempre UUID con `DEFAULT gen_random_uuid()`.
  - `created_at`, `updated_at` siempre `TIMESTAMPTZ` con `DEFAULT now()`.
  - `*_g`, `*_kg`, `*_ml` con `NUMERIC(8,2)` (peso/cantidad) o `NUMERIC(6,2)` (macros).
  - Fechas locales del usuario (`DayLog.date`, `Goal.valid_from`) como `DATE` (sin tz).
  - Strings cortos `TEXT` (Postgres no penaliza vs `VARCHAR`).
- **Constraints**:
  - `NOT NULL` donde aplique. Defaults explícitos.
  - `CHECK` para rangos razonables (`kcal >= 0`, `protein_g >= 0`, `weight_kg BETWEEN 20 AND 500`).
  - `UNIQUE` donde el dominio lo requiera (p.ej. `UNIQUE (owner_id, date)` en `day_logs`).
- **Foreign keys**:
  - Datos del usuario: `ON DELETE CASCADE` para que borrar cuenta arrase todo.
  - Referencias a recursos compartidos (foods públicos): `ON DELETE SET NULL` para no romper Entries históricos.
- **Índices**:
  - Toda columna `owner_id` indexada.
  - Índice compuesto en queries comunes: `(owner_id, date DESC)` en `day_logs`, `(day_log_id, meal_slot_id)` en `entries`.
  - GIN index en JSONB si se va a consultar (`nutrients`).
  - Índice `text_pattern_ops` o GIN trigram en `foods.name` para búsqueda LIKE.
- **RLS**:
  - `ENABLE ROW LEVEL SECURITY` en TODAS las tablas con `owner_id`.
  - Política `auth.uid() = owner_id` para SELECT/INSERT/UPDATE/DELETE.
  - Tablas con datos públicos: SELECT abierto a `authenticated`, mutaciones restringidas a `service_role`.
- **Triggers comunes**:
  - `set_updated_at()` BEFORE UPDATE → setea `updated_at = now()`. Una función reutilizable.
  - `handle_new_user()` AFTER INSERT en `auth.users` → crea fila vacía en `profiles`.

Plantilla y helpers en `supabase/migrations/_template.sql` (lo crearemos al primera migración).

---

## 8. Ciclo de vida de la cuenta y privacidad

La app la usan usuarios finales en la UE → RGPD aplica. Estos procesos son parte de la arquitectura, no features opcionales.

### Signup → onboarding

1. Email + password (Supabase Auth). Eventualmente Google/Apple.
2. Email de verificación obligatorio antes de continuar.
3. **Onboarding bloqueante**: sin completar `Profile` (nombre, sexo, fecha nac., altura, peso inicial, nivel actividad, objetivo, `timezone`) no se accede al resto. Implementado en `src/middleware.ts`: si la cookie de sesión es válida pero `profile.profile_completed_at IS NULL`, redirige a `/onboarding` (a menos que ya esté en `/onboarding`).
4. Al completar: se calcula `Goal` automático (`is_auto=true`) con `lib/nutrition`, se crea `WeightLog` inicial y se generan `MealSlot` por defecto (ver §3.2.I).

### Middleware de auth

`src/middleware.ts` ejecuta en cada request a `(app)/*`:

1. ¿Hay sesión válida? Si no → redirige a `/login`.
2. ¿`profile.profile_completed_at` está set? Si no → redirige a `/onboarding`.
3. Si todo OK → continúa.

Rutas exentas: `(auth)/*`, `/onboarding`, `/api/auth/*`, assets estáticos.

### Reset password

- Flujo estándar de Supabase Auth (email con magic link). Ruta `/auth/reset`.

### Exportar datos (RGPD)

- Ruta: `GET /api/account/export` → JSON con todos los datos del usuario.
- Implementación: `src/features/account/queries.ts` agrega de todas las tablas con `owner_id = current_user`.
- El JSON incluye versión del schema para futuras migraciones de exportaciones antiguas.

### Borrar cuenta (RGPD)

- Ruta: `DELETE /api/account` (Server Action protegida).
- Hard-delete con cascada: `auth.users` → cascade → todas las tablas con `owner_id`.
- Foods públicos (`source='off'`, sin owner) NO se borran.
- Confirmación doble en UI: escribir el email del usuario para confirmar.

### Privacidad por diseño

- **RLS habilitado en TODAS las tablas con `owner_id`. Sin excepciones.** Política `auth.uid() = owner_id` para SELECT/INSERT/UPDATE/DELETE.
- Tablas con datos públicos (`foods` con `source='off'`): SELECT abierto, UPDATE/DELETE solo para service_role.
- No se loguea PII (email, nombre) en logs de servidor — solo `user_id`.
- Sesiones en cookies `HttpOnly + Secure + SameSite=Lax`.

---

## 9. Roadmap / futuro

Cosas que sabemos que vamos a querer pero NO implementamos ahora. Las anotamos para que cuando llegue el momento, encajen bien.

| Feature                              | Schema afectado         | Complejidad             |
| ------------------------------------ | ----------------------- | ----------------------- |
| Foto del alimento                    | `Food.image_url`        | Baja (Supabase Storage) |
| Recientes / favoritos                | Ninguno (query)         | Baja                    |
| Copiar día / comida anterior         | Ninguno (Server Action) | Baja                    |
| Búsqueda inteligente por frecuencia  | Ninguno                 | Media                   |
| Agua / hidratación                   | Nueva tabla             | Baja                    |
| Ejercicio / calorías quemadas        | Nueva feature           | Media                   |
| Login con Google / Apple             | Ninguno (Supabase Auth) | Baja                    |
| Modo offline real con cola de sync   | UUIDs cliente + cola    | **Alta**                |
| Notificaciones push                  | `push_subscriptions`    | Media                   |
| Sincronización con Apple Health      | Compleja                | **Alta**                |
| Compartir recetas con otros usuarios | `recipe.visibility`     | Media                   |
| Multi-idioma / i18n                  | Ninguno                 | Media                   |
| Sistema imperial (lb, oz, ft)        | `Profile.units_system`  | Baja                    |

Al implementar cualquiera, mover la fila a §3 / §8 y dejarla aquí tachada con fecha.

---

## 10. Decisiones tomadas (ADRs ligeros)

| Decisión                                           | Por qué                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| Next.js 16 (App Router)                            | Server Components, Server Actions, API routes integradas                      |
| Supabase                                           | Auth + Postgres + RLS sin gestionar backend                                   |
| Feature-based folders                              | Escalabilidad, borrabilidad por unidad, evitar carpetas gigantes              |
| Open Food Facts (denormalizado)                    | Free, abierto, buena cobertura ES. Copiamos macros para resiliencia.          |
| pnpm                                               | Rápido, eficiente en disco                                                    |
| shadcn/ui (copy-paste, no librería)                | Control total, sin lock-in, integra con Tailwind                              |
| Slots de comida configurables (no enum)            | El usuario decide cuántas comidas hace (3 o 6) sin migraciones                |
| Goals con `valid_from`                             | Historial cuando cambian objetivos (cutting → maintenance)                    |
| `Entry` con snapshot inmutable de nutrientes       | Editar/borrar un Food no debe alterar el histórico                            |
| Macros en columnas fijas + `nutrients` JSONB       | Queries baratas para los 4 macros; flexibilidad para micronutrientes          |
| `DayLog.date` como DATE local + `Profile.timezone` | Evitar que "la cena" caiga en el día siguiente por UTC                        |
| Onboarding bloqueante                              | Usuario final necesita `Profile` completo para que TDEE/macros tengan sentido |
| RGPD: export + delete desde el día 1               | Obligación legal en EU; añadirlo después tras acumular datos es peor          |

Cuando se cambie una decisión, **actualizar esta tabla** con la fecha y el motivo. No borrar la fila antigua, tacharla.

---

## 11. Stack auxiliar y herramientas

Decisiones de herramientas más allá del stack principal (Next/React/Supabase/Tailwind). Una sola opción por necesidad → menos divergencia.

| Necesidad                | Elegido                                    | Notas                                                                |
| ------------------------ | ------------------------------------------ | -------------------------------------------------------------------- |
| Formularios              | `react-hook-form` + `zod`                  | Schema en `features/X/schemas.ts`, usado en cliente Y servidor       |
| Validación               | `zod`                                      | Un solo schema valida form y Server Action                           |
| Toasts                   | `sonner` (de shadcn)                       | Para feedback no bloqueante. Errores Server Action → `toast.error()` |
| Diálogos / modales       | `Dialog` de shadcn                         | Para confirmaciones destructivas y forms grandes                     |
| Fechas                   | `date-fns` + `date-fns-tz`                 | Manipulación; `Intl.DateTimeFormat` para mostrar                     |
| Gráficas                 | `recharts`                                 | Para progresión semanal/mensual                                      |
| Escáner de barras        | `html5-qrcode` (Fase 4)                    | Funciona con cámara del navegador                                    |
| Iconos                   | `lucide-react`                             | Viene con shadcn                                                     |
| Testing unit/integración | `vitest`                                   | Para `domain.ts`, `lib/nutrition`, schemas, server actions           |
| Testing E2E (Fase 5+)    | `playwright`                               | Flujos críticos: login, onboarding, añadir comida                    |
| Linting                  | `eslint` (preset Next + Tailwind plugin)   | Falla = commit bloqueado                                             |
| Formateo                 | `prettier` + `prettier-plugin-tailwindcss` | Format on save + pre-commit                                          |
| Pre-commit hooks         | `husky` + `lint-staged`                    | Ejecuta lint + format + typecheck en lo cambiado                     |
| Error monitoring         | `@sentry/nextjs`                           | Inicializado pero deshabilitado en dev. DSN en `SENTRY_DSN`          |
| PWA                      | `@serwist/next`                            | Service worker + manifest. Fork moderno de next-pwa, soporta Next 16 |

### Configuración mínima requerida

- `eslint.config.mjs`: heredar de `next/core-web-vitals`, añadir plugin Tailwind, error en `no-restricted-imports` (prohibir `../../` y cross-feature imports).
- `prettier.config.mjs`: tabWidth=2, semi=true, singleQuote=false, trailingComma=es5, plugin Tailwind.
- `.husky/pre-commit`: ejecuta `lint-staged`.
- `lint-staged.config.mjs`: `*.{ts,tsx}` → `eslint --fix && prettier --write`.
- `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`.
- `vitest.config.ts`: jsdom + alias `@/`.
- `next.config.ts`: Serwist wrap + image domains.

### Variables de entorno

- `.env.local` (no comiteado, en `.gitignore`) — claves reales locales.
- `.env.example` (comiteado) — plantilla con todas las claves vacías y descripción.
- Cliente: solo variables con prefijo `NEXT_PUBLIC_`.
- Servidor: todo lo demás. Validar al arrancar con un `zod` schema en `src/env.ts`.

Claves esperadas (irán emergiendo):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server, NUNCA al cliente)
- `OPENFOODFACTS_USER_AGENT` (OFF requiere user-agent identificable)
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`

---

## 12. PWA

La app es **PWA instalable** desde el día 1. Sin escapes.

- **Manifest** (`public/manifest.webmanifest`): nombre, short_name, theme_color, background_color, icons (192, 512, maskable), display=`standalone`, start_url=`/today`, orientation=`portrait`.
- **Service Worker** vía `@serwist/next`:
  - Cachear el shell de la app (HTML+CSS+JS).
  - Cachear navegación (`NetworkFirst` con fallback offline).
  - Cachear imágenes (`CacheFirst`, max 50 items, 30 días).
  - NO cachear llamadas a `/api/*` ni Server Actions (siempre red).
- **Install prompt**: capturar `beforeinstallprompt`, mostrar banner sutil tras 2ª sesión. No molestar al primer uso.
- **iOS**: añadir meta `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, icons específicos. iOS no soporta `beforeinstallprompt` → instrucción manual "Compartir → Añadir a pantalla de inicio" en página de ayuda.
- **Viewport**: `viewport-fit=cover` para pantallas con notch. `theme-color` adaptado a light/dark.
- **Offline básico (no offline-first)**: si no hay red, mostrar pantalla "Sin conexión. Vuelve a intentarlo." con los datos ya cargados de Server Components anteriores. **Offline-first real está en Roadmap §9**.
