# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

Full-stack event management platform with role-based access control. Two separate apps in the same repo:

| Directory | Role | Port |
|-----------|------|------|
| `Event-planner/` | Node.js/Express REST API | 3000 |
| `event-planner-frontend/` | React SPA | 3001 |

---

## Commands

### Backend (`Event-planner/`)
```bash
npm run dev     # nodemon server.js (development)
npm start       # node server.js (production)
```

### Frontend (`event-planner-frontend/`)
```bash
npm start       # CRA dev server on :3001
npm run build   # Production build → /build
npm test        # Jest + React Testing Library
```

---

## Backend Architecture

**Stack**: Express 4.18.2 · Sequelize 6.35.0 · MySQL (Aiven Cloud) · JWT · Nodemailer/Resend

**Entry point**: `server.js` → mounts all routes under `/api`, applies Helmet, CORS, audit middleware, and global error handler.

### Layer pattern

```
routes/        → express.Router, validation middleware, auth guards
controllers/   → parse req, call service, send response
services/      → business logic, Sequelize queries, transactions
models/        → Sequelize model definitions + associations
validators/    → express-validator rule arrays
constants/     → HTTP codes + error/success message strings per domain
```

### Auth & RBAC

JWT two-token system: access token (24 h) + refresh token (7 d) stored in `localStorage` on the client.

Roles: `administrador`, `gerente`, `organizador`, `ponente`, `asistente`

Middleware in `middlewares/auth.js` exports: `auth` (verify token), `isAdministrador`, `isGerente`, `isOrganizador`, `isPonente`, `isAsistente`, `isGerenteOrOrganizador`, `isGerenteOrAdmin`.

Entity-level checks live in `middlewares/verificarPermisos.js`.

### Key models & relationships

- `Usuario` → polymorphic root; has one of `Administrador | Asistente | Ponente`, many `AdministradorEmpresa`
- `Empresa` → owns `Evento[]`, `Ubicacion[]`, `Lugar[]`
- `Evento` → has `Actividad[]`, `Inscripcion[]`, `Encuesta[]`, `Notificacion[]`
- `Actividad` → many-to-many with `Lugar` (via `LugarActividad`) and `Ponente` (via `PonenteActividad`)
- `Inscripcion` → links `Asistente` ↔ `Evento`; has `Asistencia[]`
- `Pais → Ciudad → Ubicacion → Lugar` geographic hierarchy

### Background jobs

`cron/recordatorios.cron.js` — runs daily at 08:00, queries activities scheduled for tomorrow, sends reminder notifications to assigned speakers.

### Email

Provider: Resend API (`RESEND_API_KEY`). All email calls are fire-and-forget (do not block the response).

### Response utility

All controllers use `utils/response.js` for uniform `{ success, message, data }` shape.

---

## Frontend Architecture

**Stack**: React 19.2.0 · react-router-dom 7.9.4 · Tailwind CSS 3.4.19 · shadcn/ui (Radix primitives) · Recharts

### Auth flow

`AuthContext` (`src/contexts/AuthContext.js`) uses `useReducer`. On mount it reads `access_token` / `refresh_token` / `user` from `localStorage`. The base service (`src/services/api/baseService.js`) auto-retries on 401 by calling `POST /auth/refresh`; on failure it clears storage and redirects to `/login`.

### Service layer

```
src/services/api/baseService.js    ← central fetch wrapper + token refresh
src/services/api/authService.js    ← login / logout
src/services/api/eventsAPI.js      ← /eventos
src/services/api/locationsAPI.js   ← /ubicaciones
src/services/api/placesAPI.js      ← /lugares
src/services/api/organizersAPI.js  ← /auth/crear-organizador
src/services/api/apiEmpresa.js     ← /empresas
src/services/*.js                  ← higher-level wrappers used by hooks
```

API base URL comes from `REACT_APP_API_URL` (must include `/api`).

### Route guards

Each role has a dedicated guard component in `src/components/`:

