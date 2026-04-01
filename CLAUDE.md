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
npm run dev          # nodemon server.js (development)
npm start            # node server.js (production)
npm test             # jest (all unit tests)
npm test:coverage    # jest --coverage
npx jest --testPathPattern=<file>   # run a single test file
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

### Notable API endpoints (added in AG1 audit)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `PATCH` | `/ubicaciones/:id/toggle-estado` | auth + isGerente | Enable/disable location |
| `PATCH` | `/lugares/:id/toggle-estado` | auth + isGerente | Enable/disable venue |
| `GET` | `/eventos/:id/reporte` | auth + isGerenteOrOrganizador | KPI report (inscriptions, attendance, surveys) |
| `GET` | `/eventos/:id/presupuesto` | auth | Budget summary per activity |
| `GET` | `/admin/dashboard/stats` | auth + isAdministrador | System-wide user/event/attendance stats |

### Unit tests (`Event-planner/tests/unit/`)

Tests use Jest with `jest.mock('../../models', ...)` to run without a database. 8 test files, 56 tests total.

| File | Covers |
|------|--------|
| `actividad.validator.pure.test.js` | `_detectarSolapamientoHorario`, `_validarFechaActividad`, `validarCreacion`, `validarActualizacion` |
| `actividad.validator.capacity.test.js` | `validarCapacidadSala` (mocked Inscripcion + Lugar) |
| `inscripcion.validator.test.js` | `validarInscripcionEquipo` |
| `inscripcion.service.cancelar.test.js` | `cancelar` — 404/403/400/success cases |
| `evento.service.pure.test.js` | `_obtenerFechaHoy`, `construirActualizaciones`, `construirFiltros` |
| `ubicacion.service.toggle.test.js` | `toggleEstado` — future-event guard, enable/disable |
| `lugar.service.toggle.test.js` | `toggleEstado` — future-activity guard, enable/disable |
| `admin.controller.stats.test.js` | `obtenerDashboardStats` — counts, tasa, 500 error |

Key model facts needed when writing tests:
- `RespuestaEncuesta.estado` is ENUM `('pendiente', 'completada', 'expirada')` — not a boolean `respondida`
- `AdministradorEmpresa.es_Gerente` is TINYINT (1=gerente, 0=organizador) — not a `rol` string
- `Asistencia` FK to Inscripcion is named `inscripcion` (not `id_inscripcion`)

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

`alert` · `badge` · `button` · `card` · `dialog` · `input` · `label` · `select` · `separator` · `skeleton` · `StatusBadge` · `table` · `textarea`

All use `cn()` from `src/lib/utils.js` (`clsx` + `tailwind-merge`).

### CSS migration state

**Fully on Tailwind** (no CSS import):
- All `src/pages/admin/` components ✅
- `src/pages/gerente/ActualizarEmpresa.jsx` ✅ (ActualizarEmpresa.css file exists but is no longer imported)
- `src/components/ui/*` ✅
- `src/components/` (all non-ui components) ✅
- `src/layouts/MenuAdmin/menu.jsx` ✅

**Gerente — still using CSS (layout/structure only):**
- `lugares.jsx` → `lugares.module.css`
- `ubicaciones.jsx` → `ubicaciones.module.css`
- `eventosPage.jsx` → `eventosPage.module.css`
- `GerenteSidebar.jsx` → `GerenteSidebar.css`
- `GerenteDashboard.jsx` → `GerenteDashboard.css`
- `CrearOrganizadorPage.jsx` → `CrearOrganizadorModal.css`

**Organizador — still using CSS:**
- `EditarEventoPage.jsx` → `CrearEventoPage.css` (layout only; form elements already on shadcn/ui)
- `GestionarAgendaPage.jsx` → `GestionarAgendaPage.css`
- `EstadisticasEncuesta.jsx` → `EstadisticasEncuesta.css`
- `EnviarEncuestaAsistentes.jsx` → `EnviarEncuestaAsistentes.css`
- `EncuestasManager.jsx` → `EncuestasManager.css`
- `EstadisticasAsistencia.jsx` → `estadisticas.css`
- `OrganizadorNotificaciones.jsx` → `OrganizadorNotificaciones.css`
- `Actividades/ActividadesPage.jsx` → `ActividadesPage.css`
- `Actividades/CrearActividadPage.jsx` + `EditarActividadPage.jsx` → `CrearActividadPage.css`

