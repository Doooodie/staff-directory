# Backend Functional Requirements
## Staff Directory — NestJS + PostgreSQL + Docker

---

## 1. Project overview

The backend is a REST API that manages a company's employee directory. It is the **primary deliverable** of this project and must be fully functional and testable via Swagger UI or Postman before any frontend work begins.

**Tech stack:** NestJS · TypeORM · PostgreSQL · Passport.js · JWT · class-validator · class-transformer · @nestjs/swagger · Docker Compose

---

## 2. Infrastructure

### 2.1 Docker Compose

The file `docker-compose.yml` must define the following services:

| Service | Image | Purpose |
|---|---|---|
| `postgres` | `postgres:15-alpine` | Primary database |
| `pgadmin` *(optional)* | `dpage/pgadmin4` | DB GUI for debugging |

**Requirements:**
- The `postgres` service must have a named volume (e.g. `pgdata`) to persist data across container restarts.
- A healthcheck must be defined on the `postgres` service:
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
    interval: 5s
    timeout: 5s
    retries: 5
  ```
- The NestJS app service (if added as a bonus) must use `depends_on: condition: service_healthy` to wait for Postgres.

### 2.2 Environment variables

A `.env.example` file must be committed to the repo with the following keys:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=staff_directory
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
```

Rules:
- `.env` must be added to `.gitignore`.
- All variables must be read through NestJS `ConfigModule` (`@nestjs/config`) — never hardcoded.
- `TypeOrmModule.forRootAsync()` must use `ConfigService` to build the database configuration at runtime.

### 2.3 Database configuration

```typescript
// synchronize must be false in all environments
synchronize: false,
// migrations run explicitly via npm run migration:run
migrationsRun: false,
```

---

## 3. Data models

### 3.1 User

Stores authentication credentials. Not exposed directly in the employee directory.

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, generated automatically |
| `email` | `varchar(255)` | UNIQUE, NOT NULL |
| `password` | `varchar(255)` | NOT NULL — bcrypt hash, never plain text |
| `role` | `enum('USER','ADMIN')` | NOT NULL, DEFAULT `'USER'` |
| `createdAt` | `timestamptz` | NOT NULL, auto-set on insert |
| `updatedAt` | `timestamptz` | NOT NULL, auto-updated |

### 3.2 Department

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, generated automatically |
| `name` | `varchar(100)` | UNIQUE, NOT NULL |
| `description` | `text` | nullable |
| `createdAt` | `timestamptz` | NOT NULL, auto-set |
| `updatedAt` | `timestamptz` | NOT NULL, auto-updated |

**Relations:**
- One Department → many Employees (`@OneToMany` on Department side)

### 3.3 Role

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, generated automatically |
| `title` | `varchar(100)` | UNIQUE, NOT NULL |
| `level` | `enum('JUNIOR','MID','SENIOR','LEAD','MANAGER')` | NOT NULL |
| `createdAt` | `timestamptz` | NOT NULL, auto-set |
| `updatedAt` | `timestamptz` | NOT NULL, auto-updated |

**Relations:**
- One Role → many Employees (`@OneToMany` on Role side)

### 3.4 Employee

The core entity of the application.

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | PK, generated automatically |
| `firstName` | `varchar(100)` | NOT NULL |
| `lastName` | `varchar(100)` | NOT NULL |
| `email` | `varchar(255)` | UNIQUE, NOT NULL |
| `hireDate` | `date` | NOT NULL |
| `salary` | `decimal(12,2)` | NOT NULL, must be > 0 |
| `isActive` | `boolean` | NOT NULL, DEFAULT `true` |
| `departmentId` | `uuid` (FK) | NOT NULL, references `department.id` |
| `roleId` | `uuid` (FK) | NOT NULL, references `role.id` |
| `createdAt` | `timestamptz` | NOT NULL, auto-set |
| `updatedAt` | `timestamptz` | NOT NULL, auto-updated |

**Relations:**
- Employee `@ManyToOne` → Department
- Employee `@ManyToOne` → Role

**Deletion strategy:** Employees are **never hard-deleted**. When a DELETE request is received, `isActive` is set to `false`. The row remains in the database.

---

## 4. API endpoints

### 4.1 Auth — `/auth`

No authentication required on these routes.

#### `POST /auth/register`

Creates a new user account.

**Request body:**
```json
{
  "email": "admin@company.com",
  "password": "StrongPass123!",
  "role": "ADMIN"
}
```

**Validation:**
- `email` — required, must be a valid email format
- `password` — required, min length 8, must contain at least one letter and one number
- `role` — optional, enum `USER | ADMIN`, defaults to `USER`

**Responses:**
- `201 Created` — returns the created user object **without** the `password` field
- `409 Conflict` — if the email is already registered
- `400 Bad Request` — validation errors

#### `POST /auth/login`

Authenticates a user and returns a JWT.

**Request body:**
```json
{
  "email": "admin@company.com",
  "password": "StrongPass123!"
}
```

**Validation:**
- `email` — required, valid email
- `password` — required, non-empty string

