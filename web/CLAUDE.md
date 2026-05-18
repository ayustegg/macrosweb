# Project rules for Claude

Léelo entero antes de tocar nada en este repo. Si entras en conflicto con `ARCHITECTURE.md`, ese gana.

---

## Antes de escribir código

1. Si no tienes `ARCHITECTURE.md` en contexto, léelo.
2. **Antes de crear un fichero nuevo**, busca si ya existe algo parecido:
   - Componente → `grep -r "ComponentName" src/components src/features`
   - Hook → buscar en `src/hooks` y `src/features/*/hooks`
   - Tipo → buscar en `src/types` y `src/features/*/types.ts`
   - Función utilitaria → buscar en `src/lib`
3. Si existe algo similar al 70%+, **extiende lo que hay**. No crees `FoodCard2`, `useFood2`, etc.

---

## Dónde va cada cosa (reglas duras)

| Tipo de archivo                    | Carpeta                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| Página o ruta                      | `src/app/<ruta>/page.tsx`                                     |
| Componente usado por 1 feature     | `src/features/<feature>/components/`                          |
| Componente usado por 2+ features   | `src/components/` (¿en `ui/`? ¿en `layout/`? ¿feature nueva?) |
| Primitivo de UI (button, input…)   | `src/components/ui/` (shadcn)                                 |
| Lógica pura sin I/O ni React       | `src/features/<feature>/domain.ts` o `src/lib/<categoria>/`   |
| Lectura de BD                      | `src/features/<feature>/queries.ts` (server-only)             |
| Escritura de BD                    | `src/features/<feature>/actions.ts` (Server Action)           |
| Schema de validación               | `src/features/<feature>/schemas.ts` (Zod)                     |
| Tipo de dominio compartido         | `src/types/`                                                  |
| Tipo solo de una feature           | `src/features/<feature>/types.ts`                             |
| Utilidad genérica (cn, formatDate) | `src/lib/utils.ts`                                            |

---

## Server vs Client

- **Por defecto Server Component**. NO añadir `"use client"` salvo que sea necesario.
- Añadir `"use client"` solo si el componente usa: `useState`, `useEffect`, `useReducer`, `useRef` (para DOM), event handlers (`onClick`, `onChange`…), o APIs del navegador (`window`, `localStorage`, `navigator`).
- **Nunca** importar un módulo `server-only` desde un componente `"use client"`.
- Las queries (`queries.ts`) empiezan con `import "server-only";`.
- Las actions (`actions.ts`) empiezan con `"use server";`.

---

## Imports

- **Siempre** usar el alias `@/`, nunca rutas relativas con `../../`.
- **Una feature NUNCA importa de otra feature** (`features/foods/` no puede importar de `features/meals/`).
  - Si necesitas hacerlo: el código compartido se mueve a `lib/`, `types/`, `components/` o `hooks/`.
- Orden de imports: react → next → libs externas → `@/...` → relativos.

---

## Naming

- Ficheros: `kebab-case.tsx` (`food-card.tsx`, `use-debounce.ts`)
- Componentes React: `PascalCase` (`FoodCard`)
- Funciones / variables: `camelCase`
- Constantes a nivel de módulo: `UPPER_SNAKE_CASE`
- Tipos e interfaces: `PascalCase`, sin prefijo `I` (`Food`, no `IFood`)
- Tablas SQL: snake_case plural (`weight_logs`)
- Columnas SQL: snake_case (`protein_g`, `created_at`)

---

## NO hacer (rompedores comunes)

- **No** instalar una dependencia sin justificar qué problema resuelve y por qué Tailwind / shadcn / Next no lo cubren.
- **No** redefinir un tipo de dominio (`Food`, `Meal`, `Profile`…). Buscar primero en `src/types/` y en la feature dueña.
- **No** escribir comentarios que explican _qué_ hace el código. Solo el _por qué_ si no es obvio.
- **No** añadir manejo de errores para casos que no pueden ocurrir.
- **No** añadir abstracciones para features futuras hipotéticas ("nos vendrá bien para X" = NO).
- **No** poner lógica de negocio en `app/`. `app/` solo contiene rutas que llaman a queries/actions y renderizan componentes.
- **No** poner lógica de Supabase en componentes UI. La UI no sabe que existe la BD.
- **No** usar `any`. Si un tipo es complejo, declararlo. Si viene de fuera sin tipos, usar `unknown` y refinar.
- **No** crear ficheros `index.ts` de re-export salvo que haya razón clara. Aumentan ruido y entorpecen la búsqueda.

---

## Reglas para UI orientada a usuarios finales

La app la usan personas no técnicas. Aplican siempre:

