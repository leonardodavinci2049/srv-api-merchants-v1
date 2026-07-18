# Database Operation Guidance

## Scope

These instructions apply to `src/db.operation/` and supplement the repository
root `AGENTS.md`.

This directory owns application-facing persistence operations, stored-procedure
calls, persistence DTOs, SQL definitions, result processing, and database result
types. Pool and connection lifecycle concerns remain in `src/database/`.

## Structure and Responsibilities

- Keep orchestration in `DbOperationService`, SQL or stored-procedure definitions
  in `query/`, validated inputs in `dto/`, and MySQL result shapes in `types/`.
- Register and export persistence services through `DbOperationModule`; inject
  `DatabaseService` rather than constructing it manually.
- Keep controllers, provider HTTP calls, Shopee signing, and public response
  mapping outside this directory.
- Reuse `ResultModel`, `resultQueryData`, and the existing procedure-result
  processors when their contracts match. Do not introduce a parallel result
  convention for a single operation.

## SQL and Stored Procedures

- Parameterize every externally influenced value with `?` placeholders and pass
  the values separately to `DatabaseService.selectExecute` or the appropriate
  execution method.
- Do not introduce new template-literal SQL containing DTO values. When touching
  an existing interpolated query, migrate the affected values to placeholders if
  that can be done without changing the stored-procedure contract.
- Treat procedure names and SQL identifiers as application-owned constants, not
  caller input.
- Preserve stored-procedure names, argument order, default semantics, result-set
  order, and feedback/status interpretation unless a coordinated database change
  is explicitly requested.
- Do not run procedures against a live database for routine validation.

## DTOs and Result Types

- Validate externally supplied fields with `class-validator`, including explicit
  numeric bounds for identifiers, pagination, and limits.
- Keep DTO property names aligned with the established stored-procedure contract;
  renaming them can break callers and query builders.
- Do not silently substitute one identifier for another. In particular,
  `CONFIG_ID` must come from the caller while `PROJECT_ID` remains the explicit
  internal Shopee project scope.
- Model each returned result set in its actual MySQL order and extend
  `RowDataPacket` where required by `mysql2`.
- Distinguish not-found outcomes from execution failures. Preserve
  `CONFIG_LOOKUP_STATUS` semantics and any existing internal status codes unless
  the task explicitly changes the public error mapping.
- Result types may include credential fields because they mirror stored
  procedures, but those values must never be logged, documented with real data,
  or returned through unrelated public contracts.

## Error Handling and Tests

- Catch errors only where they are translated into the established result model
  or where useful context is added. Never report a failed query as a successful
  empty result.
- Keep error messages useful but free of SQL parameters, credentials, tokens, and
  customer data.
- Unit-test `DbOperationService` with a mocked `DatabaseService`. Assert SQL
  parameter order, result-set processing, not-found behavior, and execution
  failure behavior.
- Test query builders or constants directly when their placeholder order or
  default-value behavior changes.
- Run the narrowest relevant Jest test first, followed by `pnpm lint` and
  `pnpm build` when applicable.
