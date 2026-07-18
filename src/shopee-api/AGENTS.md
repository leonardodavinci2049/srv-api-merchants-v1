# Shopee API Adapter Guidance

## Scope

These instructions apply to `src/shopee-api/` and supplement the repository root
`AGENTS.md`.

This directory is the transport and normalization boundary for the implemented
Shopee affiliate integration. It owns GraphQL construction, request signing,
timeouts, provider-error extraction, and mapping raw Shopee responses into stable
internal response contracts.

## Adapter Boundaries

- Keep Shopee HTTP and GraphQL details in `ShopeeApiService`; keep pure response
  normalization in `mappers/` and provider-error parsing in `graphql/`.
- Keep multi-step workflows, configuration lookup, persistence, and REST/HTTP
  controller concerns in `src/shopee-operation/`.
- Do not add AliExpress, Amazon, Mercado Libre, or generic speculative provider
  abstractions here. Shopee is the only active provider.
- Register and export the adapter through `ShopeeApiModule`; inject it into
  consumers rather than constructing it manually.

## Requests, Signing, and Security

- Preserve Shopee's signature input order:
  `credential + Unix timestamp + JSON payload + secret key`, hashed with SHA-256.
- Build authorization headers only at request time. Never log or expose the
  credential, secret key, signature input, authorization header, or full config.
- Use the selected `ShopeeConfiguration` for endpoint, timeout, credentials, and
  affiliate sub-IDs. Do not fall back to hidden global credentials.
- Validate outbound endpoints and user-influenced URLs according to their role;
  reject unsupported protocols and unsafe destinations rather than following
  arbitrary redirects.
- Escape GraphQL string values safely, using `JSON.stringify` or an equivalent
  proven serializer. Do not interpolate raw external strings into a query.
- Keep requests bounded by the configured timeout. Treat network errors,
  malformed payloads, GraphQL `errors`, and provider `errMsg` values as failures.

## Mapping and Error Contracts

- Normalize provider data at this boundary. Do not leak raw Shopee payloads into
  operation services or public controllers.
- Keep mappers deterministic and side-effect free. Provider values are
  authoritative when present; configuration-derived values may be used only as
  explicit fallbacks.
- Preserve public field names, scalar conversions, pagination defaults, and
  success/error shapes unless a contract change is explicitly requested.
- Do not silently turn a provider failure or malformed response into a successful
  empty result.
- Translate transport and provider failures into `BadGatewayException` with
  useful operation context and a sanitized message.

## Tests

- Mock Axios and all external boundaries. Unit tests must never call Shopee or
  depend on real credentials, network access, or wall-clock timing.
- When signing behavior changes, control the timestamp and assert the exact hash
  inputs without snapshotting secrets.
- Cover successful responses, GraphQL errors, provider error fields, timeouts,
  malformed responses, missing required data, sub-ID normalization, mapper
  fallbacks, and pagination behavior as relevant to the change.
- Add focused mapper tests for normalization changes and service tests for
  transport/signing changes.
- Run `pnpm test -- shopee-api.service.spec.ts` (and any new focused mapper test),
  then `pnpm lint` and `pnpm build` when applicable.
