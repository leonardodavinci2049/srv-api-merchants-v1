# AGENTS.md

## Purpose

This file defines repository-specific guidance for AI coding agents and automated contributors. Follow it for every change made within this repository.

The project is a private NestJS REST API that sits between frontend applications and affiliate marketplace APIs. It provides a stable internal interface for provider authentication, affiliate-link generation, product discovery, offer retrieval, product feed retrieval (catalog list and feed details), validation, and response normalization.

## Project Status

- Shopee is the only marketplace integration currently implemented.
- AliExpress, Amazon, and Mercado Libre are roadmap items, not active providers.
- Do not document, expose, or test planned providers as if they already work.
- Preserve backward compatibility for existing `/api/shopee-operation/v1/*` consumers unless a breaking change is explicitly requested.

## Technology

- Node.js 20+
- NestJS 11
- TypeScript targeting ES2023 with NodeNext modules
- pnpm 11
- MySQL through `mysql2/promise`
- Zod for environment validation
- `class-validator` and `class-transformer` for request DTOs
- Jest and `@nestjs/testing` for tests
- Biome for formatting, linting, and import organization

## Repository Layout

```text
src/
├── app.main/           # Application bootstrap module and root endpoint
├── core/               # Shared configuration, guards, contracts, and utilities
├── database/           # MySQL pool and low-level database infrastructure
├── db.operation/       # Persistence use cases, queries, DTOs, and result types
├── shopee-api/         # External Shopee API adapter, GraphQL helpers, and mappers
└── shopee-operation/   # Public Shopee controllers and application orchestration
test/                   # End-to-end tests and Jest E2E configuration
pageroot/               # Static content served outside the `/api` prefix
```

Keep provider transport details in the provider API module and business orchestration in the corresponding operation module. Controllers must remain thin.

## Source of Truth

Before changing behavior, inspect the relevant controller, service, DTO, mapper, test, and module registration. Do not infer endpoint behavior from the README alone.

When instructions conflict, use this precedence:

1. The current user request.
2. A more deeply nested `AGENTS.md` file.
3. This file.
4. Existing local patterns in the nearest related code.

## Working Principles

- Make the smallest complete change that solves the requested problem.
- Fix root causes instead of masking symptoms.
- Do not refactor unrelated code while implementing a focused request.
- Preserve public contracts, status codes, payload shapes, and database behavior unless the task requires changing them.
- Prefer explicit, readable code over abstractions created for hypothetical future providers.
- Reuse existing helpers, result models, mappers, and module boundaries before adding new ones.
- Do not edit generated output such as `dist/` or coverage artifacts.
- Do not commit changes or create branches unless explicitly requested.

## Installation and Commands

