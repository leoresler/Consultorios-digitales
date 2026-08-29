# Consultorios Digitales Monorepo

## Estructura

```text
.
├── apps
│   ├── api
│   └── web
├── packages
│   ├── config-lint
│   ├── config-typescript
│   ├── shared-types
│   └── ui
```

## Estado actual

- `apps/web`: migracion de la app actual React + Vite.
- `apps/api`: scaffold inicial para futuro backend.
- `packages/config-lint`: configuracion compartida de Oxlint.
- `packages/config-typescript`: bases compartidas de TypeScript.
- `packages/shared-types`: espacio para tipos/schemas compartidos.
- `packages/ui`: espacio para componentes compartidos.

## Comandos

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
```

## Nota importante

El repo original era una sola app Vite/React con `npm` y `Oxlint`. La migracion la deja lista como workspace `pnpm`, pero el backend NestJS quedo solo scaffolded porque no existia en el repo original.
