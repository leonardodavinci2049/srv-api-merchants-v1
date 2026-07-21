# Database Operation Guidance

## Scope

These instructions apply to `src/db.operation/` and supplement the repository
root `AGENTS.md`.

This directory owns application-facing persistence operations: direct
parameterized SQL against application tables, the remaining stored-procedure
calls, persistence DTOs, query builders and SQL constants, result processing,
and database result types. Pool and connection lifecycle concerns remain in
`src/database/`.

## Structure and Responsibilities

- Keep orchestration in `DbOperationService`, SQL strings and query builders in
  `query/`, validated inputs in `dto/`, MySQL result shapes in `types/`, and
  persistence entities (if needed) in `entities/`.
- Register and export persistence services through `DbOperationModule`; inject
  `DatabaseService` rather than constructing it manually.
- Keep controllers, provider HTTP calls, Shopee signing, and public response
  mapping outside this directory.
- Reuse `ResultModel`, `resultQueryData`, and the existing result processors
  (`processProcedureResultMultiQuery`) when their contracts match. Do not
  introduce a parallel result convention for a single operation.

## SQL: Direct Queries versus Stored Procedures

The module is mid-migration: new work uses direct parameterized SQL against
application tables; two find-all operations still call stored procedures.

- Parameterize every externally influenced value with `?` placeholders and pass
  the values separately to `DatabaseService.selectExecute` (for `SELECT`) or
  `DatabaseService.ModifyExecute` (for `INSERT`/`UPDATE`/`DELETE`, which returns
  a `ResultSetHeader`).
- Define each direct query as an exported `*_QUERY` string constant in
  `query/*.query.ts`. Do not keep `.sql` procedure-definition files in this
  directory; SQL lives in `.query.ts` only.
- For `INSERT` queries with defaultable columns, prefer
  `COALESCE(?, default)` in the SQL (e.g. `COALESCE(?, 0)`,
  `COALESCE(?, 'BRL')`) and emit `null` from the params builder so the database
  applies the default. Use `CURRENT_TIMESTAMP()` for created/updated columns
  rather than passing timestamps from the caller.
- Co-locate a params-array builder (e.g. `LinkGenerationCreateV2Params`) with the
  query constant when the column/placeholder order is non-trivial. The builder
  must return values in the exact placeholder order; keep the column list,
  placeholder list, and params array length in sync.
- Do not introduce new template-literal SQL interpolating DTO values. The
  remaining `call sp_...` builders in `link-generation-find-all-v2.query.ts` and
  `promo-link-find-all_v2.query.ts` are legacy; when touching them, migrate to
  `?` placeholders and a direct query against the underlying table if the
  contract allows, otherwise leave the procedure call intact.
- Treat procedure names, table names, and SQL identifiers as application-owned
  constants, not caller input.
- Preserve stored-procedure names, argument order, default semantics, result-set
  order, and feedback/status interpretation unless a coordinated database change
  is explicitly requested.
- Do not run queries or procedures against a live database for routine
  validation.

## DTOs and Result Types

- Validate externally supplied fields with `class-validator`, including explicit
  numeric bounds for identifiers, pagination, and limits.
- Keep DTO property names aligned with the established contract; renaming them
  can break callers, query builders, and params-array builders.
- Do not silently substitute one identifier for another. In particular,
  `CONFIG_ID` must come from the caller while `PROJECT_ID` remains the explicit
  internal Shopee project scope exported from
  `query/find-config-select-id.query.ts` as `SHOPEE_PROJECT_ID`.
- Model each returned result set in its actual MySQL column order and naming.
  Direct-table interfaces such as `TblConfigShopeeRecord` mirror the table
  columns exactly (camelCase) and extend `RowDataPacket`. Multi-result-set
  stored procedures are modeled as tuples of
  `[rows[], feedback[], SpOperationResult]`.
- For `INSERT`/`UPDATE`/`DELETE`, consume `ResultSetHeader` from `mysql2` and
  read `insertId`/`affectedRows`; do not invent a row shape for write operations.
- Distinguish not-found outcomes from execution failures. Preserve
  `CONFIG_LOOKUP_STATUS` semantics and any existing internal status codes unless
  the task explicitly changes the public error mapping.
- Result types may include credential fields because they mirror tables or
  procedures, but those values must never be logged, documented with real data,
  or returned through unrelated public contracts.

## Error Handling and Tests

- Catch errors only where they are translated into the established result model
  or where useful context is added. Never report a failed query as a successful
  empty result.
- For write operations, treat `insertId === 0` or `affectedRows === 0` as a
  `PROCESSING_FAILED` outcome (response code `100422`), not as success.
- Keep error messages useful but free of SQL parameters, credentials, tokens, and
  customer data.
- Unit-test `DbOperationService` with a mocked `DatabaseService`. For direct
  queries, assert the exact `(QUERY, paramsArray)` call, the parameter order
  (e.g. `[SHOPEE_PROJECT_ID, configId]`), not-found behavior, and execution
  failure behavior.
- For `INSERT` queries with a params builder, add a structural test asserting
  that column count, `?` placeholder count, `CURRENT_TIMESTAMP` count, and the
  params array length stay aligned; also assert the defaults emitted for
  `COALESCE` columns.
- Test query builders or constants directly when their placeholder order or
  default-value behavior changes.
- Run the narrowest relevant Jest test first, followed by `pnpm lint` and
  `pnpm build` when applicable.
