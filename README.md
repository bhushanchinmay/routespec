# HighLevel Assignment: Lightweight API Versioning & Metadata (NestJS)

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run

```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

### Test

```bash
# unit
npm test -- --runInBand

# e2e
npm run test:e2e -- --runInBand

# build verification
npm run build
```

## API

### Users

- `GET /v1/users`
- `GET /v2/users`
- `GET /users` with optional `x-api-version: 1 | 2`

### Metadata

- `GET /_internal/routes`

### OpenAPI (Optional, implemented)

- `GET /docs`
- `GET /docs-json`

## Design Decisions

**Separation of Concerns & Architecture**
The architecture is designed strictly around the separation of concerns, heavily inspired by enterprise patterns (similar to Java Spring Boot). The core objective was to keep business logic completely isolated from infrastructure routing.

1. **Request Normalization (Middleware):** I implemented `VersionMiddleware` to act as a localized API Gateway. It resolves URI and header versions, normalizing paths (e.g., `/v1/users` -> `/users`) before they reach the router. This ensures the `UsersController` remains pure and free of versioning logic.
2. **Response Formatting (Interceptor):** Output formatting is handled via a NestJS Interceptor (akin to Spring AOP). This transforms the outgoing payload based on the requested version without mutating the controller methods, keeping the endpoints highly testable.
3. **Dynamic Introspection:** Route metadata is attached via a strongly-typed `@ApiInfo` decorator. Instead of hardcoding the route registry, the `/_internal/routes` endpoint utilizes Nest's `DiscoveryService` and `Reflector` to dynamically scan the Dependency Injection tree at runtime. This guarantees the registry is always accurate and scales automatically as new controllers are added.
