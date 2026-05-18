# Cómo importar las issues a Linear

Esta nota es para usar en una **sesión nueva de Claude Code** donde Linear MCP esté disponible.

## Pre-requisitos

1. Linear MCP autenticado (estado `Connected` en `claude mcp list`).
2. Sesión iniciada en `/Users/victor/macrosweb/` (donde está configurado el MCP local).
3. Saber el nombre del equipo (Linear "Team") y, opcionalmente, el del workspace.

## Prompt para pegar

```
Tienes acceso a Linear MCP. Lee `web/docs/issues/*.md` y `web/docs/prds/*.md`
y crea en Linear:

1. Un **Project** por cada fase (5 projects en total): "Fase 1 — Fundamentos",
   "Fase 2 — Foods y registro", "Fase 3 — Dashboard diario",
   "Fase 4 — PWA + scanner", "Fase 5 — Mejoras". La descripción de cada
   project = el contenido completo del PRD correspondiente.

2. Las **issues** dentro de cada project:
   - Título = título tras `## F<X>-<NN>:` del markdown
   - Descripción = "Descripción" + "Aceptación" del issue, en markdown
   - Labels: las del campo Labels del issue (créalas si no existen)
   - Estimate: convertir XS→1, S→2, M→3, L→5, XL→8 (puntos Fibonacci)
   - Saltar las marcadas como "✅ HECHO" (no crearlas — ya están terminadas)
   - Para Fase 5, cada Epic crea un parent issue + sub-issues con los
     sub-items listados

3. Dependencias: cuando un issue dice "Depende de F<X>-<YY>" o "Bloquea
   F<X>-<YY>", añade la relación "blocked by" o "blocks" en Linear.

4. Asignar todo el project a mí (mi usuario actual de Linear).

Antes de empezar:
- Pregunta qué Team usar (lista los Teams disponibles).
- Pregunta si quiero un Cycle inicial (sprint) o trabajar sin cycles.
- Si algo está ambiguo, pregunta. No inventes.

Cuando termines, dame un resumen: cuántas issues creadas por project, qué
labels nuevas creaste, y enlaces a los projects.
```

## Notas operativas

- **Velocidad**: Linear MCP es rate-limited. Crear 40 issues puede llevar 1-2 minutos. No te impacientes.
- **Idempotencia**: si re-ejecutas el prompt, vas a crear duplicados. Si necesitas re-importar, primero borra en Linear lo que ya hay (o usa `--update` mode si la futura Claude lo implementa).
- **Markdown en Linear**: Linear soporta GitHub-flavored markdown en las descripciones. Los checkboxes de aceptación se renderizan como tasks.

## Si quieres importar solo una fase

Variante del prompt:

```
Lee solo `web/docs/issues/fase-1.md` y `web/docs/prds/01-fase-1-fundamentos.md`,
crea el Project "Fase 1 — Fundamentos" en Linear (team X), y crea sus 14 issues
con las relaciones de dependencia. Salta las marcadas ✅ HECHO.
```

## Mantenimiento posterior

Tras la importación, el repo y Linear divergen. Política:

- Si cambias scope o detalles de una issue: edita el markdown PRIMERO, luego replica en Linear.
- Issues nuevas que aparezcan durante el desarrollo (no planificadas): créalas directo en Linear y NO las metas en los docs (los docs son el plan inicial, no el log de trabajo).
