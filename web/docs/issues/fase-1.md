# Fase 1 — Issues

Issues con prefijo `F1-NN`. Estimaciones en puntos (XS=1, S=2, M=3, L=5, XL=8).

PRD: [`docs/prds/01-fase-1-fundamentos.md`](../prds/01-fase-1-fundamentos.md).

---

## F1-01: Setup proyecto Next.js 16 + TS + Tailwind + pnpm

**Labels**: setup, infra
**Estimate**: S
**Estado**: ✅ HECHO (commit inicial pendiente)
**Bloquea**: F1-03

### Descripción

Inicializar el proyecto en `/Users/victor/macrosweb/web/` con `pnpm create next-app@latest` con flags: `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbopack`. Arreglar `pnpm-workspace.yaml` para aprobar builds de `sharp` y `unrs-resolver`.

### Aceptación

- [x] `pnpm dev` arranca en `http://localhost:3000` (o 3001 si está ocupado).
- [x] Tailwind funciona en `globals.css`.
- [x] Página `/` renderiza el placeholder de Next.

---

## F1-02: Documentar arquitectura y reglas de IA

**Labels**: docs
**Estimate**: M
**Estado**: ✅ HECHO

### Descripción

Crear `ARCHITECTURE.md` (filosofía, estructura, modelo dominio, layer boundaries, data flow, conventions, lifecycle, roadmap, ADRs, stack auxiliar, PWA) y `CLAUDE.md` (reglas duras: dónde va cada cosa, server vs client, naming, forms, testing, lint).

### Aceptación

- [x] Existen `web/ARCHITECTURE.md` y `web/CLAUDE.md`.
- [x] Esqueleto de `src/{features,components/ui,components/layout,lib/{supabase,openfoodfacts,nutrition},hooks,types,styles}` creado.

---

## F1-03: Configurar herramientas dev (Prettier + Husky + lint-staged + Vitest)

**Labels**: setup, dev-tooling
**Estimate**: M
**Depende de**: F1-01
**Bloquea**: F1-22

### Descripción

- Instalar `prettier`, `prettier-plugin-tailwindcss`, `husky`, `lint-staged`, `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`.
- Crear `prettier.config.mjs` (tabWidth=2, semi=true, singleQuote=false, trailingComma=es5, plugin Tailwind).
- Crear `vitest.config.ts` con alias `@/` + jsdom.
- Ampliar `eslint.config.mjs`: heredar `next/core-web-vitals`, añadir regla `no-restricted-imports` (prohibir `../../` profundo y cross-feature).
- Configurar Husky: `pnpm husky init`, hook `pre-commit` ejecuta `lint-staged`.
- Crear `lint-staged.config.mjs` que ejecute eslint --fix + prettier --write en `*.{ts,tsx,js,jsx,json,md}`.
- Añadir scripts a `package.json`: `lint`, `typecheck`, `test`, `format`, `format:check`.

### Aceptación

- [ ] `pnpm lint && pnpm typecheck && pnpm test` pasan (test puede ser vacío todavía).
- [ ] Pre-commit hook bloquea commit con lint error introducido a propósito.
- [ ] Formatear un fichero con `pnpm format` reordena clases Tailwind.

---

## F1-04: Setup PWA (Serwist + manifest + iconos placeholder)

**Labels**: pwa, infra
**Estimate**: M
**Depende de**: F1-01
**Bloquea**: —

### Descripción

- Instalar `@serwist/next` y `serwist`.
- Crear `public/manifest.webmanifest` con nombre "macrosweb", short_name, theme_color, background_color, icons placeholder (192/512), display=standalone, start_url=/today, orientation=portrait.
- Crear `src/app/sw.ts` con Serwist básico (precache + runtime).
- Modificar `next.config.ts` para envolver con `withSerwist`.
- Iconos placeholder (puede ser logo SVG genérico) en `public/icons/`.
- Meta tags en root layout: theme-color, viewport-fit=cover, apple-mobile-web-app-capable.

### Aceptación

