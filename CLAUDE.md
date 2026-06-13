# CRM Project — Claude Code Context

## Stack
- Backend: Java 21, Spring Boot 3.x, Spring Security 6, Spring Data JPA
- Frontend: Angular 17+ (standalone components), Angular Material, NgRx
- Database: PostgreSQL 16, Flyway for migrations
- Build: Maven (backend), Angular CLI (frontend)
- Testing: JUnit 5 + Mockito + Testcontainers (BE), Jasmine + Cypress (FE)

## Repo layout
crm/
  backend/   → Spring Boot app (com.crm base package)
  frontend/  → Angular app
  docs/      → Architecture and spec docs (reference with @docs/filename.md)
  docker-compose.yml

## Backend conventions
- Controllers in com.crm.controller — annotated @RestController, thin (no logic)
- Service layer in com.crm.service — all business logic here
- Repositories in com.crm.repository — Spring Data JPA interfaces only
- DTOs in com.crm.dto — separate Request/Response DTOs per entity
- MapStruct mappers in com.crm.mapper — never map manually in controllers
- Entities use Lombok (@Data/@Builder), JPA annotations, no business logic
- All service methods require orgId from SecurityContext — never trust user input for orgId
- @Transactional on service write methods
- Global exception handler in com.crm.exception.GlobalExceptionHandler

## Frontend conventions
- Standalone components only (no NgModules for features)
- All HTTP calls through services in src/app/core/services/
- NgRx: actions → effects → reducers → selectors — no direct store.dispatch in components
- Use Angular Material components — no custom CSS for layout
- Reactive forms (not template-driven)
- All forms use validators from src/app/shared/validators/
- Lazy-loaded routes for each feature module

## Commands
### Backend
- cd backend && mvn spring-boot:run     # start dev server (port 8080)
- cd backend && mvn test                # run all tests
- cd backend && mvn verify              # tests + integration tests
- cd backend && mvn clean package       # build jar

### Frontend
- cd frontend && ng serve               # start dev server (port 4200)
- cd frontend && ng test                # run unit tests
- cd frontend && npx cypress open       # run E2E tests
- cd frontend && ng build --configuration production

### Database
- docker-compose up -d postgres         # start local Postgres
- Flyway runs automatically on app start

## Environment
- backend/src/main/resources/application.yml — main config
- backend/src/main/resources/application-dev.yml — dev overrides
- frontend/src/environments/environment.ts — Angular env config
- Never commit secrets — use application-local.yml (gitignored)

## What NOT to touch
- db/migration/*.sql — never edit existing migrations, only add new ones
- SecurityConfig.java — ask before modifying security filter chain
- Entity @Id generation strategy — established in V1 migration

## Code style
- No field injection (@Autowired on fields) — constructor injection only
- No Optional.get() without isPresent() check
- Use ResourceNotFoundException (extends RuntimeException) for 404s
- DTOs always validated with @Valid in controller method params
- Return ResponseEntity<ApiResponse<T>> from all controllers
