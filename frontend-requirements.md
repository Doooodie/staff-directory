# Frontend Functional Requirements
## Staff Directory — Angular SPA

---

## 1. Project overview

The frontend is an Angular single-page application that provides a UI for the Staff Directory API. It is built **after** the backend is complete and working. The goal is a functional, well-structured application — not a pixel-perfect design.

**Tech stack:** Angular 17+ · Angular Router · ReactiveFormsModule · HttpClient · RxJS · TypeScript (strict mode)

**Key principle:** No `any` types anywhere. Every API response must be typed with a TypeScript interface.

---

## 2. Application structure

### 2.1 Module / routing layout

```
AppModule
├── AuthModule (lazy)       → /login
├── EmployeesModule (lazy)  → /employees, /employees/:id/edit
├── DepartmentsModule (lazy)→ /departments, /departments/:id
├── DashboardModule (lazy)  → / (redirect from root)
└── SharedModule            → common components, pipes, services
```

All feature modules must be **lazy-loaded** via `loadChildren` in the router config.

### 2.2 Route table

| Path | Module | Guard | Page |
|---|---|---|---|
| `/` | — | Auth | Redirects to `/dashboard` |
| `/login` | AuthModule | Public | Login page |
| `/dashboard` | DashboardModule | Auth | Stats overview |
| `/employees` | EmployeesModule | Auth | Employee list |
| `/employees/new` | EmployeesModule | Auth | Create employee form |
| `/employees/:id/edit` | EmployeesModule | Auth | Edit employee form |
| `/departments` | DepartmentsModule | Auth | Department list |
| `/departments/:id` | DepartmentsModule | Auth | Department detail |
| `**` | — | — | Redirects to `/dashboard` |

### 2.3 Shared TypeScript interfaces

Define in `src/app/shared/interfaces/`:

```typescript
// api.interfaces.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
}

// employee.interfaces.ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hireDate: string;        // ISO date string
  salary: number;
  isActive: boolean;
  department: DepartmentRef;
  role: RoleRef;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRef { id: string; name: string }
export interface RoleRef { id: string; title: string; level: string }

// department.interfaces.ts
export interface Department {
  id: string;
  name: string;
  description: string | null;
  activeEmployeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDetail extends Department {
  employees: Employee[];
}

// role.interfaces.ts
export interface Role {
  id: string;
  title: string;
  level: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER';
}

// auth.interfaces.ts
export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
```

---

## 3. Authentication

### 3.1 AuthService (`src/app/auth/auth.service.ts`)

Responsibilities:
- `login(email, password)` — calls `POST /auth/login`, stores the JWT and user object
- `logout()` — removes token and user from storage, navigates to `/login`
- `getToken()` — returns the stored JWT string or `null`
- `getCurrentUser()` — returns the stored `AuthUser` or `null`
- `isLoggedIn()` — returns `true` if a token exists

**Storage:** Use `localStorage`. Keys: `auth_token`, `auth_user`.

### 3.2 AuthGuard (`src/app/auth/guards/auth.guard.ts`)

- Implements `CanActivate`.
- If `isLoggedIn()` returns `false`, redirect to `/login` and return `false`.
- Otherwise return `true`.

Applied on all routes except `/login`.

### 3.3 HTTP Interceptor (`src/app/auth/interceptors/auth.interceptor.ts`)

- Intercepts every outgoing `HttpRequest`.
- If a token exists, clones the request and adds: `Authorization: Bearer <token>`.
- Does **not** modify requests going to external URLs.
- On receiving a `401` response, automatically calls `AuthService.logout()` (token expired).

