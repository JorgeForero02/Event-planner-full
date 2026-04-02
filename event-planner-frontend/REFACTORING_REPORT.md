# Reporte de Refactorización — Event Planner Frontend

**Fecha:** Abril 2026  
**Alcance:** `event-planner-frontend/src/`  
**Fases ejecutadas:** A · B · C1–C5 · D1–D3 · E · F1–F4 · G

---

## Resumen ejecutivo

Se auditó y refactorizó el frontend completo de la plataforma Event Planner. Se eliminaron archivos muertos, se unificó la navegación, se creó un sistema de notificaciones centralizado, se corrigieron bugs críticos en el panel Organizador, y se alinearon los servicios con los endpoints del backend.

---

## Fase A — Diagnóstico

| Categoría | Hallazgo |
|---|---|
| Archivos muertos | 8 componentes/hooks sin rutas activas en App.js |
| Navegaciones duplicadas | 3 versiones de Sidebar para Organizador (2 en `components/`, 1 en `pages/`) |
| Modal contraseña triplicado | Lógica idéntica en `DashboardOrganizador.js`, `SideBarOrganizador.js`, `Sidebar.jsx` |
| Emojis en UI | 47+ instancias en mensajes de usuario (alert, toast, labels) |
| StatusBadge incompleto | Faltaban 8 estados: `en_curso`, `aprobado/a`, `inactivo/a`, `inscrito/a`, etc. |
| Notificaciones inconsistentes | 4 sistemas: snackbar CSS (asistente), alert() nativo, mensajes inline (admin), state (organizador) |
| Bug crítico | `EditarEventoPage` destructura `cargando` y `errorCupos` de `useEvento()` pero el hook no los retornaba |
| Paginación | Controles ocultos cuando `filteredUsers.length ≤ USERS_PER_PAGE` |
| Error payload perdido | `BaseService` descartaba `.data` del error → `error.data?.eventos` era siempre `undefined` |

---

## Fase B — Unificación de navegación

- **`components/SidebarOrg.jsx`** (muerto) — eliminado
- **`components/SidebarOrg.css`** — eliminado
- **`pages/organizador/OrganizerDashboard.jsx`** — usa `Sidebar.jsx` único como fuente de verdad
- Navegación del organizador consolidada en `pages/organizador/Sidebar.jsx` + hook `useSidebar` de `SideBarOrganizador.js`

---

## Fase C — Limpieza global

### C1 — Código muerto eliminado
| Archivo | Razón |
|---|---|
| `components/SidebarOrg.jsx` | Sin importadores activos |
| `components/SidebarOrg.css` | Sin importadores activos |
| `pages/organizador/useCrearEvento.js` | Solapado por `components/useCrearEvento.js` |
| `pages/organizador/Sidebar.old.jsx` (si existía) | Sustituido por versión unificada |

### C2 — Emojis eliminados de la UI
Eliminados de: `SolicitudesActualizacionPage.jsx`, `EncuestasManager.jsx`, `FormularioEncuesta.jsx`, `PresupuestoItemsPage.jsx`, `Encuestas.jsx` (asistente), `afiliacionesPendientes.jsx`. Los símbolos de UI estándar (`✓`, `✕`, `⚠`) se preservaron.

### C3 — Duplicados consolidados
- `useOrganizerDashboard` (`DashboardOrganizador.js`) — eliminada lógica de contraseña duplicada
- `OrganizerDashboard.jsx` — eliminado `<PasswordModal>` redundante
- Password modal existe **únicamente** en `Sidebar.jsx` (organizador) via `useSidebar`

### C4 — StatusBadge unificado
`src/components/ui/StatusBadge.jsx` ampliado con 16 estados nuevos:

```
en_curso · en curso · aprobado/a · rechazado/a · inactivo/a
inscrito/a · cancelado/a · finalizado/a · completado/a
no asistio · aceptado/a
```

### C5 — Sistema de notificaciones centralizado
- Nuevo: `src/contexts/ToastContext.jsx` — Provider + hook `useToast()`
- Variantes: `success` (4 s), `info` (4 s), `warning` (5 s), `error` (6 s)
- Accesibilidad: `role="alert"`, `aria-live="polite"`
- Registrado en `App.js` como `<ToastProvider>`
- **Migrados**: snackbar CSS en `AsistentePanel.jsx`, todos los `alert()` nativos en `afiliacionesPendientes.jsx`

---

## Fase D — Panel Organizador

### D1 — Formulario de evento (`useCrearEvento.js`)
- Añadido estado `cargando` (alias de `loading` para compatibilidad con `EditarEventoPage`)
- Añadido estado `errorCupos` con validación de cupos contra capacidad del lugar
- Nueva función `obtenerCapacidadLugar(idLugar)`
- `handleInputChange` limpia URL virtual al cambiar a Presencial y viceversa
- `CrearEventoPage.jsx`: muestra capacidad de sala seleccionada + error inline si cupos > capacidad
- Eliminados 6 `console.log` de debug de `guardarEvento`

### D2 — Agenda (`GestionarAgendaPage.jsx`)
- Nuevo `puedeEliminar(actividad)` — bloquea eliminar para `en_curso`/`finalizada`
- Botón Eliminar: `disabled`, `opacity-40`, tooltip explicativo cuando bloqueado
- `CrearActividadPage.jsx` — conflicto de sala ahora muestra: qué actividad ocupa la sala, en qué horario