**Asistente — still using CSS:**
- `AsistentePanel.jsx` + `asistente.jsx` → `asistentePanel.module.css`
- `sidebar.jsx` → `sidebar.module.css`
- `components/Dashboard/Dashboard.jsx` → `Dashboard.module.css`
- `components/Encuestas/` (EncuestaCard, EncuestaModal, Encuestas) → `Encuestas.module.css`
- `components/EventCard/EventCard.jsx` → `EventCard.module.css`
- `components/EventModal/EventModal.jsx` → `EventModal.module.css`
- `components/InscriptionModal/InscriptionModal.jsx` → `InscriptionModal.module.css`
- `components/InscriptionsList/InscriptionsList.jsx` → `InscriptionsList.module.css`
- `components/Agenda/Agenda.jsx` → `Agenda.module.css`

**Ponente — still using CSS:**
- `components/ui/ActividadCard.jsx` → `ActividadCard.module.css` (layout; badge migrado a StatusBadge)
- `components/ui/EncuestaCard.jsx` → `EncuestaCard.module.css` (layout; badge migrado a StatusBadge)
- `components/ui/ActividadDetallesModal.jsx` + `EventModal.jsx` → `EventModal.module.css`
- `components/ui/EstadisticasModal.jsx` → `EstadisticasModal.module.css`
- `components/ui/EventCard.jsx` → `EventoCard.module.css`
- `components/sections/EventosSection.jsx` → `EventosSection.module.css`
- `components/sections/EncuestasSection.jsx` → `EncuestasSection.module.css`
- `components/sections/MisActividadesSection.jsx` → `MisActividadesSection.module.css`
- `containers/PonenteDashboard.jsx` → `PonenteDashboard.module.css`

**Auth — still using CSS:**
- `auth/Login.jsx` → `Login.css`
- `auth/register.jsx` → `register.css`

**Empresa — still using CSS:**
- `empresa/ActualizarEmpresa.jsx` → `ActualizarEmpresa.css` (diferente al del gerente)
- `empresa/afiliaciones*.jsx` → `afiliaciones.module.css`
- `empresa/components/CampoFormulario/` → `CampoFormulario.css`
- `empresa/components/FormularioEmpresa/` → `FormularioEmpresa.css`

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

---

## Estado Fase 3 — Unificación Visual ✅ FINALIZADA

### Componentes completados
| # | Componente | Archivos tocados |
|---|-----------|-----------------|
| 1 | SharedSidebar.jsx | Reemplaza 5 sidebars legacy (Asistente, Ponente, Organizador, Gerente, Admin) |
| 2 | KpiCard.jsx | Reemplaza todas las StatCard/MetricCard con inline styles |
| 3 | DataTable.jsx + EmptyState.jsx | asistencia.jsx, EstadisticasEncuesta.jsx, AgendaSection.jsx migradas |
| 4 | Modales → shadcn/ui Dialog | 23 archivos migrados (ver lista completa abajo) |
| 5 | Formularios → shadcn/ui Input/Label/Select/Textarea/Button | 11 archivos migrados (ver lista completa abajo) |
| 6 | StatusBadge.jsx | 9 archivos migrados (ver lista completa abajo) |

### Componente 4 — detalle archivos tocados
- AttendanceModal.jsx, EncuestaModal.jsx, AsistentePanel.jsx, Agenda.jsx
- CrearEncuestaModal.jsx, EstadisticasModal.jsx, ActividadDetallesModal.jsx
- ResponderInvitacionModal.jsx, SolicitarCambioModal.jsx, EditarEncuestaModal.jsx
- EventosSection.jsx, ModalExito.jsx, ModalConfirmacion.jsx, empresa.jsx
- EstadisticasEncuesta.jsx, ModalConfirmacion.js, GestionarAgendaPage.jsx
- EnviarEncuestaAsistentes.jsx, EditarEventoPage.jsx, eventosPage.jsx
- ActualizarEmpresa.jsx, ubicaciones.jsx, evento.jsx
- NO tocados: lugares.jsx (ya usaba Dialog), asistente.jsx (legacy no enrutado)