Register in `AppModule` providers:
```typescript
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

---

## 4. Pages

### 4.1 Login page (`/login`)

**Layout:** Centered card on a neutral background. Card width ~380px.

**Content:**
- App name / logo at the top of the card
- Heading: "Sign in"
- Email input field with label
- Password input field with label and show/hide toggle
- "Sign in" submit button (full width, primary style)

**Form (ReactiveForm):**

| Field | Control name | Validators |
|---|---|---|
| Email | `email` | `Validators.required`, `Validators.email` |
| Password | `password` | `Validators.required`, `Validators.minLength(8)` |

**Behavior:**
- Form submits on button click or Enter key.
- While the login request is in-flight: button is disabled and shows a spinner or "Signing in…" text.
- On `200 OK`: store token and user, navigate to `/dashboard`.
- On `401`: show an inline error message below the form — "Invalid email or password." Do not clear the password field.
- On network error: show — "Something went wrong. Please try again."
- Field-level errors appear only after the user has touched the field (not on first render):
  - Email empty → "Email is required"
  - Email invalid format → "Enter a valid email address"
  - Password empty → "Password is required"
  - Password too short → "Password must be at least 8 characters"
- If the user is already logged in and visits `/login`, redirect immediately to `/dashboard`.

---

### 4.2 Dashboard page (`/dashboard`)

**Layout:** Page with a top navigation bar and a content area.

**Content:**

**Stat cards row** (4 cards in a responsive grid):

| Card | Value source |
|---|---|
| Total employees | `stats.total` |
| Active employees | `stats.active` |
| Departments | `departments.length` |
| Average salary | `stats.byDepartment` averaged |

Each card: large number, label below, subtle background colour.

**Department breakdown table:**

Columns: Department name · Active employees · Average salary

Rows come from `GET /employees/stats` → `byDepartment` array. Sorted by active employee count descending.

**Behavior:**
- All data is loaded on component init via parallel `forkJoin` calls.
- While loading: each card shows a skeleton placeholder (grey animated block).
- On error: show an error banner at the top — "Failed to load dashboard data."

---

### 4.3 Employee list page (`/employees`)

**Layout:** Full-width page. Toolbar above the table with controls. Table fills the remaining space.

**Toolbar (row of controls):**

| Control | Type | Behavior |
|---|---|---|
| Search | Text input | Filters by name or email. Debounced 300ms. Sends `?search=` to API. |
| Department | `<select>` | Filters by department. Default "All departments". Sends `?departmentId=` to API. |
| Show inactive | Toggle / checkbox | When off (default), only active employees shown (`?isActive=true`). When on, all shown. |
| + Add employee | Button | Navigates to `/employees/new` |

**Employee table:**

| Column | Source | Notes |
|---|---|---|
| Name | `firstName + lastName` | Clickable — opens edit page |
| Email | `email` | |
| Department | `department.name` | |
| Role | `role.title` | |
| Level | `role.level` | Badge with colour per level (Junior=grey, Mid=blue, Senior=green, Lead=purple, Manager=orange) |
| Hire date | `hireDate` | Formatted as `DD MMM YYYY` (e.g. 15 Mar 2024) |
| Status | `isActive` | Badge: "Active" (green) / "Inactive" (grey) |
| Actions | — | Edit button (pencil icon) · Deactivate button (only shown when `isActive = true`) |

**Pagination:**
- Shown below the table.
- Displays: `Showing 1–20 of 87 employees`
- Previous / Next buttons. Page number indicator.
- Changing page reloads data with `?page=N`.
- Default: 20 items per page.

**Behavior:**
- On init: fetch employees + fetch departments (for the filter dropdown).
- Search and filter changes reset to page 1.
- Deactivate button: shows a confirmation modal before sending the request (see section 6.1).
- After successful deactivation: show a success toast and reload the current page.
- While loading: show a spinner overlay on the table, or replace rows with skeleton rows (preferred).
- Empty state: if no employees match the filters, show "No employees found. Try adjusting your filters." centered in the table area.

---

### 4.4 Create / Edit employee page (`/employees/new` and `/employees/:id/edit`)

Both use the same form component. In edit mode, the form is pre-filled with the current employee data.

**Layout:** Single-column form in a card. Max width ~640px, centered.

**Page heading:**
- Create mode: "Add new employee"
- Edit mode: "Edit employee" + the employee's full name as a subtitle

**Form fields:**

| Field | Control | Input type | Validators |
|---|---|---|---|
| First name | `firstName` | text | required, minLength(1), maxLength(100) |
| Last name | `lastName` | text | required, minLength(1), maxLength(100) |
| Email | `email` | email | required, valid email format |
| Department | `departmentId` | `<select>` | required |
| Role | `roleId` | `<select>` | required |
| Hire date | `hireDate` | date | required, must not be in the future |
| Salary | `salary` | number | required, min(0.01), max(999999.99) |

Department and Role selects are populated from `GET /departments` and `GET /roles` on component init.

**Buttons:**
- "Save" (primary) — submits the form
- "Cancel" (secondary) — navigates back to `/employees` without saving

**Behavior:**
- Validation errors appear on submit attempt **and** on blur (field loses focus).
- Error messages appear directly below each field, not in a global error box.
- Field-level error messages:

| Field | Error | Message |
|---|---|---|
| firstName | required | "First name is required" |
| lastName | required | "Last name is required" |
| email | required | "Email is required" |
| email | invalid | "Enter a valid email address" |
| departmentId | required | "Please select a department" |
| roleId | required | "Please select a role" |
| hireDate | required | "Hire date is required" |
| hireDate | future date | "Hire date cannot be in the future" |
| salary | required | "Salary is required" |
| salary | min | "Salary must be greater than 0" |
| salary | max | "Salary cannot exceed 999,999.99" |

- While saving: button is disabled, shows "Saving…".
- On `201 / 200` success: navigate to `/employees`, show success toast — "Employee created." / "Employee updated."
- On `409 Conflict` (email taken): show an error message below the email field — "This email address is already in use."
- On other API errors: show a toast — "Failed to save. Please try again."
- In edit mode: load the employee first. If the ID does not exist (404), redirect to `/employees` with an error toast.

---

### 4.5 Department list page (`/departments`)

**Layout:** Responsive card grid (2–3 columns on desktop, 1 on mobile).

Each department card:
- Department name (large, bold)
- Description (muted text, truncated to 2 lines)
- Active employee count badge
- "View" button → navigates to `/departments/:id`

**Behavior:**
- On init: fetch all departments.
- While loading: show skeleton cards.
- Empty state: "No departments found."

---

### 4.6 Department detail page (`/departments/:id`)

**Layout:** Two sections — a header with department info, then a table of employees.

**Department header:**
- Name, description
- Stat chips: "27 active employees" · "Avg. salary: €4,800" · "Created: Jan 2024"

**Employee table:** Same columns as the employee list page, but without the department column (all employees belong to this department). No search or pagination required — display all employees of the department.

**Behavior:**
- On init: fetch department by ID. If 404, redirect to `/departments`.
- The employee list shows only active employees by default.
- "Show inactive" toggle reveals deactivated employees (dimmed rows).

---

## 5. Shared UI components

### 5.1 Navigation bar

Persistent top bar on all authenticated pages.

**Left side:** App logo / name ("Staff Directory")

**Navigation links:**
- Dashboard → `/dashboard`
- Employees → `/employees`
- Departments → `/departments`

**Right side:**
- Current user email
- Logout button → calls `AuthService.logout()`

Active link is visually highlighted.

### 5.2 Confirmation modal

Used before destructive actions (deactivate employee, delete department).

**Content:**
- Title: e.g. "Deactivate employee?"
- Body: e.g. "Anna Kowalski will be marked as inactive. You can reactivate them later."
- Buttons: "Cancel" (secondary) · "Confirm" (danger/red primary)

**Behavior:**
- Blocks the background with a semi-transparent overlay.
- Pressing Escape or clicking outside closes the modal and cancels the action.
- "Confirm" sends the API request. While in-flight, the Confirm button is disabled.

### 5.3 Toast notifications

A toast service displays brief non-blocking messages in the top-right corner.

**Types:**

| Type | Colour | When to use |
|---|---|---|
| Success | Green | After a successful create, update, or deactivate |
| Error | Red | After a failed API call |
| Info | Blue | Informational messages |

**Behavior:**
- Toasts auto-dismiss after 4 seconds.
- Multiple toasts stack vertically.
- User can click an × button to dismiss early.

### 5.4 Level badge component

A small inline badge that displays a role level with a colour.

| Level | Background | Text |
|---|---|---|
| JUNIOR | grey | Junior |
| MID | blue | Mid |
| SENIOR | green | Senior |
| LEAD | purple | Lead |
| MANAGER | orange | Manager |

### 5.5 Status badge component

Displays employee active status.

| isActive | Colour | Label |
|---|---|---|
| `true` | Green | Active |
| `false` | Grey | Inactive |

---

## 6. Services

### 6.1 EmployeesService (`src/app/employees/employees.service.ts`)

```typescript
getEmployees(params: EmployeeQueryParams): Observable<PaginatedResponse<Employee>>
getEmployee(id: string): Observable<Employee>
createEmployee(dto: CreateEmployeeDto): Observable<Employee>
updateEmployee(id: string, dto: UpdateEmployeeDto): Observable<Employee>
deactivateEmployee(id: string): Observable<void>
getStats(): Observable<EmployeeStats>
```

### 6.2 DepartmentsService

```typescript
getDepartments(): Observable<Department[]>
getDepartment(id: string): Observable<DepartmentDetail>
createDepartment(dto: CreateDepartmentDto): Observable<Department>
updateDepartment(id: string, dto: UpdateDepartmentDto): Observable<Department>
```

### 6.3 RolesService

```typescript
getRoles(): Observable<Role[]>
```

---

## 7. HTTP error handling

The Auth Interceptor must also catch global HTTP errors. For each status code, the expected behavior is:

| Status | Behavior |
|---|---|
| `400` | Show toast with validation message from API response |
| `401` | Call `AuthService.logout()`, redirect to `/login` |
| `403` | Show toast: "You do not have permission to perform this action." |
| `404` | Show toast: "The requested resource was not found." (or navigate, depending on context) |
| `409` | Surface the conflict message — usually in a form field, not a toast |
| `5xx` | Show toast: "A server error occurred. Please try again later." |

---

## 8. Form utilities

### 8.1 Custom validator — future date

```typescript
export function noFutureDate(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const value = new Date(control.value);
  return value > new Date() ? { futureDate: true } : null;
}
```

Applied to the `hireDate` control.

### 8.2 Salary formatting pipe

A custom Angular pipe `SalaryPipe` that formats a number as currency:

```typescript
// {{ employee.salary | salary }} → "€ 4,800.00"
```

---

## 9. TypeScript configuration

`tsconfig.json` must have `strict` mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true
  }
}
```

