# Database Infrastructure Guidance

## Scope

These instructions apply to `src/database/` and supplement the repository root
`AGENTS.md`.

This directory owns only low-level MySQL infrastructure: pool creation,
connection acquisition, query execution primitives, transaction boundaries, and
pool shutdown. Business queries and stored-procedure workflows belong in
`src/db.operation/`.

## Boundaries

- Keep `DatabaseModule` focused on providing and exporting `DatabaseService`.
- Do not add marketplace-specific, HTTP, controller, or business-orchestration
  logic here.
- Read connection settings only through the validated `envs` configuration. Do
  not read `process.env` directly or embed credentials and environment-specific
  defaults.
- Preserve the existing public database methods unless all callers are updated
  as part of an explicitly requested contract change.

## Query Safety

- Use `execute` with `?` placeholders for every user-controlled value. Never
  build SQL by concatenating or interpolating external values.
- Keep parameter types explicit and narrow. Extend `QueryParam` only when the
  MySQL driver requires another safe value type.
- Treat stored-procedure names and other SQL identifiers as trusted,
  application-owned constants. Values passed to procedures must remain
  parameterized.
- Do not log SQL parameters, connection configuration, credentials, or complete
  database errors when they may contain secrets or customer data.

## Connections and Transactions

- Acquire pooled connections as late as possible and always release them in a
  `finally` block.
- Use `runInTransaction` when multiple writes must succeed atomically. Commit
  only after the callback succeeds and roll back before rethrowing failures.
- Preserve the original error when rollback or connection acquisition fails;
  never convert database failures into successful empty results.
- Keep pool shutdown tied to the NestJS module lifecycle. Do not close the pool
  from individual operations.
- Do not add connection health checks that mutate data or run schema changes.

## Validation

- Unit tests must mock `mysql2/promise`; they must not use a real or shared
  database.
- Cover pool configuration without exposing secret values, parameter forwarding,
  successful transactions, rollback, connection release, and pool shutdown when
  those behaviors change.
- Run the narrowest relevant Jest test first, followed by `pnpm lint` and
  `pnpm build` when applicable.
