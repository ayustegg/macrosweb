# MacrosWeb

App de registro de macros.

## Setup local

```bash
cd web

pnpm install

cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

pnpm dev
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
| `pnpm test run` | Tests |
| `pnpm supabase:types` | Regenera tipos de Supabase |