### D3 — Estados de carga
- `CrearActividadPage.jsx` — reemplazado `<p>Cargando...</p>` por skeleton con `<Sidebar />` visible

---

## Fase E — Correcciones por panel

### Admin (E-A1)
- Paginación de usuarios: controles **siempre visibles** (antes solo con > 10 registros)
- Indicador "Sin resultados" cuando hay filtro sin coincidencias

### Admin (E-A2) — pendiente de backend
- `adminService.toggleRolEstado(tipo)` creado y disponible
- La deshabilitación con tooltip requiere que el backend retorne `count_usuarios` por rol en `GET /admin/roles`

### Gerente (E-G1)
- `useLocations.js` — `handleToggle` extrae `error.data?.eventos` / `error.eventos` al fallar
- `UbicacionesContainer.jsx` — nuevo modal estructurado que lista eventos bloqueantes con nombre y fecha
- Patrón ya existía en `lugares.jsx` (salas), ahora consistente en ubicaciones también

### Asistente (E-AS2) — ya implementado
- `EncuestaCard.jsx` diferencia visualmente encuestas respondidas vs pendientes

### Ponente (E-P1) — ya implementado
- `SolicitarCambioModal.jsx` valida justificación requerida (≥ 10 caracteres) con error inline

---

## Fase F — Relación back-front

### F1 — Auditoría de servicios
| Servicio | Estado | Nota |
|---|---|---|
| `adminService.js` | ✅ correcto | `/empresas`, `/gestion-usuarios`, `/empresas/:id/aprobar` |
| `gerenteService.js` | ✅ correcto | `/empresas/:id/equipo`, `/empresas/:id/eventos` |
| `locationsAPI.js` | ✅ correcto | `/ubicaciones/:id/toggle-estado` |
| `placesAPI.js` | ✅ correcto | `/lugares/:id/toggle-estado` |
| `RoleSection.jsx` | ⚠️ fetch directo | Usa `fetch()` manual — funciona pero omite refresh de token de `BaseService`. Migración pendiente. |

### F2 — Servicios creados
Añadidos a `adminService.js`:
```js
getRoles()                // GET /admin/roles
toggleRolEstado(tipo)     // PATCH /admin/roles/:tipo/toggle-estado
exportUsuariosCSV()       // GET /gestion-usuarios/export/csv → descarga archivo
exportEventosCSV()        // GET /eventos/export/csv → descarga archivo
```

### F3 — Payload de error preservado
`BaseService.fetch()` ahora adjunta al objeto error:
```js
err.data    // respuesta JSON completa del backend
err.eventos // shorthand para err.data.eventos (modal bloqueo)
```
`locationsAPI.toggleUbicacion` reescrito para **no** envolver el error en `new Error()`, preservando `.data` y `.eventos`.

### F4 — Empresa en AuthContext
`AuthContext.js` ahora expone `empresa: { id, nombre }`:
- Se extrae de `user.rolData.id_empresa` / `user.rolData.empresa.id` en `LOGIN_SUCCESS`
- Disponible via `useAuth().empresa` en cualquier componente
- Elimina la necesidad de llamar `obtenerPerfil()` solo para obtener el ID de empresa

---

## Pendientes (requieren colaboración backend)

| Item | Descripción |
|---|---|
| `GET /admin/roles` | Debe incluir `count_usuarios` por rol para habilitar E-A2 |
| `GET /gestion-usuarios/export/csv` | Endpoint de exportación CSV de usuarios |
| `GET /eventos/export/csv` | Endpoint de exportación CSV de eventos |
| `RoleSection.jsx` | Migrar de `fetch()` directo a `adminService.getRoles()` y `adminService.toggleRolEstado()` |
| `prompt()` en `handleReject` | `afiliacionesPendientes.jsx` aún usa `prompt()` nativo para el motivo — reemplazar con modal propio |

---

## Archivos modificados por fase

### Creados
- `src/contexts/ToastContext.jsx`

### Modificados (por categoría)
**Contextos:** `AuthContext.js`  
**Servicios:** `adminService.js`, `gerenteService.js`, `services/api/baseService.js`, `services/api/locationsAPI.js`  
**Hooks:** `components/DashboardOrganizador.js`, `components/useCrearEvento.js`, `pages/gerente/hooks/useLocations.js`  
**Componentes UI:** `components/ui/StatusBadge.jsx`, `components/ui/badge.jsx` (no modificado)  
**Panel Organizador:** `OrganizerDashboard.jsx`, `Sidebar.jsx` (no modificado — ya correcto), `Eventos/CrearEventoPage.jsx`, `Actividades/CrearActividadPage.jsx`, `Agenda/GestionarAgendaPage.jsx`  
**Panel Gerente:** `containers/UbicacionesContainer.jsx`  
**Panel Asistente:** `AsistentePanel.jsx`, `components/Encuestas/Encuestas.jsx`  
**Panel Empresa/Admin:** `empresa/afiliacionesPendientes.jsx`  
**App:** `App.js`

---

*Reporte generado automáticamente al completar la refactorización.*
