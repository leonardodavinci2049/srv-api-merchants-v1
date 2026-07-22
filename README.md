# Merchants Affiliate API

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

A REST API that provides a single integration layer for affiliate product services from multiple marketplaces.

Instead of requiring frontend applications to understand and connect to each merchant's API independently, this service centralizes authentication, request validation, affiliate-link generation, product discovery, offer retrieval, and response normalization behind one consistent interface.

## Why This Project Exists

Affiliate platforms expose different APIs, authentication methods, request formats, and response structures. That creates unnecessary coupling and duplicated integration logic across client applications.

Merchants Affiliate API acts as an intermediary between those platforms and the frontend applications that consume their data:

```mermaid
flowchart LR
    A[Frontend Applications] --> B[Merchants Affiliate API]
    B --> C[Shopee Affiliate API]
    B --> D[AliExpress Affiliate API]
    B -. planned .-> E[Amazon Associates API]
    B -. planned .-> F[Mercado Libre Affiliate API]
    B --> G[(MySQL)]
```

This architecture gives client applications:

- One stable REST interface for multiple affiliate providers.
- Less provider-specific logic and fewer credentials in frontend codebases.
- Centralized validation, security, rate limiting, and error handling.
- A foundation for normalized product and offer data across marketplaces.
- Easier adoption of new providers without redesigning every client.

## Integration Status

| Provider | Status | Current Scope |
| --- | --- | --- |
| Shopee | In progress | Affiliate links, product offers, platform offers, and product feed retrieval |
| AliExpress | Available | Category retrieval, product search, product details, SKU details, and affiliate-link generation |
| Amazon | Planned | Not yet implemented |
| Mercado Libre | Planned | Not yet implemented |

> Shopee and AliExpress are the only providers with active integrations. Amazon and Mercado Libre are part of the project roadmap and should not be considered available yet.

## Features

- REST endpoints built with NestJS and TypeScript.
- Shopee affiliate-link generation.
- Shopee product and campaign offer retrieval.
- Shopee product feed retrieval (catalog list via `listItemFeeds` and details via `getItemFeedData`).
- AliExpress affiliate category retrieval, product search, product details, SKU details, and affiliate-link generation.
- DTO-based payload validation and transformation.
- API-key authentication for protected routes.
- Global request throttling.
- MySQL persistence for generated links and related configuration.
- Environment validation with Zod.
- Unit and end-to-end test support with Jest.
- Code formatting and static analysis with Biome.

## Tech Stack