### Componente 5 — detalle archivos tocados
- AttendanceModal.jsx — Input, Label, Button; CSS Module eliminado
- ResponderInvitacionModal.jsx — Textarea, Label, Button; CSS Module eliminado
- SolicitarCambioModal.jsx — Input, Textarea, Label, Button; CSS Module eliminado
- CrearEncuestaModal.jsx — Input, Select, Textarea, Label, Button; CSS Module eliminado
- EditarEncuestaModal.jsx — Button (confirmación cierre); bare CSS classes eliminadas
- empresa.jsx — Input, Select, Label, Alert, Button; CSS Module eliminado
- ActualizarEmpresa.jsx (gerente) — Full Tailwind rewrite; ActualizarEmpresa.css eliminado; sidebar collapse + lucide icons; emojis removidos
- EditarEventoPage.jsx — Input, Select, Textarea, Label, Button; mantiene CrearEventoPage.css
- ubicaciones.jsx — Input, Select, Textarea, Label, Button en ambos modales; corregido import duplicado de Dialog
- lugares.jsx — Input, Select, Textarea, Label, Button en ambos modales; CSS Module se mantiene para layout
- eventosPage.jsx (gerente) — Input, Select para filtros de búsqueda
- NO tocados: EncuestaModal.jsx (sin inputs), EnviarEncuestaAsistentes.jsx (sin inputs), GestionarAgendaPage.jsx (sin inputs)

### Notas de implementación — Componente 5
- Error state en inputs: `className="border-danger"` (usa token `danger: '#ef4444'` del tailwind.config)
- Error messages: `<p className="text-sm text-danger">` (texto simple)
- Bloques de error de página: `<Alert variant="destructive"><AlertDescription>`
- Help text: `<p className="text-sm text-slate-500">`
- Select en este proyecto es un `<select>` nativo estilizado (no Radix popper)

### Componente 6 — detalle archivos tocados
- **Nuevo:** `src/components/ui/StatusBadge.jsx` — usa `<Badge>` de shadcn/ui, acepta `status` y `label` opcionales, exporta `STATUS_MAP`
- EstadisticasEncuesta.jsx (organizador) — eliminado `obtenerBadgeEstado`, reemplazado en 2 lugares
- asistencia.jsx (organizador) — eliminado `getEstadoBadgeClasses`, reemplazado en columna de tabla
- EventCard.jsx (gerente/components/lists) — eliminado `estadoVariants`, reemplazado badge span
- EventDetailsModal.jsx (gerente/components/modals) — eliminado `estadoClasses`, reemplazado badge span
- LocationsList.jsx (gerente/components/lists) — reemplazado inline ternary de estado activo/inactivo
- PlacesList.jsx (gerente/components/lists) — reemplazado inline ternary de estado activo/inactivo
- EncuestaCard.jsx (ponente) — eliminado `getEstadoColor`/`getEstadoText`, reemplazado estadoBadge
- ActividadCard.jsx (ponente) — eliminado `getEstadoBadge`, reemplazado call site
- EncuestaCard.jsx (asistente) — eliminado `getEstadoStyles`/`getEstadoTexto`, reemplazado estadoBadge

### STATUS_MAP — estados cubiertos
- Eventos: `publicado`→published, `activo`→success, `cancelado`→cancelled, `finalizado`→finished, `borrador`→draft
- Encuestas/respuestas: `activa`→success, `completada`→success, `pendiente`→warning, `cerrada`→info, `expirada`→destructive
- Asistencia: `confirmado`/`confirmada`→success, `ausente`→destructive
- Invitaciones: `aceptado`→success, `rechazado`→destructive, `solicitud_cambio`→info
- Ubicaciones/lugares: `habilitada`/`habilitado`→success, `deshabilitada`/`deshabilitado`→secondary
- Fallback: `variant="outline"` para estados desconocidos

### Fase 3 finalizada
Todos los 6 componentes del sistema de diseño han sido completados.

### Invariantes globales (recordatorio)
- useEffect, handlers, lógica de API y estado: nunca modificar
- Tablas Admin/Gerente en shadcn/ui: no tocar
- style dinámico (ej: backgroundColor: row.color): preservar siempre
- Si ya usa shadcn/ui: no tocar
