# Architecture

## Multi-tenancy
Every entity has orgId. A JPA @EntityListener or Spring Security context
automatically filters by the current user's orgId in all service methods.
No cross-org data access is possible.

## Auth flow
1. POST /api/auth/login → returns { accessToken, refreshToken }
2. Angular stores accessToken in memory, refreshToken in httpOnly cookie
3. HttpInterceptor attaches Bearer token to every API request
4. Spring JwtAuthFilter validates token on every request
5. SecurityContext holds CustomUserDetails { userId, orgId, role }

## DTO pattern
Entity → MapStruct Mapper → DTO (never expose entities directly).
Request DTOs have Bean Validation annotations.
Response DTOs are flat — no circular references.

## Exception handling
@RestControllerAdvice catches all exceptions and returns:
{ error: { code, message, fieldErrors[] } }

## Database
Flyway manages all migrations in src/main/resources/db/migration/
Naming: V{version}__{description}.sql  e.g. V1__init_schema.sql

## Frontend state
NgRx store slice per feature (contacts, deals, tasks, auth).
Effects handle all HTTP calls via Angular services.
Selectors used in all components — no direct store access.