- [Node.js](https://nodejs.org/)
- [NestJS](https://nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [MySQL](https://www.mysql.com/)
- [pnpm](https://pnpm.io/)
- [Jest](https://jestjs.io/)
- [Biome](https://biomejs.dev/)

## Getting Started

### Prerequisites

- Node.js 20 or later.
- pnpm 11 or later.
- A running MySQL instance.
- Valid credentials for any affiliate provider you want to use.

### Installation

```bash
git clone <repository-url>
cd srv-api-merchants-v1
pnpm install
```

Create your local environment file:

```bash
cp .env.sample .env
```

Update `.env` with your application, database, and provider settings. Never commit real credentials or API keys.

### Run the Application

```bash
# Development with file watching
pnpm dev

# Standard local execution
pnpm start

# Production build and execution
pnpm build
pnpm start:prod
```

By default, the API is available at `http://localhost:3000/api`.

## Environment Variables

The complete template is available in [`.env.sample`](.env.sample).

| Variable | Description |
| --- | --- |
| `APP_API_URL` | Public base URL used by the application |
| `APP_JWT_SECRET` | Secret reserved for token-related operations |
| `APP_PORT` | HTTP server port |
| `API_KEY` | API key required by protected endpoints |
| `DATABASE_HOST` | MySQL server hostname |
| `DATABASE_PORT` | MySQL server port |
| `DATABASE_NAME` | MySQL database name |
| `DATABASE_USER` | MySQL username |
| `DATABASE_PASSWORD` | MySQL password |
| `ALIEXPRESS_SERVER_URL` | HTTPS production gateway used for outbound AliExpress requests |
| `ALIEXPRESS_APP_KEY` | AliExpress production application key |
| `ALIEXPRESS_APP_SECRET` | AliExpress production application secret |
| `ALIEXPRESS_SANDBOX_URL` | AliExpress sandbox gateway (validated and exported, never selected at runtime) |
| `ALIEXPRESS_SANDBOX_APP_KEY` | AliExpress sandbox application key (validated and exported, never selected at runtime) |
| `ALIEXPRESS_SANDBOX_APP_SECRET` | AliExpress sandbox application secret (validated and exported, never selected at runtime) |
| `ALIEXPRESS_TRACKING_ID` | Default AliExpress tracking ID applied only where the operation documents it as optional |

The application also accepts the `DB_MYSQL_*` naming convention as an alternative to the documented `DATABASE_*` variables.

> All Shopee runtime configuration (credentials, endpoint, timeout, sub-IDs, pagination/sort defaults, and link persistence fields) is loaded exclusively from `tbl_config` via `sp_config_select_id_v1`, selected by the caller-provided `configId` on each request. Shopee settings are no longer read from environment variables.

> AliExpress is the only selectable runtime environment for outbound requests. The production gateway (`ALIEXPRESS_SERVER_URL`) is always used; sandbox variables are part of the configuration contract but no runtime request may select the sandbox environment. Outbound requests are bounded by a 30-second timeout, sent as `application/x-www-form-urlencoded`, and signed with the documented HMAC-SHA256 algorithm.

## API Overview

All API routes use the `/api` global prefix.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/api` | Public | Basic service response |
| `GET` | `/api/shopee-operation` | Public | Shopee module status and metadata |
| `POST` | `/api/shopee-operation/v1/generate-affiliate-link` | API key | Generates an affiliate link from a Shopee product URL |
| `POST` | `/api/shopee-operation/v1/get-product-offers` | API key | Searches Shopee product offers |
| `POST` | `/api/shopee-operation/v1/get-shopee-offers` | API key | Retrieves Shopee platform offers |
| `POST` | `/api/shopee-operation/v1/list-item-feeds` | API key | Lists Shopee product feeds (`FULL` or `DELTA`) |
| `POST` | `/api/shopee-operation/v1/item-feed-data` | API key | Retrieves the rows of a specific Shopee product feed |
| `POST` | `/api/aliexpress-operation/v1/get-categories` | API key | Retrieves AliExpress affiliate categories |
| `POST` | `/api/aliexpress-operation/v1/search-products` | API key | Searches AliExpress affiliate products |
| `POST` | `/api/aliexpress-operation/v1/get-product-details` | API key | Retrieves AliExpress product details |
| `POST` | `/api/aliexpress-operation/v1/get-product-sku-details` | API key | Retrieves AliExpress product SKU details |
| `POST` | `/api/aliexpress-operation/v1/generate-affiliate-links` | API key | Generates AliExpress affiliate links |

### Authentication

Protected endpoints accept the configured `API_KEY` through either header:

```http
Authorization: Bearer your-api-key
```

or:

```http
x-api-key: your-api-key
```

### Example Request

```bash
curl --request POST \
  --url http://localhost:3000/api/shopee-operation/v1/get-product-offers \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: your-api-key' \
  --data '{
    "configId": 1,
    "keyword": "wireless headphones",
    "page": 1,
    "limit": 10
  }'
```

Request payloads are strictly validated. Unknown fields (including Shopee credentials or `clientId`) are rejected, and eligible values are converted to their declared DTO types when possible. Each Shopee operation requires a positive integer `configId` that selects the exact `tbl_config` record used for credentials, endpoint, timeout, sub-IDs, defaults, and link persistence.

### AliExpress Operations

AliExpress endpoints accept the documented `snake_case` field names directly in the request body. Defaults documented by AliExpress are applied only where the operation marks the field as optional; explicit caller values always override them.

| Endpoint | Optional defaults applied |
| --- | --- |
| `/api/aliexpress-operation/v1/get-categories` | none |
| `/api/aliexpress-operation/v1/search-products` | `target_currency=USD`, `target_language=EN`, `tracking_id=$ALIEXPRESS_TRACKING_ID` |
| `/api/aliexpress-operation/v1/get-product-details` | `target_currency=USD`, `target_language=EN`, `tracking_id=$ALIEXPRESS_TRACKING_ID` |
| `/api/aliexpress-operation/v1/get-product-sku-details` | none (all documented fields required or passed verbatim) |
| `/api/aliexpress-operation/v1/generate-affiliate-links` | none (caller-provided `tracking_id` is required) |

Constrained inputs include:

- `page_no` must be a positive integer and `page_size` must be between 1 and 50.
- Prices are non-negative integers expressed in cents, and `min_sale_price` must not exceed `max_sale_price`.
- Currencies, languages, sort options, `platform_product_type`, and `delivery_days` are restricted to the documented domains.
- Two-letter country codes are enforced where the API documents them.
- `sku_ids` accepts at most 20 entries; `source_values` accepts at most 50 entries.
- `promotion_link_type` must be `0` (normal) or `2` (hot link).
- Each `source_values` entry must be a URL on an allowed AliExpress host (`aliexpress.com`, `www.aliexpress.com`, `best.aliexpress.com`, `m.aliexpress.com`, `ae.aliexpress.com`, `s.click.aliexpress.com`). The validator never follows redirects or resolves short URLs.

Successful responses use the stable envelope `{ success: true, data: ... }`. The object inside `data` keeps the original AliExpress `snake_case` field names, such as `resp_code`, `current_record_count`, `product_id`, `ae_item_info`, and `promotion_links`. Expected operation failures return `{ success: false, error, message }`. Transport failures, malformed responses, validation errors, and authentication failures surface through NestJS exceptions: `400 Bad Request` for invalid input, `401 Unauthorized` when the API key is missing or invalid, `502 Bad Gateway` for rejected or malformed AliExpress responses, and `503 Service Unavailable` for timeouts or unreachable networks. Affiliate-link generation does not enrich products or persist records in the current implementation.

```bash
curl --request POST \
  --url http://localhost:3000/api/aliexpress-operation/v1/search-products \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: your-api-key' \
  --data '{
    "keywords": "wireless headphones",
    "page_no": 1,
    "page_size": 20,
    "target_currency": "USD",
    "target_language": "EN"
  }'
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the development server in watch mode |
| `pnpm start` | Starts the application |
| `pnpm start:debug` | Starts the application in debug and watch mode |
| `pnpm build` | Compiles the application into `dist/` |
| `pnpm start:prod` | Runs the compiled production build |
| `pnpm test` | Runs unit tests |
| `pnpm test:watch` | Runs unit tests in watch mode |
| `pnpm test:e2e` | Runs end-to-end tests |
| `pnpm test:cov` | Generates the test coverage report |
| `pnpm lint` | Checks the codebase with Biome |
| `pnpm lint:fix` | Applies safe Biome fixes |
| `pnpm format` | Formats the codebase with Biome |

## Project Structure

```text
src/
├── app.main/             # Root application module and base controller
├── core/                 # Configuration, guards, shared interfaces, and utilities
├── database/             # MySQL connection and database infrastructure
├── db.operation/         # Persistence operations and queries
├── shopee-api/           # Shopee API client, GraphQL utilities, and mappers
├── shopee-operation/     # Shopee REST endpoints and application services
├── aliexpress-api/       # AliExpress adapter, signature helpers, and error parsing
└── aliexpress-operation/ # AliExpress REST endpoints and application services
```

New merchant integrations should follow the same separation between provider communication and public REST operations.

## Development Workflow

Before opening a pull request, run:

```bash
pnpm lint
pnpm test
pnpm build
```

Keep changes focused, add or update tests for changed behavior, and never include provider credentials, customer data, or local `.env` files in commits.

## Roadmap

- Stabilize and expand the Shopee integration.
- Expand the AliExpress integration (additional affiliate operations, persistence, enrichment).
- Introduce a provider-neutral product and offer contract.
- Add Amazon Associates services.
- Add Mercado Libre affiliate services.
- Add generated API documentation with OpenAPI/Swagger.
- Improve observability, integration tests, and deployment automation.

## Security

- Store all secrets in environment variables or a dedicated secrets manager.
- Use unique, strong API keys for each environment.
- Rotate keys and provider credentials regularly.
- Do not expose affiliate credentials in frontend applications.
- Report suspected vulnerabilities privately to the repository maintainers instead of creating a public issue.

## Contributing

This is currently a private project. If you have repository access, create a focused branch, follow the existing coding conventions, validate your changes, and submit a pull request with a clear description and testing notes.

## License

This repository is proprietary and currently marked as `UNLICENSED`. No permission is granted to use, copy, modify, or distribute the source code without explicit authorization from the repository owner.
