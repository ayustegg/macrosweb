# PRD 01 — Fase 1: Fundamentos

## Goal

Tener una app web instalable como PWA, con autenticación funcional, onboarding bloqueante que captura el perfil del usuario, esquema de BD listo, y arquitectura preparada para añadir features. Sin contenido de dominio aún (foods/meals vacíos).

## User journey al final de la fase

1. Usuario llega a `/` → ve landing simple con CTA "Empezar".
2. Click → `/signup` → introduce email + password.
3. Recibe email de verificación → confirma.
4. Login automático → middleware detecta `profile_completed_at IS NULL` → redirige a `/onboarding`.
5. Completa onboarding (4-5 pasos: nombre, sexo, fecha nac., altura, peso, actividad, objetivo).
6. Al finalizar → calcula `Goal` automático con BMR/TDEE, crea `WeightLog` inicial, crea `MealSlot`s por defecto.
7. Redirige a `/today` → pantalla vacía con "Aún no has registrado nada hoy. Añadir comida →".

## Scope

### Infraestructura

- Stack instalado y configurado (Next.js 16 + TS + Tailwind 4 + pnpm) ✅ HECHO
- Documentación arquitectura ✅ HECHO
- Herramientas dev: Prettier + ESLint + Husky + lint-staged + Vitest
- PWA básica: manifest + Serwist SW (con cacheado mínimo)
- Sentry inicializado (deshabilitado en dev)
- Validación de env vars con Zod
- CI básico: lint + typecheck + test en pull request

### Backend (Supabase)

- Proyecto Supabase EU creado
- Clientes (server + browser + middleware)
- Migración inicial: profiles, weight_logs, goals, meal_slots, foods, day_logs, entries, recipes, recipe_items
- RLS policies en TODAS las tablas con `owner_id`
- Triggers: `handle_new_user`, `set_updated_at`
- Tipos TS regenerados (`pnpm supabase:types`)

### Features

- `auth`: signup, login, logout, verify email, reset password
- `profile`: lectura/escritura del Profile
- `nutrition` (lib): BMR (Mifflin-St Jeor), TDEE, sugerencia de macros, conversión de unidades
- Middleware: redirige a `/login` si no hay sesión, a `/onboarding` si perfil incompleto

### UI

- shadcn/ui instalado con componentes base (Button, Input, Card, Dialog, Form, Toast/Sonner, Select, RadioGroup)
- AppShell + BottomNav (4 items: Today, Foods, Recetas, Perfil) — sin contenido aún
- Pantallas: `/`, `/login`, `/signup`, `/onboarding`, `/today` (placeholder)
- Sistema de toast configurado (sonner)
- Diseño mobile-first, tema oscuro/claro vía Tailwind

## Out of scope

- Foods: ni búsqueda ni creación (Fase 2)
- Meals: ni registro ni dashboard (Fases 2-3)
- PWA install prompt sofisticado (Fase 4)
- Login con Google/Apple (Fase 5)

## Criterios de aceptación

- [ ] `pnpm dev` arranca la app local en localhost.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pasan en verde.
- [ ] Pre-commit hook bloquea commits con lint errors.
- [ ] Usuario puede registrarse, verificar email y llegar a `/today`.
- [ ] Middleware redirige correctamente en los 3 casos (sin sesión, perfil incompleto, completo).
- [ ] Manifest válido (Chrome DevTools "Application → Manifest" sin errores).
- [ ] SW registrado correctamente.
- [ ] Tabla de `profiles` muestra la fila del usuario completo con todos los campos.

## Estimación

~14 issues, 2-3 semanas de trabajo focused.

## Issues

Ver `web/docs/issues/fase-1.md`.