- **Mensajes de error**: en español, claros, accionables. NUNCA stack traces, IDs internos ni inglés crudo. "No pudimos guardar la comida, inténtalo de nuevo." > "Error 500: PGRST116."
- **Validación**: cliente con Zod + servidor con el MISMO schema (compartido en `schemas.ts`). Cliente da feedback inmediato; servidor es la verdad.
- **Sanity checks** numéricos: gramos `> 0 && < 5000`, peso `> 20 && < 500`, altura `> 50 && < 250`, edad `>= 13`. Rechazar valores absurdos con mensaje útil.
- **Acciones destructivas** (borrar entry, borrar receta, borrar cuenta): SIEMPRE confirmar con `Dialog`. Borrar cuenta: pedir escribir el email completo.
- **Estados de UI async** — toda lectura o mutación tiene los tres:
  - Loading: `Skeleton` o `Spinner` contextual. Nunca pantalla en blanco.
  - Error: mensaje + botón de reintentar.
  - Empty: ilustración o texto + CTA (p.ej. "Aún no has registrado nada hoy. Añadir comida").
- **Forms**:
  - `<label>` asociado a cada input.
  - `autoComplete` apropiado (`email`, `current-password`, `new-password`, `given-name`…).
  - `inputMode="decimal"` o `numeric` en campos numéricos para teclado móvil correcto.
  - Botón submit con `loading` + `disabled` mientras procesa (evita dobles submits).
- **Fechas y números**: `Intl.DateTimeFormat` y `Intl.NumberFormat` con el locale del usuario. Nunca hardcodear `"DD/MM/YYYY"`.
- **Fechas con timezone**: NUNCA hacer `new Date()` en cliente y enviar UTC al servidor para "qué día es hoy". Usar `Profile.timezone` siempre que se calcule un `DayLog.date`.
- **Nada de `alert()` o `confirm()` del navegador**. Usar `Toast` (shadcn `sonner`) o `Dialog`.
- **Accesibilidad mínima**: focus visible, contraste AA, `alt` en `<img>`, `aria-label` en botones-icono.
- **Performance móvil**: imágenes vía `next/image`, lazy-load fuera del viewport, evitar JS innecesario en cliente.

## Forms (patrón único)

Toda feature con form sigue este patrón. Sin excepciones:

1. **Schema en `features/<X>/schemas.ts`** con `zod`. Exporta el schema + `type Input = z.infer<typeof schema>`.
2. **Server Action en `features/<X>/actions.ts`** importa el schema, valida con `schema.safeParse(formData)`, devuelve `ActionResult<T>`.
3. **Componente de form** usa `react-hook-form` con `zodResolver(schema)`. El MISMO schema valida cliente y servidor.
4. Botón submit: deshabilitado durante `isSubmitting`. Errores por campo → mostrar bajo el input. Error general → `toast.error()`.

```typescript
// schemas.ts
export const addFoodSchema = z.object({ ... });
export type AddFoodInput = z.infer<typeof addFoodSchema>;

// actions.ts
"use server";
export async function addFood(input: AddFoodInput): Promise<ActionResult<Food>> {
  const parsed = addFoodSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos", fieldErrors: ... };
  // ...
}
```

## Server Actions (forma de retorno)

Siempre devolver `ActionResult<T>` (ver ARCHITECTURE.md §5.3). NUNCA hacer `throw` para errores esperados. `throw` solo para bugs / errores de infraestructura.

## Migraciones y BD

- Toda modificación de esquema va en un fichero nuevo en `supabase/migrations/NNNN_descripcion.sql`. **NUNCA editar migraciones ya aplicadas**.
- Toda tabla debe tener RLS habilitado y políticas explícitas (ver ARCHITECTURE.md §7 BD).
- Después de tocar el esquema, regenerar tipos: `pnpm supabase:types`.
- Antes de crear una tabla, comprobar la guía completa de §7 BD: tipos, constraints, FKs, índices, RLS, triggers.

## Testing

- Toda función pura en `features/X/domain.ts`, `lib/nutrition/`, `lib/date/` → test con Vitest (`*.test.ts` junto al archivo).
- Server Actions → test del happy path + 2 casos de error (validación, no autorizado).
- E2E (Playwright) reservado para Fase 5+, no antes.

## Lint, format, types

- Antes de considerar terminada una tarea: `pnpm lint && pnpm typecheck && pnpm test` pasan en verde.
- `pnpm format` ejecuta Prettier; el pre-commit hook lo hace solo en lo cambiado.
- TS strict + `noUncheckedIndexedAccess`. Si un acceso a array puede ser `undefined`, manéjalo.

---

## Cuándo parar y preguntar

- El cambio toca 2+ features → confirmar el alcance.
- Hay que cruzar un layer boundary (ver `ARCHITECTURE.md` §4) → confirmar.
- Hay que instalar una dependencia → confirmar nombre y motivo.
- Hay que cambiar algo en `ARCHITECTURE.md` o este fichero → confirmar antes.
- El usuario pide algo "rápido" que viola una regla → señalarlo y proponer alternativa.

30 segundos preguntando ahorran 30 minutos refactorizando.
