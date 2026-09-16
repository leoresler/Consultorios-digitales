# AGENTS.md

## Repo layout
- pnpm monorepo (`pnpm-workspace.yaml`): `apps/*` and `packages/*`.
- Only `apps/api` (NestJS 10) has real code today. `apps/web` appears in `README.md` and root scripts but **does not exist yet** — check `apps/` before assuming it does.
- `packages/shared-types` and `packages/ui` are source-true packages (`main`/`types` → `./src/index.ts`, currently placeholder `index.ts` only).
- Prisma skills are vendored (3 copies) under `apps/api/.agents/skills`, `apps/api/.claude/skills`, `apps/api/.windsurf/skills`. Consult them for any Prisma work.

## Commands (Windows shell)
- PowerShell ExecutionPolicy blocks `.ps1` shims: use `pnpm.cmd` (or `pnpm.CMD`), never bare `pnpm`.
- Run the API: `pnpm.cmd --filter @consultorios/api dev` (`nest start --watch`). Root `pnpm dev` / `dev:web` FAIL (`@consultorios/web` doesn't match any project); root `dev:api` works.
- Build: `pnpm.cmd --filter @consultorios/api build` → `nest build` (output `apps/api/dist`).

### Verification is currently broken — don't assume green CI
- `pnpm.cmd typecheck` (root) runs only `apps/api` and FAILS on pre-existing errors in the working tree: `otpCode`/`otpExpiresAt` missing on `UsuarioResponse` (`auth.service.ts`), nullable `usuario.email` vs `string` (`medicos.service.ts`), missing `contrasena` in `UsuarioResponse` mapping (`usuarios.service.ts`), `role` missing on `JwtUser` (`roles.guard.ts`). Treat these as known WIP, not your regression.
- `pnpm.cmd lint` (root) FAILS: no package defines a `lint` script. `packages/config-lint/oxlint.json` exists but is not wired to any package. Don't introduce lint tooling without asking.
- Jest deps (`jest`, `ts-jest`) and some `*.spec.ts` exist in `apps/api`, but there is **no jest config/transform** — `jest` cannot parse TS and fails. Tests are not runnable as configured.

## apps/api conventions
- `"type": "module"` with Node16 module resolution: relative imports MUST keep the `.js` suffix (`./app.controller.js`, `../prisma/prisma.service.js`). Never use `.ts` extensions.
- `apps/api/tsconfig.json` intentionally overrides the shared base: decorators enabled, `strictPropertyInitialization`, `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` disabled. Don't "fix" these.
- Environment: `ConfigModule.forRoot({ isGlobal: true })`; secrets live in `apps/api/.env` (gitignored). Required: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Never print or commit the real `.env`.
- `src/main.ts`: global `ValidationPipe({ whitelist, transform })`; CORS allows `localhost:5173` and `localhost:3000`.
- Domain code (Spanish naming) is grouped per feature: `auth/`, `users/` (usuarios), `medicos/`, `consultorios/`. DTOs in `dto/`, interfaces in `interfaces/`. DTO filename casing is inconsistent (`dto/crear-usuario.dto.ts` vs `medicos/dto/CrearMedicoDto.dto.ts`) — match the folder you're editing.

## Prisma 7 (driver adapter)
- `prisma/schema.prisma` datasource has NO `url` (Prisma 7 style); the URL comes from `apps/api/prisma.config.ts`, which loads `.env` via `dotenv`. Run Prisma CLI from `apps/api`, e.g. `pnpm.cmd --filter @consultorios/api exec prisma migrate dev`.
- Runtime connects through the pg adapter: `PrismaPg(new Pool({ connectionString: DATABASE_URL }))` in `src/prisma/prisma.service.ts` (`@prisma/adapter-pg`). Queries fail without `DATABASE_URL` set.
- Models are `db pull`-generated snake_case tables (`usuarios`, `consultorios_medicos`, `roles_usuario`, ...). After manual schema edits run `prisma generate`; migrations are under `apps/api/prisma/migrations/`.

## Git
- Remote `origin` = `github.com/leoresler/Consultorios-digitales`. Work happens on `feature/*` branches (current: `feature/medicos`) with WIP left uncommitted — check `git status` before starting.