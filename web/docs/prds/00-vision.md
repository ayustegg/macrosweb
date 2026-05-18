# PRD 00 — Visión de producto

## Problema

Hacer seguimiento diario de macros (calorías + proteína + carbohidratos + grasas) es la herramienta más útil para gestionar la composición corporal — para cutting, bulking o mantenimiento. Las apps existentes tienen problemas:

- **MyFitnessPal**: lenta, llena de anuncios, freemium agresivo, UX anticuada.
- **Yazio / Lifesum**: suscripción casi obligatoria para features básicas.
- **Cronometer**: potente pero técnico, mala UX en móvil.
- **Macros.app**: bonita pero solo iOS, no web ni Android.

No existe una app **web mobile-first**, gratis, simple, rápida, instalable como PWA, con soporte en español y datos europeos.

## Solución

**macrosweb**: una PWA (instalable como app nativa en cualquier móvil) para registrar comidas y trackear macros. Sin suscripción, sin anuncios, datos del usuario en su zona EU (Supabase EU region), código abierto del usuario.

## Usuario objetivo

Persona que ya entiende qué son los macros y busca herramienta para registrarlos. NO es para principiantes absolutos que necesitan educación nutricional.

Casos de uso:

- Quiero perder grasa controlando déficit calórico y proteína mínima.
- Quiero ganar músculo controlando superávit y reparto de macros.
- Quiero mantener composición y monitorizar adherencia.

## Métricas de éxito al lanzar (MVP)

| Métrica                                    | Objetivo |
| ------------------------------------------ | -------- |
| Tiempo desde signup a primer registro      | < 3 min  |
| Tiempo de añadir un alimento a una comida  | < 20 s   |
| % de búsquedas con resultado satisfactorio | > 80 %   |
| Página /today carga (FCP) en móvil 4G      | < 1.5 s  |
| Retención día 7 (usuarios que registran)   | > 30 %   |

## Scope (MVP)

✅ Registro diario de comidas en slots configurables
✅ Búsqueda de alimentos vía Open Food Facts + creación de alimentos personalizados
✅ Recetas (composición de alimentos)
✅ Perfil con cálculo automático de objetivos (BMR/TDEE/macros)
✅ Dashboard diario con progreso visual
✅ PWA instalable + offline básico
✅ RGPD: export y borrado de datos
✅ Multi-dispositivo (mismo usuario, varios dispositivos)

## Out of scope (MVP)

❌ Comunidad social / compartir recetas con otros usuarios
❌ Sincronización con wearables (Apple Health, Garmin)
❌ Ejercicio / calorías quemadas
❌ Notificaciones push
❌ Offline-first con cola de sincronización
❌ Multi-idioma (solo español-ES en MVP)
❌ Sistema imperial (solo métrico)
❌ Micronutrientes vitaminas/minerales detallados (solo macros + algunos sub-macros: fibra, azúcares, grasas sat., sal)

Ver `ARCHITECTURE.md §9` para el roadmap completo post-MVP.

## Stack tecnológico

Next.js 16 + React 19 + TypeScript + Tailwind 4 + Supabase + Open Food Facts. Detalle en `ARCHITECTURE.md`.

## Fases de entrega

1. **Fase 1 — Fundamentos**: stack, auth, onboarding, schema, layout.
2. **Fase 2 — Foods + registro**: buscar, crear, registrar en comidas.
3. **Fase 3 — Dashboard diario**: progreso, lista, navegación.
4. **Fase 4 — PWA + scanner**: instalable, código de barras.
5. **Fase 5 — Mejoras**: recetas, favoritos, copiar día, gráficas, fotos, RGPD, OAuth.

Cada fase tiene su PRD detallado en este mismo directorio.