No `any` types anywhere. If an API response type is unclear, use `unknown` and narrow it explicitly.

---

## 10. Project structure

```
frontend/
├── src/
│   └── app/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── login/
│       │   │   ├── login.component.ts
│       │   │   └── login.component.html
│       │   ├── guards/
│       │   │   └── auth.guard.ts
│       │   ├── interceptors/
│       │   │   └── auth.interceptor.ts
│       │   └── auth.service.ts
│       ├── dashboard/
│       │   ├── dashboard.module.ts
│       │   └── dashboard/
│       │       ├── dashboard.component.ts
│       │       └── dashboard.component.html
│       ├── employees/
│       │   ├── employees.module.ts
│       │   ├── employee-list/
│       │   │   ├── employee-list.component.ts
│       │   │   └── employee-list.component.html
│       │   └── employee-form/
│       │       ├── employee-form.component.ts
│       │       └── employee-form.component.html
│       ├── departments/
│       │   ├── departments.module.ts
│       │   ├── department-list/
│       │   └── department-detail/
│       ├── shared/
│       │   ├── shared.module.ts
│       │   ├── interfaces/
│       │   │   ├── api.interfaces.ts
│       │   │   ├── employee.interfaces.ts
│       │   │   ├── department.interfaces.ts
│       │   │   ├── role.interfaces.ts
│       │   │   └── auth.interfaces.ts
│       │   ├── services/
│       │   │   ├── employees.service.ts
│       │   │   ├── departments.service.ts
│       │   │   ├── roles.service.ts
│       │   │   └── toast.service.ts
│       │   ├── components/
│       │   │   ├── navbar/
│       │   │   ├── confirm-modal/
│       │   │   ├── toast/
│       │   │   ├── level-badge/
│       │   │   └── status-badge/
│       │   ├── pipes/
│       │   │   └── salary.pipe.ts
│       │   └── validators/
│       │       └── no-future-date.validator.ts
│       ├── app-routing.module.ts
│       └── app.module.ts
├── proxy.conf.json          ← proxies /api/* to localhost:3000 in dev
└── angular.json
```

### 10.1 Dev proxy config

`proxy.conf.json` must forward API calls to the backend during development:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

Register in `angular.json` under `serve.options.proxyConfig`.

---

## 11. README requirements

The frontend `README.md` must include:

1. **Prerequisites** — Node.js version, Angular CLI version
2. **Getting started:**
   ```bash
   cd frontend
   npm install
   ng serve
   # App runs at http://localhost:4200
   # API must be running at http://localhost:3000
   ```
3. **Environment** — note that the backend must be running first
4. **Key features** — brief bullet list of what the app does