Use pnpm. Do not replace the package manager or generate npm/yarn lockfiles.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm format
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm test:cov
```

Run targeted tests first, then broader validation when appropriate. For example:

```bash
pnpm test -- shopee-operation.service.spec.ts
pnpm lint
pnpm build
```

Do not run destructive database operations or live provider requests merely to validate a change.

## Code Style

- Follow the checked-in `biome.jsonc`; do not introduce another formatter or linter.
- Use 2-space indentation, single quotes, and trailing commas where Biome applies them.
- Let Biome organize imports.
- Use descriptive names; avoid one-letter identifiers outside conventional short callbacks.
- Use `PascalCase` for classes, DTOs, enums, and types.
- Use `camelCase` for variables, functions, methods, and object properties.
- Follow the naming and file-layout pattern of the nearest feature.
- Use `type` imports when they improve clarity, but note that the Biome rule is intentionally disabled.
- Avoid inline comments that repeat the code. Add comments only for non-obvious constraints or external API behavior.
- Write new code, documentation, identifiers, and developer-facing messages in English.
- Do not translate existing public response messages as part of an unrelated change; that may break consumers or tests.

## NestJS Conventions

- Register every controller and provider in the appropriate feature module.
- Use constructor injection rather than manually instantiating services.
- Keep controllers limited to HTTP concerns, DTO handling, and response delegation.
- Keep provider HTTP/GraphQL calls in `*-api` services.
- Keep multi-step workflows and persistence coordination in `*-operation` services.
- Use NestJS exceptions for HTTP-relevant failures instead of returning raw errors.
- Do not swallow errors. Preserve useful context while preventing secret leakage.
- Respect the global `/api` prefix configured in `src/main.ts`.
- Protected endpoints must continue using the existing API-key guard unless authentication is intentionally redesigned.

## DTOs and API Contracts

- Define request payloads with dedicated DTO classes.
- Validate all externally supplied fields with `class-validator`.
- Use `class-transformer` only where conversion is intentional and safe.
- Remember that the global validation pipe strips unknown fields and rejects non-whitelisted properties.
- Set explicit bounds for pagination and other user-controlled numeric inputs.
- Keep provider-specific credentials and fields out of provider-neutral contracts when adding shared abstractions.
- Update the README and tests whenever endpoints, authentication, required variables, or payload contracts change.

## Marketplace Integrations

For a new provider, prefer the established split:

1. A provider API module for remote communication, signing, provider errors, and raw response mapping.
2. A provider operation module for REST endpoints and application workflows.
3. DTOs for validated public inputs.
4. Interfaces or response DTOs for stable public outputs.
5. Unit tests that mock the remote provider and database boundaries.

Normalize data at the adapter boundary. Do not leak raw provider responses into public endpoints unless explicitly required.

Account for provider timeouts, malformed responses, authentication failures, throttling, empty result sets, and partial data. Never silently convert provider failures into successful empty responses.

## Database Changes

- Use parameterized queries or prepared statements for all user-controlled values.
- Keep low-level connection concerns in `src/database/` and application persistence operations in `src/db.operation/`.
- Use transactions when a workflow must update multiple records atomically.
- Release acquired connections in a `finally` block.
- Preserve stored-procedure contracts and result processing unless a coordinated database migration is part of the task.
- Never run schema changes against an unknown or shared database environment.
- Document any required migration or stored-procedure deployment steps.

## Configuration and Secrets

- Use `src/core/config/envs.ts` as the validated configuration source.
- Add every required environment variable to the Zod schema, exported `envs` object, and `.env.sample`.
- Keep `.env.sample` populated with safe placeholders only.
- Never read, print, expose, or commit real values from `.env`.
- Never hard-code API keys, affiliate credentials, database passwords, tokens, or customer data.
- Avoid logging complete request bodies because they may contain provider credentials.
- Use a secrets manager rather than plain environment files in production deployments.

## Security

- Treat all external input and provider output as untrusted.
- Preserve API-key checks on protected routes.
- Do not weaken validation, CORS, throttling, or authentication without explicit justification.
- Do not include secrets in exceptions, logs, fixtures, snapshots, examples, or documentation.
- Validate URLs before following redirects or making outbound requests.
- Consider SSRF, injection, replay, and credential-exposure risks when changing outbound requests or persistence logic.
- Report security-sensitive findings clearly and avoid broad unrelated remediation.

## Testing

> **Temporary project policy:** Do not create, restore, or modify unit or end-to-end tests during the current development phase unless the user explicitly requests it. Use non-test validation such as linting and builds when appropriate. This policy overrides the testing guidance below while it remains in this file.

- Add or update tests for every behavior change when an adjacent test pattern exists.
- Keep unit tests deterministic and independent of network access, real credentials, wall-clock timing, and shared databases.
- Mock `ShopeeApiService`, `DbOperationService`, and other external boundaries in service tests.
- Test successful flows, validation failures, provider failures, persistence failures, and important edge cases.
- Use Nest's testing utilities for dependency-injected classes.
- Place unit tests next to source files using `*.spec.ts`.
- Place end-to-end tests under `test/` using `*.e2e-spec.ts`.
- Do not reduce assertions or skip tests solely to make a failing suite pass.

## Documentation

- Keep `README.md` accurate for setup, scripts, environment variables, endpoints, and provider status.
- Use English for repository documentation.
- Mark planned functionality clearly as planned.
- Use placeholder credentials in all examples.
- Do not claim that tests, integrations, or deployments were verified unless they were actually run.

## Git Hygiene

- Review `git status` before and after editing.
- Preserve pre-existing user changes and do not overwrite unrelated modifications.
- Keep diffs focused; avoid formatting untouched files.
- Never add `.env`, build output, logs, coverage, IDE files, or dependency directories.
- Use conventional, descriptive commit messages only if the user explicitly asks for a commit.

## Definition of Done

A change is complete when:

- The requested behavior is implemented at the correct architectural layer.
- Public contracts and security controls are preserved or intentionally updated.
- Relevant tests are added or updated and pass.
- `pnpm lint` and `pnpm build` pass when applicable.
- Documentation and `.env.sample` reflect configuration or API changes.
- No secrets, generated files, or unrelated edits are included.
- The final response states what changed, what was validated, and any remaining limitations.