- [ ] Chrome DevTools "Application → Manifest" muestra el manifest sin errores.
- [ ] SW se registra correctamente (Application → Service Workers).
- [ ] App auditada con Lighthouse PWA da al menos 50/100 (los detalles finos quedan para Fase 4).

---

## F1-05: Setup Supabase: proyecto, clientes, env vars validados con Zod

**Labels**: supabase, infra, env
**Estimate**: M
**Bloquea**: F1-07, F1-09

### Descripción

- Crear proyecto en Supabase (región EU). Anotar URL + anon key + service role key.
- Instalar `@supabase/supabase-js`, `@supabase/ssr`.
- Crear `src/lib/supabase/server.ts` (createServerClient con cookies de Next).
- Crear `src/lib/supabase/browser.ts` (createBrowserClient).
- Crear `src/lib/supabase/middleware.ts` (helper para usar en middleware.ts).
- Crear `src/env.ts` con Zod schema que valide en boot: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENFOODFACTS_USER_AGENT`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`. Exportar `env` tipado.
- Crear `.env.example` con todas las claves vacías y descripción.
- Añadir a `package.json`: script `supabase:types` que ejecute `supabase gen types typescript --linked > src/lib/supabase/database.types.ts`.

### Aceptación

- [ ] App arranca con `.env.local` válido.
- [ ] Si falta una env var crítica, app falla al arrancar con mensaje claro.
- [ ] `.env.example` documenta cada variable.

---

## F1-06: Setup shadcn/ui + componentes base

**Labels**: ui, setup
**Estimate**: S
**Depende de**: F1-01

### Descripción

- Ejecutar `pnpm dlx shadcn@latest init` (con preset: New York / slate / CSS variables / RSC).
- Añadir componentes base: `button`, `input`, `label`, `card`, `dialog`, `form`, `select`, `radio-group`, `checkbox`, `skeleton`, `separator`, `tabs`, `dropdown-menu`, `sonner` (toasts).
- Instalar `react-hook-form` y `@hookform/resolvers` + `zod`.
- Configurar provider `<Toaster />` en root layout.

### Aceptación

- [ ] `src/components/ui/*.tsx` poblado con shadcn.
- [ ] Toast funciona en un componente de prueba (`toast.success("test")`).
- [ ] Form de prueba con `react-hook-form` + `zodResolver` valida y muestra errores.

---

## F1-07: Migración inicial BD: schema completo + RLS + triggers + seeds

**Labels**: supabase, migration, schema
**Estimate**: L
**Depende de**: F1-05
**Bloquea**: F1-09, F1-11, F1-12

### Descripción

Crear `supabase/migrations/0001_init.sql` con TODO el schema base. Sigue las guidelines de `ARCHITECTURE.md §7 BD`:

- Tablas: `profiles`, `weight_logs`, `goals`, `meal_slots`, `foods`, `recipes`, `recipe_items`, `day_logs`, `entries`.
- Tipos: UUID, TIMESTAMPTZ, DATE, NUMERIC con escala correcta.
- Constraints: NOT NULL, CHECK ranges (kcal>=0, weight_kg 20-500, height_cm 50-250), UNIQUE (owner_id,date) en day_logs.
- FKs con ON DELETE CASCADE para datos del usuario; ON DELETE SET NULL para FK a foods públicos en entries.
- Índices: cada `owner_id`, compuestos `(owner_id, date DESC)` en day_logs, `(day_log_id, meal_slot_id, position)` en entries. GIN en `foods.nutrients`. Trigram en `foods.name` para LIKE.
- RLS en TODAS las tablas con owner_id: policy `auth.uid() = owner_id` para SELECT/INSERT/UPDATE/DELETE. `foods` source='off': SELECT abierto a authenticated, mutaciones service_role.
- Funciones SQL: `set_updated_at()`, `handle_new_user()`.
- Triggers: BEFORE UPDATE en cada tabla → set_updated_at; AFTER INSERT en auth.users → handle_new_user (crea fila vacía en profiles).
- Seed (en seed.sql o en la propia migración): nada inicial. Los 5 MealSlots por defecto se crean por código en onboarding.

### Aceptación