**Responses:**
- `200 OK` — `{ accessToken: string, user: { id, email, role } }`
- `401 Unauthorized` — invalid credentials

---

### 4.2 Employees — `/employees`

All routes require a valid JWT (`Authorization: Bearer <token>`).

#### `GET /employees`

Returns a paginated list of employees.

**Query parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `page` | number | no | Page number, default `1` |
| `limit` | number | no | Items per page, default `20`, max `100` |
| `search` | string | no | Partial match on `firstName`, `lastName`, or `email` (case-insensitive) |
| `departmentId` | uuid | no | Filter by department |
| `roleId` | uuid | no | Filter by role |
| `isActive` | boolean | no | Filter by active status, default returns all |

**Response `200 OK`:**
```json
{
  "data": [ /* Employee[] with department and role nested */ ],
  "total": 87,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

Each employee in `data` must include nested `department` (id, name) and `role` (id, title, level) objects — not just their IDs.

#### `GET /employees/stats`

Returns aggregate statistics. Must be defined **before** `GET /employees/:id` in the controller to avoid routing conflicts.

**Response `200 OK`:**
```json
{
  "total": 87,
  "active": 75,
  "inactive": 12,
  "byDepartment": [
    {
      "departmentId": "uuid",
      "departmentName": "Engineering",
      "count": 30,
      "activeCount": 27,
      "averageSalary": 5200.00
    }
  ]
}
```

#### `GET /employees/:id`

Returns a single employee with nested department and role.

**Responses:**
- `200 OK` — full employee object
- `404 Not Found` — employee does not exist

#### `POST /employees`

Creates a new employee.

**Request body:**
```json
{
  "firstName": "Anna",
  "lastName": "Kowalski",
  "email": "anna.kowalski@company.com",
  "hireDate": "2024-03-15",
  "salary": 4800.00,
  "departmentId": "uuid",
  "roleId": "uuid"
}
```

**Validation:**

| Field | Rules |
|---|---|
| `firstName` | required, string, 1–100 chars, no leading/trailing whitespace |
| `lastName` | required, string, 1–100 chars, no leading/trailing whitespace |
| `email` | required, valid email, must be unique across all employees |
| `hireDate` | required, valid ISO date string (`YYYY-MM-DD`), must not be in the future |
| `salary` | required, positive number, min `0.01`, max `999999.99` |
| `departmentId` | required, valid UUID, must reference an existing department |
| `roleId` | required, valid UUID, must reference an existing role |

**Responses:**
- `201 Created` — full employee object with nested relations
- `409 Conflict` — email already exists
- `404 Not Found` — departmentId or roleId not found
- `400 Bad Request` — validation errors

#### `PATCH /employees/:id`

Partially updates an employee. All fields are optional — only send what changes.

**Request body:** same fields as `POST`, all optional.

**Responses:**
- `200 OK` — updated employee object
- `404 Not Found`
- `409 Conflict` — new email already in use by another employee
- `400 Bad Request`

#### `DELETE /employees/:id`

Soft-deletes an employee by setting `isActive = false`.

**Responses:**
- `200 OK` — `{ message: "Employee deactivated successfully", id: "uuid" }`
- `404 Not Found`

---

### 4.3 Departments — `/departments`

All routes require JWT.

#### `GET /departments`

Returns all departments with the count of active employees.

**Response `200 OK`:**
```json
[
  {
    "id": "uuid",
    "name": "Engineering",
    "description": "Product engineering team",
    "activeEmployeeCount": 27,
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T10:00:00Z"
  }
]
```

#### `GET /departments/:id`

Returns a single department with its employees list.

**Response `200 OK`:** Department object with `employees: Employee[]` (active only by default).

**Responses:** `200 OK` | `404 Not Found`

#### `POST /departments`

**Request body:**
```json
{ "name": "Engineering", "description": "Optional text" }
```

**Validation:**
- `name` — required, string, 1–100 chars, must be unique
- `description` — optional, string, max 500 chars

**Responses:** `201 Created` | `409 Conflict` (name taken) | `400 Bad Request`

#### `PATCH /departments/:id`

Partial update. Same validation as POST.

**Responses:** `200 OK` | `404 Not Found` | `409 Conflict` | `400 Bad Request`

#### `DELETE /departments/:id`

Hard delete. Must fail with `409 Conflict` if the department has any active employees.

---

### 4.4 Roles — `/roles`

All routes require JWT.

#### `GET /roles`

Returns all roles.

#### `GET /roles/:id`

**Responses:** `200 OK` | `404 Not Found`

#### `POST /roles`

**Request body:**
```json
{ "title": "Senior Frontend Developer", "level": "SENIOR" }
```

**Validation:**
- `title` — required, string, 1–100 chars, unique
- `level` — required, enum: `JUNIOR | MID | SENIOR | LEAD | MANAGER`

**Responses:** `201 Created` | `409 Conflict` | `400 Bad Request`

#### `PATCH /roles/:id`

Partial update.

#### `DELETE /roles/:id`

Hard delete. Must fail with `409 Conflict` if any employees currently use this role.

---

## 5. Authentication & authorization

### 5.1 JWT strategy

- Tokens are signed with `JWT_SECRET` from environment, using `HS256` algorithm.
- Token payload: `{ sub: userId, email: string, role: 'USER' | 'ADMIN' }`.
- Token expiry: `JWT_EXPIRES_IN` from environment (default `7d`).
- `JwtAuthGuard` is applied **globally** in `AppModule`.
- Public routes are whitelisted with a `@Public()` custom decorator using `SetMetadata`.

### 5.2 Role-based access (bonus)

If implemented, the following write operations require the `ADMIN` role:

| Method | Route |
|---|---|
| POST / PATCH / DELETE | `/employees/*` |
| POST / PATCH / DELETE | `/departments/*` |
| POST / PATCH / DELETE | `/roles/*` |

`GET` requests are accessible to all authenticated users regardless of role.

---

## 6. Error handling

### 6.1 Global exception filter

A custom `GlobalExceptionFilter` must intercept all unhandled exceptions and return a consistent response shape:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Employee with ID abc123 not found",
  "timestamp": "2024-06-15T14:30:00.000Z",
  "path": "/employees/abc123"
}
```

### 6.2 Validation errors

When `class-validator` rejects input, the response must include field-level error details:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "email must be a valid email address",
    "salary must be a positive number"
  ],
  "timestamp": "2024-06-15T14:30:00.000Z"
}
```

Enable this with the global `ValidationPipe`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

---

## 7. Database migrations & seeding

### 7.1 Migration commands (in `package.json`)

```json
{
  "migration:generate": "typeorm-ts-node-commonjs migration:generate",
  "migration:run": "typeorm-ts-node-commonjs migration:run",
  "migration:revert": "typeorm-ts-node-commonjs migration:revert"
}
```

- Never use `synchronize: true`.
- Every schema change must be captured in a new migration file.
- Migrations must run cleanly on a blank database.

### 7.2 Seed script

The seed script (`src/seed.ts`, run via `npm run seed`) must create:

| Entity | Count | Notes |
|---|---|---|
| Departments | 3 | e.g. Engineering, Marketing, Operations |
| Roles | 5 | One per level: Junior Dev, Mid Dev, Senior Dev, Lead, Manager |
| Users | 2 | One `ADMIN` (admin@company.com / Admin123!), one `USER` |
| Employees | 20 | Realistic names, mix of departments and roles, realistic salaries |

The seed must be **idempotent** — running it twice must not create duplicate records (use `upsert` or check for existing records before inserting).

---

## 8. Swagger documentation

Setup via `@nestjs/swagger` in `main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Staff Directory API')
  .setDescription('HR employee management REST API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
```

**Requirements for each controller:**
- `@ApiTags('employees')` — groups routes in the sidebar
- `@ApiOperation({ summary: '...' })` — describes what the route does
- `@ApiResponse({ status: 200, ... })` — documents all response codes
- `@ApiBearerAuth()` — marks routes that require a JWT

**All DTO properties** must be annotated with `@ApiProperty()` including example values.

Swagger UI must be accessible at `GET /api/docs`.

---

## 9. Testing

### 9.1 Unit tests (required as "nice")

At minimum, one service must have Jest unit tests with a mocked TypeORM repository.

Recommended: `EmployeesService`

Test cases to cover:
- `create()` — success path, returns the created employee
- `create()` — throws `ConflictException` when email already exists
- `findOne()` — throws `NotFoundException` when ID does not exist
- `remove()` — sets `isActive = false` without deleting the row

### 9.2 Running tests

```bash
npm run test          # unit tests
npm run test:cov      # with coverage report
```

---

## 10. Project structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── public.decorator.ts
│   │       └── roles.decorator.ts
│   ├── employees/
│   │   ├── employees.module.ts
│   │   ├── employees.controller.ts
│   │   ├── employees.service.ts
│   │   ├── dto/
│   │   │   ├── create-employee.dto.ts
│   │   │   └── update-employee.dto.ts
│   │   └── entities/
│   │       └── employee.entity.ts
│   ├── departments/
│   │   └── ... (same structure)
│   ├── roles/
│   │   └── ... (same structure)
│   ├── common/
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts
│   │   └── dto/
│   │       └── paginated-response.dto.ts
│   ├── database/
│   │   └── migrations/
│   │       └── 1700000000000-Init.ts
│   ├── seed.ts
│   └── main.ts
├── .env.example
├── docker-compose.yml
├── Dockerfile         (bonus)
└── README.md
```

---

## 11. README requirements

The `README.md` must include:

1. **Tech stack** — brief list of technologies used
2. **Prerequisites** — Node.js version, Docker
3. **Getting started** — exact step-by-step commands:
   ```bash
   git clone ...
   cd backend
   cp .env.example .env
   docker compose up -d
   npm install
   npm run migration:run
   npm run seed
   npm run start:dev
   ```
4. **API documentation** — URL to Swagger (`http://localhost:3000/api/docs`)
5. **Default credentials** — seed admin user email and password
6. **Running tests** — `npm run test`