| Component | Allowed role |
|-----------|-------------|
| `AdminRoute.js` | administrador |
| `GerenteRoute.js` | gerente |
| `OrganizadorRoute.js` | organizador |
| `PonenteRoute.js` | ponente |
| `AsistenteRoute.js` | asistente |
| `PrivateRoute.js` | any authenticated |

After login, `src/utils/roleUtils.js` maps role → redirect path.

### Page structure by role

```
pages/admin/          → affiliations approval, user/role management, audit
pages/gerente/        → dashboard, crear-organizador, ubicaciones, lugares, eventos
pages/organizador/    → eventos, actividades, agenda, asistentes, encuestas, notificaciones
pages/ponente/        → dashboard, eventos asignados, agenda, actividades, encuestas
pages/asistente/      → dashboard, eventos disponibles, agenda, inscripciones, encuestas
pages/auth/           → Login, register
pages/empresa/        → company profile & affiliations
```

---

## Design System

### Tailwind custom tokens (`tailwind.config.js`)

| Token | Value | Use |
|-------|-------|-----|
| `brand-600` | `#2563eb` | Primary action color |
| `sidebar-bg` | `#1A2332` | All sidebar backgrounds |
| `success` | `#10b981` | Positive states |
| `warning` | `#f59e0b` | Caution states |
| `danger` | `#ef4444` | Error/destructive |
| `info` | `#0ea5e9` | Informational |
| `event-draft` | `#94a3b8` | Draft event badge |
| `event-published` | `#2563eb` | Published event badge |
| `event-cancelled` | `#ef4444` | Cancelled event badge |
| `event-finished` | `#10b981` | Finished event badge |

Animations defined: `fade-in` (0.2 s), `slide-up` (0.25 s), `spin-slow` (1 s).

CSS variables in `src/index.css`:
```css
--sidebar-bg: #1A2332;
--sidebar-width: 280px;
--sidebar-collapsed-width: 72px;
--radius: 0.5rem;
```

### shadcn/ui components installed (`src/components/ui/`)

`alert` · `badge` · `button` · `card` · `dialog` · `input` · `label` · `select` · `separator` · `skeleton` · `table` · `textarea`

All use `cn()` from `src/lib/utils.js` (`clsx` + `tailwind-merge`).

### CSS migration state

**Already on Tailwind** (no separate CSS file):
- All `src/pages/admin/` components (CSS module files deleted)
- All `src/pages/gerente/` components
- `src/components/ui/*`
- `src/layouts/MenuAdmin/menu.jsx` (module deleted)

**Still using CSS Modules / plain CSS** (pending migration):
- `src/components/Dashboard.module.css`
- `src/contexts/NotificacionesDropdown.module.css`
- `src/pages/asistente/asistentePanel.module.css`
- `src/pages/organizador/OrganizerDashboard.css`
- `src/pages/organizador/Sidebar.css`
- `src/pages/organizador/Eventos/EventosPage.css`
- `src/pages/auth/Login.css` / `register.css`
- `src/pages/AdminLogin.css` / `ForgotPassword.css`

---

## Known Technical Debt

- `axios` is listed as a dependency but the project uses the native `fetch` API everywhere. Can be removed.
- Some legacy service files exist in both `src/components/` (e.g., `eventosService.js`, `asistenciaService.js`) and `src/services/`—the canonical location is `src/services/`.
- `src/pages/register.jsx` and `src/components/register.js` duplicate registration logic; `src/pages/auth/register.jsx` is the active version.
- `src/components/login.js` is legacy; `src/pages/auth/Login.jsx` is the active version.
- Several `*.module.css` files listed above have not yet been migrated to Tailwind.

---

## Environment Variables

### Backend (`Event-planner/.env`)
```
PORT=3000
NODE_ENV=development
DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD   # Aiven MySQL
JWT_SECRET / JWT_EXPIRE=24h
JWT_REFRESH_SECRET / JWT_REFRESH_EXPIRE=7d
RESEND_API_KEY / EMAIL_USER / EMAIL_PASSWORD
ALLOWED_ORIGINS=http://localhost:3001
FRONTEND_URL=http://localhost:3001
```

### Frontend (`event-planner-frontend/.env`)
```
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```