- [ ] `supabase db push` aplica la migración sin errores.
- [ ] Crear un usuario via Supabase Auth crea fila vacía en `profiles`.
- [ ] RLS bloquea acceso cross-user (test manual con dos cuentas).
- [ ] `pnpm supabase:types` regenera tipos TS sin errores.

---

## F1-08: Implementar lib/nutrition (BMR, TDEE, sugerencia macros, conversiones)

**Labels**: domain, lib
**Estimate**: M
**Bloquea**: F1-12

### Descripción

Funciones puras en `src/lib/nutrition/`:

- `bmr.ts`: `calculateBmr(profile)` con Mifflin-St Jeor.
- `tdee.ts`: `calculateTdee(bmr, activityLevel)`. Activity multipliers: sedentary=1.2, light=1.375, moderate=1.55, active=1.725, very_active=1.9.
- `goal.ts`: `suggestedGoal(tdee, goalType)`. Lose=-500 kcal, maintain=0, gain=+300. Macros: P=2g/kg de peso magro, F=25% kcal, C=resto.
- `units.ts`: `convertToGrams(quantity, unit, food)`. Maneja 'g', 'ml' (requiere density), 'serving' (requiere serving_size).
- `aggregate.ts`: `aggregateMacros(entries[])` suma kcal/P/C/G/nutrients.
- `index.ts` re-exporta lo principal.
- Tests Vitest para cada función (`*.test.ts` adyacente).

### Aceptación

- [ ] Todos los tests pasan con valores conocidos (ej: BMR de 80kg/180cm/30años/H = 1788 kcal).
- [ ] Edge cases cubiertos: ml sin density → throw; serving sin serving_size → throw.
- [ ] No imports de React, Next, Supabase ni nada con I/O.

---

## F1-09: Feature auth: signup, login, logout, verify, reset password

**Labels**: feature:auth
**Estimate**: L
**Depende de**: F1-05, F1-06
**Bloquea**: F1-10

### Descripción

- `src/features/auth/schemas.ts`: Zod schemas para signup, login, reset.
- `src/features/auth/actions.ts`: Server Actions (signup, login, logout, requestReset, confirmReset) devolviendo `ActionResult<T>`.
- `src/features/auth/queries.ts`: `getSession()`, `getCurrentUser()`.
- Rutas en `src/app/(auth)/`: `/login`, `/signup`, `/auth/verify`, `/auth/reset`, `/auth/callback`.
- Componentes: LoginForm, SignupForm, ResetForm, todos con react-hook-form + zodResolver.
- Configurar email templates de Supabase (verify, reset) en castellano. Si Supabase no permite editar fácilmente, dejarlo por defecto y crear issue follow-up.

### Aceptación

- [ ] Usuario puede registrarse → recibe email → confirma → puede entrar.
- [ ] Login con credenciales correctas redirige a `/today` (o `/onboarding` si perfil incompleto).
- [ ] Login con credenciales incorrectas muestra error claro en Toast.
- [ ] Reset password funciona end-to-end.
- [ ] Tests Vitest del happy path + 2 errores en cada action.

---

## F1-10: Middleware: redirección auth + onboarding

**Labels**: feature:auth, infra
**Estimate**: S
**Depende de**: F1-09, F1-11
**Bloquea**: F1-12

### Descripción

- `src/middleware.ts` en raíz de proyecto.
- Lógica:
  1. Rutas exentas (`/login`, `/signup`, `/auth/*`, assets, api/auth) → pasar.
  2. Si no hay sesión → redirigir a `/login`.
  3. Si hay sesión pero `profile.profile_completed_at IS NULL` y la ruta NO es `/onboarding` → redirigir a `/onboarding`.
  4. Si está en `/onboarding` con perfil completo → redirigir a `/today`.
- Matcher en `next.config.ts` o en `middleware.ts` para incluir solo rutas relevantes.
- Implementación eficiente (no llamar a Supabase profile en cada request si ya está cacheado en cookies).

### Aceptación

