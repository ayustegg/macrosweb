# Documentación de producto

Esta carpeta contiene los PRDs (Product Requirement Documents) y las issues estructuradas para llevar a cabo macrosweb.

## Estructura

```
docs/
├── README.md              ← Este fichero
├── prds/                  ← Documentos de requisitos por fase
│   ├── 00-vision.md       ← Visión del producto, métricas de éxito, scope MVP
│   ├── 01-fase-1-fundamentos.md
│   ├── 02-fase-2-foods.md
│   ├── 03-fase-3-dashboard.md
│   ├── 04-fase-4-pwa-scanner.md
│   └── 05-fase-5-mejoras.md
├── issues/                ← Issues granulares por fase
│   ├── fase-1.md          ← 14 issues (foundation)
│   ├── fase-2.md          ← 10 issues (foods + meals)
│   ├── fase-3.md          ← 6 issues (dashboard)
│   ├── fase-4.md          ← 6 issues (PWA + scanner)
│   └── fase-5.md          ← 8 epics (mejoras + RGPD)
└── import-to-linear.md    ← Prompt para crear las issues en Linear en sesión nueva
```

## Cómo crear las issues en Linear

1. Abre una sesión nueva de Claude Code en `/Users/victor/macrosweb/` (Linear MCP autenticado).
2. Lánzale: "Importa todas las issues de `web/docs/issues/` a Linear, equipo X, proyecto macrosweb. Crea un Project por fase y vincula las issues."
3. Revisa el resultado.

Ver `import-to-linear.md` para el prompt completo y configurables.

## Convenciones

- **IDs**: `F<fase>-<NN>` (ej. `F1-03`, `F2-10`). Los epics de Fase 5 son `F5-EPIC-NN`.
- **Estimaciones**: XS=1, S=2, M=3, L=5, XL=8 (Fibonacci puntos).
- **Estados**: ✅ HECHO marca issues ya implementados antes de importar a Linear.
- **Dependencias**: campo `Depende de` / `Bloquea` para encadenar.

## Mantener estos docs actualizados

Cuando una fase cambie de scope:

1. Edita su PRD.
2. Añade/edita issues en el fichero correspondiente.
3. Si ya están en Linear, actualiza también allí (la sesión con MCP lo hará).

Estos docs y Linear NO se sincronizan automáticamente. Trata el repo como la fuente de verdad inicial; Linear es para tracking operativo.
