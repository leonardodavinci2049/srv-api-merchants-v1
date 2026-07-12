# AGENTS.md

Guidance for OpenCode sessions working in this repo. Verified against current source.

## Stack

NestJS 11 + TypeScript (`module: nodenext`, `experimentalDecorators`/`emitDecoratorMetadata`, `strictNullChecks`, `noImplicitAny: false`). Package manager is **pnpm 11** (enforced via `packageManager`; lockfile is `pnpm-lock.yaml`). Lint/format via **Biome**. Tests via Jest 30 + ts-jest. DB is **MySQL via `mysql2` raw SQL** (no ORM). Env validated with **Zod**.

## Commands

```bash
pnpm install          # install
pnpm dev              # nest start --watch (dev server)
pnpm start            # nest start (no watch)
pnpm start:prod       # node dist/main (must build first)
pnpm build            # nest build (also the de-facto typecheck — no separate typecheck script)
pnpm lint             # biome check .         (lint + format check combined)
pnpm lint:fix         # biome check --write .
pnpm format           # biome format --write .
pnpm test             # jest unit tests (src/**/*.spec.ts)
pnpm test:e2e         # jest --config ./test/jest-e2e.json
pnpm test:cov         # jest --coverage
```

Run a single unit test: `pnpm test -- <path-or-pattern>` or `pnpm test -- -t "test name"`. Run a single e2e: `pnpm test:e2e -- <path-or-pattern>`.

There is **no `typecheck` script** — run `pnpm build` to type-check.

## Environment / startup gotchas

- `src/core/config/envs.ts` parses `.env`, then **validates with Zod and throws** if required vars are missing — the app hard-fails on boot.
- Required vars: `APP_API_URL`, `APP_JWT_SECRET`, `APP_PORT`, `API_KEY`, plus DB creds.
- **`.env.sample` is stale/incomplete**: it omits `API_KEY` (which is required) and lists DB vars as `DATABASE_*`. The loader aliases `DATABASE_HOST/PORT/USER/PASSWORD/NAME` → internal `DB_MYSQL_*`, so either naming works. When creating a real `.env`, add `API_KEY`.
- Env loader searches `cwd`, `cwd/..`, and a path relative to the compiled file, so production runs from `dist/` still find a root `.env`.

## Project layout & module wiring

- Entrypoint: `src/main.ts` → `AppModule` (`src/app.main/app.module.ts`). Global prefix is **`/api`** (no global `/v1`; versioning is per-route, e.g. `promolinks/v2/...`, `dboperation/v1/...`).
- `AppModule` registers these feature modules only: **`DbOperationModule`, `PromolinksModule`, `ShopeeOperationModule`**.
- `src/shopee-api/` exists as a full module/controller but is **NOT imported by `AppModule`** — its `/api/shopee-api/*` routes are currently inactive. Editing it has no runtime effect until it's registered.
- `src/database/` exposes `DatabaseModule` (`DatabaseService`, a mysql2 pool); each feature module imports it individually.
- `src/core/` is shared infra: `config/`, `guards/`, `decorators/`, `interceptors/`, `services/`, `procedures/` (stores `.sql` stored-procedure text), `utils/`.
- `pageroot/` is a static frontend served at `/` via `ServeStaticModule`, excluded from `/api/*`.
- Globals: `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`, implicit conversion on), `ThrottlerGuard` as the default guard (limit is very high — effectively off), CORS `*`.

## Conventions

- **Imports**: cross-module imports use the `src/...` absolute path (e.g. `import { DatabaseModule } from 'src/database/database.module'`); `baseUrl` is `./`. Use relative imports only within the same module. Match this when adding code.
- **Biome style**: single quotes, trailing commas everywhere, 2-space indent, import organizing on save. `useImportType` is **off** — do not add explicit `import type`.
- **Language**: comments, log messages, DB method names, and error classes are frequently **Portuguese** (e.g. `chamarProcedimento`, `ErroConexaoBancoDados`). Match surrounding language.

## Auth

`AuthGuard` (`src/core/guards/auth.guard.ts`) checks `Authorization: Bearer <key>` **or** `x-api-key: <key>` against `envs.API_KEY`. Apply per-handler with `@UseGuards(AuthGuard)` — it is not global. `RoleGuard` reads `@Roles(...)` + `request.userRequest.ROLE`.

## Database access

All SQL is hand-written through `DatabaseService`: `selectQuery` / `selectExecute` (reads), `ModifyQuery` / `ModifyExecute` (writes), `runInTransaction(cb)` (managed txn), `chamarProcedimento` (calls a stored `CALL`). No query builder / migrations — DDL lives in the DB and in `src/core/procedures/*.sql`.

## Tests

- Unit tests are colocated (`*.spec.ts`) and `rootDir` is `src`. They build minimal `Test.createTestingModule(...)` modules without DB.
- **e2e tests (`test/*.e2e-spec.ts`) boot the full `AppModule`**, which constructs `DatabaseService` and opens a MySQL pool — they need reachable DB creds (via `.env`) or DB calls will fail. e2e `moduleNameMapper` maps `src/*` → `<rootDir>/../src/$1`.

## Generated / gitignored paths

These are in `.gitignore` and won't exist in a fresh clone — don't expect them and don't commit into them: `/dist`, `/coverage`, `/scripts`, `/docs`, `/schemas`, `/database-docs`, `database-objects/`, `.agents`.
- `scripts/generate-schema.mjs` (local) introspects MySQL into `database-objects/schemas/`; requires DB env. Not tracked.
- `scripts/git-flow-release.sh` (local) encodes the release flow; not tracked.

## Git workflow

git-flow. Work on `feature/featr-NNN` branches; releases are tagged `rls-NNN` and push `main` + `develop` + tags, then start `featr-(NNN+1)`. The release is automated by the local `scripts/git-flow-release.sh` (requires a clean tree and `git flow` installed). There is **no CI** in this repo.