- [ ] Sin sesión, visitar `/today` redirige a `/login`.
- [ ] Con sesión sin onboarding, visitar `/today` redirige a `/onboarding`.
- [ ] Con sesión completa, visitar `/onboarding` redirige a `/today`.
- [ ] Rutas públicas accesibles sin sesión.

---

## F1-11: Feature profile: queries, actions, UI básica

**Labels**: feature:profile
**Estimate**: M
**Depende de**: F1-07
**Bloquea**: F1-10, F1-12

### Descripción

- `src/features/profile/schemas.ts`: schema completo del Profile (timezone, sexo, fecha nac, altura, actividad, objetivo, nombre, avatar opcional).
- `src/features/profile/queries.ts`: `getProfile(userId)`, `getActiveGoal(userId)`.
- `src/features/profile/actions.ts`: `updateProfile(input)`, `completeOnboarding(input)` (atómica: crea Profile completo + Goal inicial + WeightLog inicial + MealSlots por defecto).
- `src/features/profile/domain.ts`: composición de las pure functions de `lib/nutrition` para obtener Goal sugerido desde Profile.
- Página `/profile` con datos del usuario y botón editar (placeholder para Fase 5).

### Aceptación

- [ ] Onboarding crea todo lo necesario en una sola transacción (test: rollback si falla).
- [ ] Tests Vitest de `domain.ts`.

---

## F1-12: Pantalla de onboarding multi-step

**Labels**: feature:profile, ui, onboarding
**Estimate**: L
**Depende de**: F1-06, F1-08, F1-10, F1-11

### Descripción

`/onboarding` con form multi-step (5 pasos):

1. Nombre y zona horaria (default desde navegador).
2. Sexo + fecha de nacimiento.
3. Altura + peso actual.
4. Nivel de actividad (cards con descripción para cada nivel).
5. Objetivo (perder / mantener / ganar) + preview del Goal calculado (kcal y macros) con mensaje "Puedes ajustarlo después".

Estado del form: sessionStorage o React state (no persistir en BD hasta el último paso).
Submit final → llama `completeOnboarding` → redirige a `/today`.

### Aceptación

- [ ] No se puede saltar a `/today` con perfil incompleto.
- [ ] Cada paso valida antes de avanzar.
- [ ] Botón "Atrás" preserva los datos.
- [ ] El cálculo de Goal en el paso 5 se actualiza al editar pasos previos.
- [ ] Mensajes de validación claros en español.

---

## F1-13: AppShell + BottomNav + /today placeholder

**Labels**: ui, layout
**Estimate**: M
**Depende de**: F1-06

### Descripción

- `src/components/layout/app-shell.tsx`: layout con header + main + BottomNav. Maneja safe-area-insets.
- `src/components/layout/bottom-nav.tsx`: 4 items con iconos (lucide): Today (Home), Foods (Search), Recetas (Utensils), Perfil (User). Usa `usePathname` para destacar el activo.
- `src/app/(app)/layout.tsx`: aplica AppShell a todas las rutas autenticadas.
- `src/app/(app)/today/page.tsx`: placeholder ("Aún no has registrado nada hoy. Añadir comida →").
- `loading.tsx` en `(app)` con skeleton del layout.

### Aceptación

- [ ] Navegación entre tabs funciona.
- [ ] Item activo destacado.
- [ ] En móvil real, BottomNav respeta safe-area-bottom (iPhone con notch).
- [ ] Skeleton aparece durante navegación.

---

## F1-14: Git init + CI básico (lint + typecheck + test)

**Labels**: ci, infra
**Estimate**: S
**Depende de**: F1-03

### Descripción

- `git init` en `/Users/victor/macrosweb/` o `/Users/victor/macrosweb/web/` (decidir antes).
- `.gitignore` apropiado (Next, Supabase, env, node_modules).
- Crear repo en GitHub privado.
- Crear `.github/workflows/ci.yml`: en pull_request a main, ejecuta `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Primer commit con mensaje convencional ("chore: initial setup").
- Branch protection en `main`: requiere CI verde.

### Aceptación

- [ ] CI corre en cada push/PR.
- [ ] CI falla si introduzco un lint error a propósito.
- [ ] README mínimo con instrucciones de setup local.
