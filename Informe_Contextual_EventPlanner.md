  
**INFORME CONTEXTUAL DEL SISTEMA**

**Portal de Gestión de Eventos Corporativos**

**EVENT PLANNER**

 

*Versión 1.0 — Módulos originales \+ Módulos de IA (SC1/SC2)*

Universidad Francisco de Paula Santander — Programa de Ingeniería de Sistemas

Análisis y Diseño de Sistemas — Equipo 10

Cúcuta, Norte de Santander — 2026

# **1\. Descripción General del Sistema**

EventPlanner es una plataforma web responsiva orientada a centralizar la gestión integral de eventos académicos y corporativos. Su propósito es permitir que las empresas u organizaciones planifiquen, publiquen y ejecuten eventos (webinars, talleres, conferencias internas), gestionando todo el ciclo de vida desde la afiliación de la empresa hasta la retroalimentación post-evento.

## **1.1 Ficha de Identificación del Proyecto**

| Nombre del proyecto | Portal de Gestión de Eventos Corporativos — Event Planner |
| :---- | :---- |
| **Versión del sistema** | 1.0 |
| **Equipo** | Equipo 10 — Curso Análisis y Diseño de Sistemas |
| **Institución** | Universidad Francisco de Paula Santander (UFPS) |
| **Fecha de inicio** | 15/08/2025 |
| **Stack tecnológico (Backend)** | Node.js \+ Express — API REST bajo prefijo /api |
| **Stack tecnológico (Frontend)** | React \+ React Router \+ Axios |
| **Base de datos** | MySQL 5.7+ gestionada vía Sequelize (ORM) |
| **Autenticación** | JWT (JSON Web Tokens) con middlewares de autorización por rol |
| **Seguridad** | Helmet, express-validator, CORS, control de acceso basado en roles (RBAC) |
| **Navegadores soportados** | OperaGX, Edge, Brave y navegadores modernos equivalentes |
| **Control de versiones** | Git / GitHub |
| **Gestión de tareas / cambios** | Jira |
| **Almacenamiento documental** | Google Drive |
| **Ciclo de vida** | Híbrido tradicional-Scrum (4 sprints) |
| **Arquitectura** | Multicapa: Presentación → Aplicación → Integración → Datos |

## **1.2 Objetivo del Sistema**

Crear una plataforma web para que las empresas gestionen la organización de sus propios eventos desde la inscripción hasta la logística y comunicación con los asistentes, incluyendo encuestas de retroalimentación y reportes estadísticos.

## **1.3 Alcance Funcional**

El sistema incluye las siguientes capacidades:

* Registro y afiliación de empresas con aprobación administrativa.

* Creación y publicación de eventos con fecha, lugar o URL, agenda y cupos.

* Registro en línea de asistentes con control de cupos.

* Control de asistencia y reportes de actividad.

* Comunicación mediante notificaciones y recordatorios automáticos.

* Encuestas en vivo, previas y posteriores al evento.

* Dashboard con roles diferenciados y reportes exportables.

* (SC1) Agente de inteligencia artificial generativa para redacción de mensajes y descripciones.

* (SC2) Chatbot integrado para consulta de información de eventos y preguntas frecuentes.

El sistema NO incluye en su versión 1.0:

* Gestión de pagos en línea ni pasarela de pagos.

* Integración con ERP ni sincronización automática con calendarios externos.

* Pruebas de penetración avanzadas ni alta concurrencia empresarial.

* Componentes de IA más allá de SC1 y SC2 (el recomendador SC3 queda para fases futuras).

# **2\. Arquitectura del Sistema**

## **2.1 Arquitectura por Capas**

El sistema implementa una arquitectura multicapa claramente separada:

| Capa | Descripción |
| :---- | :---- |
| **Presentación** | Aplicación web React. Gestiona vistas, componentes especializados por rol, enrutamiento mediante React Router y consumo de la API REST a través de Axios. Los componentes son diferenciados según el rol activo del usuario autenticado. |
| **Aplicación** | Backend Node.js/Express. Contiene la lógica de negocio organizada en servicios, repositorios y controladores. Aplica validaciones de datos (express-validator), middlewares de seguridad (Helmet, CORS) y autorización basada en roles vía JWT. |
| **Integración** | Exposición de la API REST bajo el prefijo /api. Gestiona la comunicación con servicios externos: SMTP de Gmail (Nodemailer) para notificaciones por correo electrónico y, con los módulos SC1/SC2, la integración con la API de IA generativa. |
| **Datos** | Base de datos MySQL 5.7+ con esquema definido según el modelo lógico y físico del proyecto. Accedida exclusivamente mediante Sequelize ORM. Incluye entidades de auditoría y notificación para trazabilidad de operaciones críticas. |

## **2.2 Flujo General de una Petición**

1. El usuario interactúa con la interfaz React (frontend).

2. React Router gestiona la navegación y renderiza el componente correspondiente al rol.

3. Axios envía la petición HTTP a los endpoints de la API REST (/api/...).

4. El middleware JWT valida el token de autenticación y extrae el rol del usuario.

5. El middleware de autorización verifica que el rol tenga permiso para la acción solicitada.

6. El controlador delega la operación al servicio correspondiente con la lógica de negocio.

7. El servicio usa el repositorio Sequelize para leer/escribir en MySQL.

8. La respuesta JSON regresa al frontend, que actualiza el estado de la vista.

9. Las operaciones críticas quedan registradas en entidades de auditoría.

## **2.3 Autenticación y Autorización**

El sistema usa JWT para la autenticación. Cada solicitud protegida debe incluir el token en el header Authorization. El backend decodifica el token para obtener el identificador y rol del usuario, y un middleware de autorización por ruta valida que el rol tenga acceso. Las contraseñas siguen criterios de fortaleza definidos (formato y longitud mínima). El control de acceso a repositorios de código también sigue RBAC: solo el equipo de desarrollo tiene permisos de escritura en ramas de desarrollo; la rama main está protegida.

# **3\. Roles del Sistema y sus Responsabilidades**

El sistema define cinco roles diferenciados. Cada rol tiene acceso exclusivamente a las funcionalidades que le corresponden, controlado por middlewares de autorización en el backend y por componentes diferenciados en el frontend.

## **3.1 Administrador del Sistema**

El Administrador es el rol con mayor nivel de acceso dentro de la plataforma. No representa a ninguna empresa en particular, sino que administra la plataforma en su totalidad. Es el único que puede crear usuarios, asignar roles, gestionar los roles del sistema y aprobar o rechazar solicitudes de afiliación de empresas.

**Capacidades exclusivas:**

* Crear nuevos usuarios con datos completos y rol asignado (HU-001).

* Modificar usuarios existentes: actualizar permisos, datos y rol (HU-002).

* Deshabilitar usuarios que ya no deben acceder al sistema; los usuarios deshabilitados no aparecen en listas ni pueden autenticarse (HU-003).

* Asignar o cambiar el rol de cualquier usuario existente; la asignación es efectiva de forma inmediata (HU-004).

* Crear los roles diferenciados del sistema con sus permisos y nivel de accesibilidad (HU-029).

* Aprobar o rechazar solicitudes de afiliación de empresas; el solicitante recibe notificación del resultado (HU-005).

Restricciones: No puede existir nombres duplicados de usuarios o roles. Solo los roles en estado activo pueden ser asignados a usuarios.

## **3.2 Gerente de Empresa**

El Gerente actúa en representación de una empresa afiliada o en proceso de afiliación. Su función principal es gestionar la identidad y los espacios físicos o virtuales de la empresa. No crea ni gestiona eventos directamente, pero configura los lugares disponibles para que los organizadores los utilicen.

**Capacidades exclusivas:**

* Enviar solicitudes de afiliación de la empresa al sistema con toda la información necesaria para verificar su identidad (HU-006). Puede consultar el estado de la solicitud en cualquier momento.

* Solicitar actualizaciones de la información de la empresa ya registrada; estas solicitudes quedan registradas y notifican a los administradores para revisión (HU-007).

* Crear ubicaciones de la empresa, especificando nombre, tipo (física o virtual), dirección o enlace; no se permiten nombres duplicados de ubicaciones por empresa (HU-030).

* Modificar ubicaciones existentes; el sistema valida que no haya conflictos con eventos activos y registra los cambios en auditoría (HU-031).

* Deshabilitar ubicaciones para evitar que se usen en nuevos eventos sin eliminarlas del historial; no se puede deshabilitar si hay eventos activos en esa ubicación (HU-032).

* Crear lugares (salas) dentro de una ubicación con nombre, capacidad máxima y equipamiento disponible; no se permiten nombres duplicados dentro de la misma ubicación (HU-033).

* Modificar lugares existentes: actualizar capacidad, equipamiento u otros datos; los cambios quedan en auditoría (HU-034).

* Deshabilitar lugares sin eliminar su historial; tampoco se puede deshabilitar si hay eventos activos asignados a ese lugar (HU-035).

Restricción crítica: Solo las empresas aprobadas por el Administrador pueden crear eventos y gestionar inscripciones. Las empresas en estado pendiente o rechazado no tienen acceso a estas funcionalidades.

## **3.3 Organizador de Eventos**

El Organizador es el actor operativo central del sistema. Pertenece a una empresa afiliada y aprobada. Es responsable de la creación, configuración, ejecución y cierre de eventos. Gestiona la comunicación con los inscritos, el control de asistencia, los reportes y las encuestas.

**Capacidades exclusivas:**

* Crear eventos con todos los campos obligatorios: fecha, lugar o URL, agenda y cupos disponibles; el evento queda visible para los usuarios según los permisos definidos (HU-008).

* Modificar información de eventos existentes; los cambios quedan reflejados inmediatamente y se notifica a los usuarios afectados (HU-009).

* Cancelar eventos desde el panel de control; se envían notificaciones automáticas a los participantes y el evento se marca como cancelado, dejando de aparecer en listados activos (HU-010).

* Consultar la lista actualizada de inscritos con estado de asistencia y datos relevantes; puede exportarla en formatos comunes como CSV (HU-012).

* Enviar notificaciones y recordatorios a los inscritos, configurando frecuencia y contenido; los usuarios los reciben en su correo registrado (HU-013).

* Obtener reportes estadísticos del evento: número de inscritos, asistentes, cancelaciones y valoración; los reportes son exportables para análisis externo (HU-014).

* Crear y administrar la agenda del evento con asignación de horas, ponentes y actividades; la agenda queda disponible para asistentes y ponentes de forma inmediata (HU-015).

* Modificar la agenda cuando sea necesario; los afectados son notificados automáticamente (HU-022).

* Eliminar actividades específicas de la agenda; la agenda se actualiza mostrando solo actividades vigentes (HU-023).

* Gestionar salas para eventos simultáneos: crear y asignar salas virtuales o físicas; el sistema previene solapamientos de horarios para la misma sala (HU-020).

* Gestionar detalles del evento en general, revisando y validando los datos del mismo (HU-021, en colaboración con el ponente).

* Crear encuestas post-evento para obtener feedback de los asistentes; las encuestas se envían automáticamente tras finalizar el evento (HU-024).

* Crear encuestas pre-evento que se activan y desactivan según la programación definida (HU-025).

* Exportar resultados de encuestas para reportes y documentación en formatos CSV, XLS o PDF (HU-028).

* (SC1) Solicitar al agente de IA una propuesta de plantilla de mensaje personalizada basada en los datos del evento (HU-040).

* (SC1) Revisar y editar el texto generado por la IA antes de usarlo o enviarlo (HU-041).

* (SC1) Incorporar las plantillas generadas por IA en las notificaciones del evento (HU-042).

* (SC1) Solicitar al agente de IA una sugerencia de descripción del evento para editar o aceptar (HU-043).

## **3.4 Ponente**

El Ponente es un experto invitado que participa en los eventos. Su rol es principalmente de consulta y de participación activa durante el evento. Puede ver la agenda y su participación asignada, proponer modificaciones a los detalles de su participación y gestionar encuestas en vivo durante sus sesiones.

**Capacidades:**

* Consultar la agenda específica del evento para planificar sus intervenciones, visualizando fechas, horas y temas asignados (HU-018).

* Solicitar modificaciones a detalles relacionados con su participación; los cambios son revisados y notificados a los organizadores (HU-021).

* Activar encuestas en vivo para los asistentes durante sus sesiones; las respuestas se recopilan en tiempo real y se muestran gráficamente (HU-026).

## **3.5 Asistente**

El Asistente es el usuario final que consume los eventos. Se auto-registra en la plataforma, busca eventos de su interés, se inscribe, participa y brinda retroalimentación. Es el rol más numeroso y el principal beneficiario de los módulos de IA y chatbot introducidos en SC1 y SC2.

**Capacidades:**

* Consultar el catálogo de eventos disponibles con filtros por fecha, tipo y estado (HU-017).

* Inscribirse en eventos disponibles; el sistema envía un correo de confirmación automático y no permite inscripciones a eventos con cupo lleno (HU-011).

* Consultar la agenda completa del evento desde su perfil, con horarios, ponentes y detalles precisos (HU-016).

* Registrar su asistencia durante el evento; el sistema la verifica, la confirma y actualiza el listado de participantes (HU-019).

* Responder encuestas desde su dispositivo; las encuestas son opcionales y el sistema confirma la recepción de la respuesta (HU-027).

* (SC2) Consultar información básica del evento mediante el chatbot integrado: fechas, horarios, ubicaciones y agenda; el chatbot responde con datos coherentes con la información de la plataforma (HU-036).

* (SC2) Realizar preguntas frecuentes al chatbot sobre el uso de la plataforma y los eventos disponibles; si el chatbot no reconoce la pregunta, informa claramente que no tiene una respuesta precisa (HU-038).

* (SC2) Acceder al chatbot de forma visible desde la interfaz principal o desde una ubicación fácilmente identificable, sin que interfiera con los flujos principales del sistema (HU-039).

## **3.6 Tabla Resumen de Capacidades por Rol**

| Funcionalidad | Admin | Gerente | Organizador | Ponente | Asistente |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Crear/modificar/deshabilitar usuarios** | ✓ | — | — | — | — |
| **Asignar roles y crear roles** | ✓ | — | — | — | — |
| **Aprobar/rechazar afiliaciones** | ✓ | — | — | — | — |
| **Solicitar y gestionar afiliación empresa** | — | ✓ | — | — | — |
| **Gestionar ubicaciones y salas empresa** | — | ✓ | — | — | — |
| **Crear, modificar, cancelar eventos** | — | — | ✓ | — | — |
| **Gestionar inscritos y reportes** | — | — | ✓ | — | — |
| **Enviar notificaciones** | — | — | ✓ | — | — |
| **Crear y modificar agenda** | — | — | ✓ | — | — |
| **Consultar agenda** | — | — | — | ✓ | ✓ |
| **Gestionar salas/alas simultáneas** | — | — | ✓ | — | — |
| **Solicitar modificar detalles evento** | — | — | — | ✓ | — |
| **Encuestas en vivo (activar)** | — | — | — | ✓ | — |
| **Crear/gestionar/exportar encuestas** | — | — | ✓ | — | — |
| **Inscribirse en eventos** | — | — | — | — | ✓ |
| **Consultar catálogo de eventos** | — | — | — | — | ✓ |
| **Registrar asistencia** | — | — | — | — | ✓ |
| **Responder encuestas** | — | — | — | — | ✓ |
| **IA generativa (SC1) — proponer mensajes/descripciones** | — | — | ✓ | — | — |
| **Chatbot (SC2) — consulta de eventos y FAQ** | — | — | — | — | ✓ |

# **4\. Módulos del Sistema — Descripción Detallada**

El sistema se estructura en cinco módulos funcionales originales (épicas EP-01 a EP-05) más dos módulos de inteligencia artificial incorporados mediante solicitudes de cambio SC1 y SC2. A continuación se describe cada módulo con detalle de flujos, reglas de negocio y comportamientos esperados.

## **4.1 Módulo EP-01: Gestión de Roles y Acceso**

### **4.1.1 Propósito**

Este módulo permite al Administrador gestionar los usuarios que pueden acceder al sistema y los roles que determinan sus capacidades. Es la capa de seguridad fundamental del sistema: sin un usuario activo con rol asignado, no es posible operar ninguna funcionalidad.

### **4.1.2 Actor Principal**

Administrador del sistema.

### **4.1.3 Historias de Usuario y Comportamientos**

**HU-001 — Crear Usuarios**

El Administrador accede al panel de gestión de usuarios y completa un formulario con: nombre completo, correo electrónico (debe ser único en el sistema), contraseña inicial con criterios de fortaleza, y rol asignado. Al confirmar, el sistema valida que no existan nombres o correos duplicados. Si la validación es exitosa, el usuario queda registrado y aparece en el listado de usuarios activos. El sistema confirma la creación con un mensaje de éxito.

**HU-002 — Modificar Usuarios**

El Administrador selecciona un usuario existente y puede modificar sus datos: nombre, correo, rol asignado y permisos. El sistema valida que los permisos modificados no generen conflictos de acceso. Al guardar, los cambios se reflejan inmediatamente en el sistema. Si el usuario tiene sesión activa, los nuevos permisos aplican en la siguiente operación que realice.

**HU-003 — Deshabilitar Usuarios**

El Administrador selecciona un usuario y ejecuta la acción de deshabilitar. El sistema solicita confirmación antes de proceder. Una vez deshabilitado, el usuario no aparece en listas activas, no puede autenticarse en el sistema y no puede ejecutar ninguna operación. Los datos históricos del usuario (registros de asistencia, inscripciones) se conservan por integridad del historial.

**HU-004 — Asignar Roles**

El Administrador puede cambiar el rol de cualquier usuario existente en cualquier momento. La asignación del nuevo rol es efectiva de forma inmediata. El sistema muestra restricciones para evitar asignaciones erróneas, por ejemplo, no permite dejar al sistema sin ningún Administrador activo. Solo se pueden asignar roles que existan y estén activos en el sistema.

**HU-029 — Crear Roles**

El Administrador puede crear nuevos roles diferenciados con sus permisos y nivel de accesibilidad. Cada rol tiene un nombre único y un conjunto de permisos que determinan qué endpoints y funcionalidades puede acceder. No se permiten nombres de rol duplicados. Una vez creado, el rol está disponible para ser asignado a usuarios.

### **4.1.4 Reglas de Negocio del Módulo**

* No se permiten nombres duplicados de usuarios.

* El correo electrónico debe ser único en todo el sistema.

* Un usuario deshabilitado no puede autenticarse ni ejecutar operaciones.

* Los roles tienen permisos diferenciados y solo los activos pueden asignarse.

* Los cambios de rol son inmediatos.

## **4.2 Módulo EP-02: Gestión de Empresas y Afiliaciones**

### **4.2.1 Propósito**

Este módulo gestiona el ciclo de vida de las empresas dentro de la plataforma. Una empresa debe pasar por un proceso de solicitud y aprobación antes de poder crear eventos. También gestiona los espacios físicos o virtuales (ubicaciones y salas/lugares) donde se realizarán los eventos.

### **4.2.2 Actores Principales**

Gerente (solicita y gestiona su empresa), Administrador (aprueba o rechaza solicitudes).

### **4.2.3 Flujo de Afiliación de Empresa**

10. El Gerente envía la solicitud de afiliación con todos los datos de la empresa necesarios para verificar su identidad.

11. El sistema registra la solicitud en estado 'Pendiente' y notifica a los Administradores disponibles.

12. El Administrador revisa la solicitud desde su panel y toma la decisión: Aprobar o Rechazar.

13. El sistema actualiza el estado de la solicitud y envía una notificación al Gerente con el resultado.

14. Si fue Aprobada: la empresa queda activa y el Gerente puede comenzar a configurar ubicaciones y el Organizador puede crear eventos.

15. Si fue Rechazada: la empresa no puede operar en la plataforma.

16. El Gerente puede consultar el estado de la solicitud en cualquier momento (HU-006).

### **4.2.4 Gestión de Ubicaciones (Gerente)**

**HU-030 — Crear Ubicaciones**

El Gerente accede a la sección de Configuración \> Ubicaciones y completa el formulario con: nombre, tipo (física/virtual) y dirección o enlace URL. El sistema valida que no existan nombres duplicados de ubicaciones dentro de la misma empresa. Al confirmar, la ubicación queda registrada y disponible para asignarse a eventos.

**HU-031 — Modificar Ubicaciones**

El Gerente selecciona una ubicación existente y puede editar los campos permitidos. El sistema valida que no haya eventos activos en conflicto con los cambios propuestos. Los cambios quedan registrados en auditoría y los organizadores de eventos activos en esa ubicación reciben notificación.

**HU-032 — Deshabilitar Ubicaciones**

El Gerente puede deshabilitar una ubicación para evitar que se use en nuevos eventos, sin eliminar el historial. El sistema solicita confirmación y bloquea la deshabilitación si hay eventos activos asignados a esa ubicación. La acción queda registrada en auditoría. Una ubicación deshabilitada no aparece como opción al crear nuevos eventos.

**HU-033 — Crear Lugares/Salas**

Dentro de una ubicación existente, el Gerente puede crear lugares (salas) especificando: nombre, capacidad máxima y equipamiento disponible. El nombre no puede repetirse dentro de la misma ubicación. La capacidad máxima del lugar es un dato crítico para el control de cupos de eventos que se realicen allí.

**HU-034 — Modificar Lugares**

El Gerente puede actualizar datos de capacidad o equipamiento de un lugar. Los cambios quedan en auditoría y se muestra confirmación de actualización exitosa.

**HU-035 — Deshabilitar Lugares**

El Gerente puede deshabilitar un lugar/sala sin perder su historial. El sistema bloquea la deshabilitación si hay eventos activos asignados a ese lugar. La acción queda en auditoría.

**HU-007 — Solicitar Actualizaciones de la Empresa**

El Gerente puede solicitar modificaciones a los datos de la empresa ya registrada (nombre, información de contacto, etc.). La solicitud queda registrada y genera una notificación a los Administradores para su revisión y validación antes de aplicarse.

### **4.2.5 Reglas de Negocio del Módulo**

* Solo las empresas en estado 'Aprobada' pueden crear eventos y gestionar inscripciones.

* Cada empresa afiliada debe tener un nombre único en el sistema.

* Las solicitudes de afiliación deben ser aprobadas o rechazadas por un Administrador.

* Las actualizaciones de información de empresas deben ser validadas por la administración.

* No se pueden deshabilitar ubicaciones o lugares con eventos activos asignados.

* No se permiten nombres duplicados de ubicaciones dentro de la misma empresa.

* No se permiten nombres duplicados de lugares dentro de la misma ubicación.

* Todas las operaciones de modificación y deshabilitación quedan registradas en auditoría.

## **4.3 Módulo EP-03: Gestión de Eventos**

### **4.3.1 Propósito**

Este es el módulo central del sistema. Gestiona el ciclo de vida completo de un evento: desde su creación por el Organizador, hasta la inscripción de asistentes, el control de asistencia, el envío de notificaciones, la gestión de salas para eventos simultáneos y la generación de reportes estadísticos.

### **4.3.2 Actores**

Organizador (crea y gestiona), Ponente (gestiona detalles de su participación), Asistente (se inscribe, consulta el catálogo, registra asistencia).

### **4.3.3 Ciclo de Vida de un Evento**

| Estado del Evento | Descripción y Transición |
| :---- | :---- |
| **Borrador** | El evento ha sido creado por el Organizador pero aún no está publicado. Puede ser editado sin restricciones. No es visible para los asistentes. |
| **Publicado** | El evento está activo y visible en el catálogo para los asistentes. Los asistentes pueden inscribirse. Se controlan los cupos disponibles. |
| **Cancelado** | El Organizador canceló el evento. El sistema envía notificaciones automáticas a todos los inscritos. El evento se marca como cancelado y desaparece de los listados activos, pero se conserva en el historial. |
| **Finalizado** | El evento concluyó. Los inscritos que asistieron ya tienen su asistencia registrada. Las encuestas post-evento pueden activarse. Los reportes estadísticos quedan disponibles. |

### **4.3.4 Historias de Usuario y Comportamientos**

**HU-008 — Crear Eventos**

El Organizador accede al formulario de creación y completa los campos obligatorios: fecha de inicio y fin, lugar (selección de ubicación/sala de la empresa) o URL (para eventos virtuales), agenda general, modalidad (presencial, virtual o híbrida) y número de cupos disponibles. Al confirmar, el evento queda en estado Borrador. El sistema valida todos los campos y confirma la creación. El Organizador puede entonces publicarlo o continuar editándolo.

**HU-009 — Modificar Eventos**

El Organizador puede editar información de un evento existente en estado Borrador o Publicado. Al guardar, los cambios se reflejan inmediatamente. Si el evento está Publicado y hay inscritos, el sistema envía notificaciones automáticas a los participantes informando sobre los cambios realizados.

**HU-010 — Cancelar Eventos**

El Organizador puede cancelar un evento desde el panel de control. El sistema solicita confirmación. Tras la cancelación, se envían notificaciones automáticas a todos los inscritos informando de la cancelación. El evento queda en estado Cancelado y no aparece en los listados activos. El historial del evento y sus inscritos se conserva.

**HU-011 — Inscribirse en Eventos (Asistente)**

El Asistente navega el catálogo de eventos y selecciona uno disponible. Hace clic en inscribirse. El sistema valida en tiempo real que queden cupos disponibles (control de concurrencia para evitar inscripciones simultáneas que excedan los cupos). Si hay cupo, la inscripción queda en estado Confirmada y el sistema envía automáticamente un correo de confirmación. Si el evento está lleno, la inscripción es rechazada con un mensaje informativo.

**HU-012 — Gestionar Lista de Inscritos**

El Organizador puede consultar el listado completo de inscritos a su evento, con estado de asistencia y datos relevantes de cada inscrito. Puede exportar la lista en formato CSV para uso externo.

**HU-013 — Enviar Notificaciones**

El Organizador puede configurar y enviar notificaciones y recordatorios a los inscritos. Puede definir la frecuencia y el contenido del mensaje. Las comunicaciones se envían al correo electrónico registrado de cada usuario inscrito mediante el servicio SMTP de Gmail (Nodemailer). Las notificaciones también se generan automáticamente al cancelar o modificar un evento.

**HU-014 — Reportes Estadísticos**

El Organizador puede acceder a un dashboard con estadísticas del evento: número total de inscritos, número de asistentes confirmados, cancelaciones y valoración general (calculada a partir de las encuestas). Los reportes son exportables para análisis externo.

**HU-017 — Consultar Catálogo de Eventos (Asistente)**

Los usuarios con rol Asistente acceden a un catálogo donde visualizan todos los eventos disponibles para inscribirse. El catálogo permite filtros por fecha, tipo de evento y estado (por ejemplo, solo eventos con cupo disponible). Muestra información resumida de cada evento.

**HU-019 — Registrar Asistencia (Asistente)**

Durante el evento, el Asistente puede registrar su asistencia desde su dispositivo. El sistema verifica que el asistente esté inscrito previamente (no se puede registrar asistencia sin inscripción previa). Confirma el registro y actualiza el listado de participantes con asistencia confirmada. Este dato alimenta los reportes estadísticos del Organizador.

**HU-020 — Gestionar Salas para Eventos Simultáneos**

Cuando hay múltiples sesiones o subevientos en paralelo, el Organizador puede crear y asignar salas (alas) físicas o virtuales para cada sesión. El sistema previene solapamientos: no permite que la misma sala esté asignada a dos sesiones con horarios que se crucen. Esta funcionalidad trabaja en conjunto con las ubicaciones y lugares creados por el Gerente.

**HU-021 — Gestionar Detalles del Evento (Ponente)**

El Ponente puede revisar los detalles de su participación asignada en el evento y solicitar modificaciones (por ejemplo, cambio de horario, ajuste de la descripción de su sesión). Estas solicitudes son revisadas por el Organizador, quien aprueba o ajusta el cambio, y el Ponente recibe notificación del resultado.

### **4.3.5 Reglas de Negocio del Módulo**

* La inscripción está limitada por la cantidad de cupos disponibles para cada evento.

* El sistema debe controlar la concurrencia en inscripciones simultáneas para evitar superar los cupos.

* Solo los asistentes inscritos previamente pueden registrar su asistencia.

* La cancelación o modificación de eventos notifica inmediatamente a todos los inscritos.

* Los eventos cancelados desaparecen de listados activos pero se conserva el historial.

* Solo las empresas aprobadas pueden tener eventos publicados.

## **4.4 Módulo EP-04: Gestión de Agenda**

### **4.4.1 Propósito**

Este módulo permite al Organizador estructurar el contenido interno de un evento mediante una agenda detallada. La agenda contiene las actividades (sesiones, charlas, talleres) con sus horarios, ponentes asignados y salas. Es visible para Asistentes y Ponentes, permitiéndoles planificar su participación.

### **4.4.2 Actores**

Organizador (crea, modifica, elimina actividades), Ponente (consulta su agenda), Asistente (consulta la agenda completa).

### **4.4.3 Historias de Usuario y Comportamientos**

**HU-015 — Crear y Administrar Agenda**

El Organizador accede a la sección de agenda del evento y puede añadir actividades. Cada actividad tiene: nombre o título, hora de inicio y fin, ponente asignado (seleccionado del sistema), sala o lugar asignado, y descripción del contenido. El sistema valida que no existan conflictos de horarios para el mismo ponente o la misma sala. La agenda queda disponible y visible para asistentes y ponentes de forma inmediata al publicarse.

**HU-016 — Consultar Agenda (Asistente)**

El Asistente puede acceder a la agenda completa del evento desde su perfil. La agenda muestra horarios, nombres de actividades, ponentes asignados y detalles de cada sesión. Esto le permite planificar qué sesiones asistirá, especialmente en eventos con sesiones simultáneas en múltiples salas.

**HU-018 — Consultar Agenda (Ponente)**

El Ponente accede a su agenda personalizada, que muestra únicamente las actividades en las que participa: fechas, horas y temas asignados. Esto le permite preparar su intervención y planificar su participación en el evento.

**HU-022 — Modificar Agenda**

El Organizador puede actualizar la agenda cuando sea necesario (cambio de horario, reasignación de ponente, cambio de sala). Los cambios quedan visibles de inmediato para todos los usuarios con acceso a la agenda. Los ponentes y asistentes afectados por los cambios reciben notificación automática.

**HU-023 — Eliminar Actividades de la Agenda**

El Organizador puede eliminar actividades específicas de la agenda. Tras la eliminación, la agenda se actualiza automáticamente y muestra solo las actividades vigentes. Los ponentes y asistentes que tenían asignada esa actividad reciben notificación del cambio.

### **4.4.4 Reglas de Negocio del Módulo**

* Debe ser posible crear agendas detalladas con asignación clara de horarios, ponentes y actividades.

* El sistema debe prevenir conflictos de horarios para un mismo ponente o una misma sala.

* Los cambios a la agenda se reflejan inmediatamente y notifican a los afectados.

* El sistema permite la gestión de salas para eventos simultáneos sin conflictos de programación.

## **4.5 Módulo EP-05: Gestión de Encuestas y Evaluación**

### **4.5.1 Propósito**

Este módulo permite al Organizador recopilar retroalimentación de los participantes en diferentes momentos del evento (antes, durante y después). Los Ponentes pueden activar encuestas en vivo durante sus sesiones. Los resultados son visualizables y exportables para análisis posterior.

### **4.5.2 Actores**

Organizador (crea, gestiona y exporta encuestas), Ponente (activa encuestas en vivo), Asistente (responde encuestas).

### **4.5.3 Tipos de Encuesta**

| Tipo | Momento de Activación | Quién la Crea / Gestiona |
| :---- | :---- | :---- |
| **Pre-evento** | Antes del evento; se activa y desactiva según la programación definida | Organizador (HU-025) |
| **En vivo** | Durante una sesión específica del evento | Ponente (HU-026); responden los Asistentes |
| **Post-evento** | Tras finalizar el evento; se envía automáticamente a los participantes | Organizador (HU-024) |

### **4.5.4 Historias de Usuario y Comportamientos**

**HU-024 — Crear Encuesta Post-Evento**

El Organizador diseña la encuesta con preguntas y opciones de respuesta. Una vez finalizado el evento, la encuesta se envía automáticamente a los participantes. Las respuestas se recopilan en el sistema para posterior análisis.

**HU-025 — Crear Encuestas Pre-Evento**

El Organizador puede diseñar y programar encuestas para ejecutarse antes del evento. Puede definir cuándo se activa y cuándo se desactiva la encuesta según la programación del evento.

**HU-026 — Encuestas en Vivo (Ponente)**

Durante su sesión, el Ponente puede activar una encuesta en vivo para que los Asistentes la respondan en tiempo real desde sus dispositivos. Las respuestas se recopilan instantáneamente y se muestran gráficamente en pantalla, permitiendo dinamismo e interacción durante la sesión.

**HU-027 — Responder Encuestas (Asistente)**

Los Asistentes pueden responder las encuestas disponibles desde su dispositivo. Las encuestas son opcionales; al responder, el sistema confirma la recepción de la respuesta. Las respuestas son anónimas o identificadas según la configuración de la encuesta.

**HU-028 — Exportar Resultados**

El Organizador puede visualizar los resultados de las encuestas y exportarlos en formatos comunes: CSV, XLS o PDF. Esto permite análisis externos y documentación de la retroalimentación recibida.

### **4.5.5 Reglas de Negocio del Módulo**

* Se pueden crear encuestas en diferentes momentos: antes, durante y después del evento.

* Las encuestas en vivo muestran resultados en tiempo real.

* Los resultados de las encuestas deben poder ser visualizados y exportados para análisis posterior.

* Las encuestas post-evento se envían automáticamente a los participantes tras finalizar el evento.

# **5\. Módulos de Inteligencia Artificial (SC1 y SC2)**

Mediante el proceso formal de gestión de cambios (solicitudes SC1 y SC2), el sistema EventPlanner incorpora dos nuevos módulos de inteligencia artificial que amplían las capacidades de la plataforma. Ambas solicitudes fueron aprobadas por el Product Owner Juan David Ortiz Cano en febrero y marzo de 2026 respectivamente.

## **5.1 SC1 — Módulo de Agente de Inteligencia Artificial Generativa**

### **5.1.1 Propósito**

Implementar un agente de IA generativa dentro de la plataforma que facilite al Organizador la redacción de contenido relacionado con la gestión de eventos: mensajes para notificaciones, descripciones de eventos y comunicaciones con los asistentes. El agente proporciona plantillas o sugerencias de texto personalizadas basadas en los datos del evento, reduciendo el esfuerzo manual del Organizador y mejorando la calidad de la comunicación.

### **5.1.2 Actor Principal**

Organizador de eventos (con permisos sobre los eventos creados o gestionados).

### **5.1.3 Consideraciones Técnicas**

La implementación se basa en la integración con una API de IA generativa externa mediante tokens. El servicio tiene un número limitado de tokens de consumo (suscripción paga). Esto impone la evaluación constante de los costos y capacidades del servicio. Las sugerencias de la IA no se envían automáticamente; siempre requieren revisión y aprobación del Organizador antes de usarse.

### **5.1.4 Historias de Usuario y Comportamientos**

**HU-040 — Propuesta de Mensaje Personalizado por IA**

El Organizador, desde el módulo de gestión de un evento específico, puede solicitar al sistema una propuesta de mensaje generada por IA. El sistema recopila los datos disponibles del evento (nombre, fecha, lugar, agenda, descripción existente) y los envía a la API de IA generativa. La IA retorna un texto de propuesta personalizado. Este texto se presenta al Organizador como borrador editable. La funcionalidad está disponible exclusivamente para eventos sobre los que el Organizador tiene permisos de gestión.

**Criterios de aceptación:**

* El sistema permite solicitar una propuesta de mensaje a partir de los datos del evento.

* El contenido generado sirve como base editable por el usuario antes de usarlo.

* La funcionalidad está disponible solo para eventos con permisos del usuario autenticado.

**HU-041 — Revisión y Modificación del Texto Generado**

Una vez que la IA entrega la propuesta de texto, el Organizador puede editarla manualmente en un editor de texto integrado en la interfaz. El texto modificado es la versión final que el Organizador puede guardar o usar. El sistema conserva la versión final aprobada. La propuesta original de la IA no se envía, guarda ni usa automáticamente sin la validación explícita del responsable.

**Criterios de aceptación:**

* El texto generado por la IA puede ser editado manualmente antes de guardarse o usarse.

* El sistema conserva la versión final aprobada por el usuario.

* La sugerencia no se envía automáticamente sin validación del responsable.

**HU-042 — Incorporar Plantillas IA en Notificaciones del Evento**

El Organizador puede tomar el texto aprobado (proveniente de la IA o editado manualmente) e incorporarlo directamente como contenido de una notificación del evento. Esta notificación puede estar asociada a la creación, modificación o cancelación del evento. El sistema preserva el contexto del evento (a quién va dirigido, tipo de notificación) y el mensaje final queda registrado como parte del envío realizado.

**Criterios de aceptación:**

* El sistema permite usar el contenido sugerido en notificaciones asociadas a creación, modificación o cancelación de eventos.

* La notificación conserva el contexto del evento y el destinatario correspondiente.

* El mensaje final queda registrado como parte del envío realizado.

**HU-043 — Sugerencia de Descripción del Evento**

El Organizador puede solicitar al agente de IA que genere o mejore la descripción del evento. El sistema toma los datos del evento (nombre, tipo, fecha, agenda, lugar) y solicita a la API de IA una propuesta de descripción clara, comunicativa y bien estructurada. El Organizador puede aceptar la propuesta, editarla o descartarla completamente. La descripción final debe ser compatible con la estructura existente del módulo de eventos.

**Criterios de aceptación:**

* El sistema permite generar una sugerencia de descripción a partir de los datos del evento.

* El usuario puede aceptar, editar o descartar la propuesta.

* La descripción final es compatible con la estructura del módulo de eventos.

### **5.1.5 Flujo Completo del Módulo SC1**

17. El Organizador navega al detalle de un evento de su propiedad.

18. Accede a la opción 'Asistente de IA' o 'Generar contenido con IA'.

19. Selecciona el tipo de contenido: mensaje de notificación o descripción del evento.

20. El frontend envía los datos del evento al backend a través de un endpoint específico.

21. El backend construye el prompt con los datos del evento y realiza la llamada a la API de IA generativa externa.

22. La API retorna el texto generado; el backend lo devuelve al frontend.

23. El frontend presenta el texto en un editor editable para el Organizador.

24. El Organizador revisa el texto, lo edita si es necesario y lo aprueba.

25. El Organizador puede guardar el texto como descripción del evento o incorporarlo en una notificación.

26. Si lo usa en una notificación, el sistema envía la notificación a los destinatarios correspondientes y registra el envío.

## **5.2 SC2 — Módulo de Chatbot Integrado**

### **5.2.1 Propósito**

Implementar un chatbot integrado en la plataforma orientado principalmente al Asistente, con el objetivo de fortalecer la comunicación y mejorar la experiencia de los participantes. El chatbot proporciona información automática y en tiempo real sobre los eventos (fechas, horarios, ubicaciones, agenda, requisitos de inscripción) y resuelve preguntas frecuentes sobre el uso de la plataforma, sin depender de atención manual.

### **5.2.2 Actor Principal**

Asistente. El chatbot es accesible para todos los usuarios autenticados que consulten información de eventos.

### **5.2.3 Consideraciones Técnicas**

El chatbot se integra con un agente de IA generativa (posiblemente el mismo servicio que SC1) para procesar el lenguaje natural de las preguntas del usuario y generar respuestas coherentes. Las respuestas del chatbot se basan exclusivamente en la información disponible en la plataforma (datos de eventos, agenda, ubicaciones). Si el chatbot no reconoce una pregunta o no tiene datos suficientes, debe indicarlo de forma clara y amigable.

### **5.2.4 Historias de Usuario y Comportamientos**

**HU-036 — Consulta de Información Básica del Evento**

El Asistente puede abrir el chatbot e ingresar una pregunta en lenguaje natural sobre un evento específico. El chatbot accede a los datos del evento en la plataforma y responde con información actualizada sobre: fechas de inicio y fin, horarios de actividades, ubicación o enlace del evento, agenda de sesiones. Las respuestas son comprensibles, coherentes con los datos reales del sistema y no inventan información.

**Criterios de aceptación:**

* El chatbot responde consultas relacionadas con fechas, horarios, ubicaciones y agenda usando información disponible en la plataforma.

* Las respuestas son comprensibles y coherentes con los datos del evento.

**HU-038 — Preguntas Frecuentes sobre la Plataforma**

El Asistente puede usar el chatbot para hacer preguntas frecuentes sobre cómo funciona la plataforma: cómo inscribirse en un evento, cómo cancelar una inscripción, cómo acceder a la agenda, cómo responder una encuesta, etc. El chatbot responde con orientación clara sobre el funcionamiento básico. Si no reconoce la pregunta o no tiene información suficiente, informa al usuario de forma transparente que no cuenta con una respuesta precisa en ese momento.

**Criterios de aceptación:**

* El chatbot responde preguntas frecuentes asociadas a la plataforma y funcionamiento básico.

* Si no reconoce una pregunta, indica de forma clara que no tiene una respuesta precisa.

**HU-039 — Accesibilidad del Chatbot en la Interfaz**

El chatbot debe estar disponible desde la interfaz principal de la plataforma o desde una ubicación fácilmente identificable (por ejemplo, un botón flotante o un widget en la esquina de la pantalla). Su presencia no debe interferir con los flujos principales del sistema: no bloquea formularios, no cubre contenido crítico y puede minimizarse fácilmente.

**Criterios de aceptación:**

* El chatbot está disponible desde la interfaz principal o desde una ubicación fácilmente identificable.

* Su acceso no interfiere con los flujos principales del sistema.

### **5.2.5 Flujo de Interacción con el Chatbot**

27. El usuario (Asistente) ve el widget del chatbot en la interfaz principal.

28. Hace clic para abrir el panel del chatbot.

29. Escribe su pregunta en lenguaje natural.

30. El frontend envía el mensaje al backend a través del endpoint del chatbot.

31. El backend enriquece la consulta con datos del contexto: eventos disponibles, agenda, ubicaciones (recuperados de la base de datos).

32. El backend realiza la llamada a la API de IA generativa con el contexto enriquecido.

33. La IA genera una respuesta en lenguaje natural basada en los datos del sistema.

34. El backend devuelve la respuesta al frontend.

35. El chatbot muestra la respuesta al usuario con el formato adecuado.

36. Si la pregunta no pudo ser respondida, el chatbot lo indica claramente y puede sugerir al usuario que contacte con el organizador del evento.

## **5.3 SC3 — Algoritmo de Recomendación (Propuesto para Fases Futuras)**

La solicitud de cambio SC3 propone la implementación de un algoritmo de recomendación que sugiera eventos personalizados a los usuarios según sus intereses, historial de interacción o preferencias registradas. Esta funcionalidad fue aprobada conceptualmente pero no tiene historias de usuario asignadas en el rango HU-036 a HU-043 del backlog actual, por lo que se considera una funcionalidad de fases posteriores de evolución del sistema. No forma parte del alcance del sistema versión 1.0.

# **6\. Interacciones Entre Roles — Flujos Transversales**

## **6.1 Flujo Completo: De la Afiliación de la Empresa a la Finalización del Evento**

A continuación se describe el flujo transversal más completo del sistema, que involucra a todos los roles desde la incorporación de una empresa hasta el cierre de un evento con retroalimentación:

| \# | Actor | Acción y Resultado |
| :---- | :---- | :---- |
| **1** | **Gerente** | Envía la solicitud de afiliación de la empresa con todos los datos de identidad. |
| **2** | **Sistema** | Registra la solicitud en estado Pendiente y notifica al Administrador. |
| **3** | **Administrador** | Revisa la solicitud y la aprueba. La empresa queda en estado Aprobada. |
| **4** | **Sistema** | Notifica al Gerente que la empresa fue aprobada. |
| **5** | **Gerente** | Crea las ubicaciones y salas/lugares disponibles para sus eventos. |
| **6** | **Organizador** | Crea un evento con fecha, lugar (seleccionado de las ubicaciones del Gerente), agenda y cupos. |
| **7** | **Organizador** | (Opcional SC1) Solicita a la IA una descripción o mensaje para el evento. Revisa y aprueba el texto. |
| **8** | **Organizador** | Publica el evento. Queda visible en el catálogo de asistentes. |
| **9** | **Organizador** | Crea la agenda con actividades, horarios y ponentes asignados. |
| **10** | **Ponente** | Consulta su agenda para planificar su intervención. |
| **11** | **Asistente** | (Opcional SC2) Consulta información del evento via chatbot. |
| **12** | **Asistente** | Navega el catálogo y se inscribe en el evento. Recibe correo de confirmación. |
| **13** | **Organizador** | Envía notificaciones/recordatorios a los inscritos antes del evento. |
| **14** | **Asistente** | Llega al evento y registra su asistencia en la plataforma. |
| **15** | **Ponente** | Durante su sesión, activa una encuesta en vivo. Los asistentes responden en tiempo real. |
| **16** | **Asistente** | Responde la encuesta en vivo desde su dispositivo. |
| **17** | **Organizador** | Al finalizar el evento, el sistema activa automáticamente las encuestas post-evento. |
| **18** | **Asistente** | Responde la encuesta post-evento. |
| **19** | **Organizador** | Consulta los reportes estadísticos: asistentes, valoraciones, exporta resultados de encuestas. |
| **20** | **Sistema** | Conserva el historial completo: inscripciones, asistencias, respuestas de encuestas, notificaciones enviadas. |

## **6.2 Flujo de Gestión de Cambios en un Evento en Curso**

37. El Organizador detecta la necesidad de cambiar el horario o lugar de una sesión.

38. Accede a la agenda del evento y modifica la actividad afectada.

39. El sistema valida que el nuevo horario no genere conflictos con el ponente o la sala.

40. Si no hay conflictos, guarda los cambios inmediatamente.

41. El sistema envía automáticamente notificaciones a los asistentes inscritos y al ponente afectado informando del cambio.

42. Si el Ponente detecta un problema adicional, puede solicitar ajustes adicionales a través de HU-021.

## **6.3 Notificaciones Automáticas del Sistema**

El sistema genera y envía notificaciones automáticas vía SMTP (Gmail/Nodemailer) en los siguientes eventos:

| Evento Disparador | Destinatario y Contenido |
| :---- | :---- |
| **Resultado de solicitud de afiliación** | Gerente — Aprobación o rechazo de la solicitud de afiliación. |
| **Inscripción exitosa a un evento** | Asistente — Confirmación de inscripción con datos del evento. |
| **Cancelación de evento** | Todos los inscritos — Notificación de cancelación del evento. |
| **Modificación de evento publicado** | Todos los inscritos — Información sobre los cambios realizados. |
| **Cambio en la agenda** | Asistentes y Ponente afectado — Información sobre el cambio de horario o sesión. |
| **Envío de recordatorio configurado por Organizador** | Todos los inscritos — Recordatorio previo al evento. |
| **Activación de encuesta post-evento** | Todos los asistentes con asistencia registrada. |
| **Registro de usuario nuevo** | Administrador — Notificación interna según configuración. |

# **7\. Reglas de Negocio Consolidadas**

El sistema aplica las siguientes reglas de negocio de forma consistente en todos los módulos:

## **7.1 Reglas de Unicidad**

* No se permiten nombres duplicados de usuarios en el sistema.

* El correo electrónico de cada usuario debe ser único en todo el sistema.

* No se permiten nombres duplicados de roles.

* Cada empresa afiliada debe tener un nombre único en el sistema.

* No se permiten nombres duplicados de eventos dentro del contexto de una empresa.

* No se permiten nombres duplicados de ubicaciones dentro de la misma empresa.

* No se permiten nombres duplicados de lugares/salas dentro de la misma ubicación.

## **7.2 Reglas de Acceso y Autorización**

* El acceso a todas las funcionalidades del sistema requiere autenticación mediante JWT.

* Cada rol solo puede acceder a las funcionalidades explícitamente asignadas a él.

* Solo las empresas en estado Aprobada pueden crear eventos y gestionar inscripciones.

* Un usuario deshabilitado no puede autenticarse ni ejecutar ninguna operación.

* Los cambios de rol son efectivos de forma inmediata.

* Solo el equipo de desarrollo puede hacer commits en ramas de desarrollo; la rama main está protegida.

## **7.3 Reglas de Control de Eventos e Inscripciones**

* La inscripción está limitada por la cantidad de cupos disponibles; el sistema aplica control de concurrencia para evitar superar los cupos.

* Un asistente solo puede registrar asistencia si está inscrito previamente en el evento.

* La cancelación o modificación de eventos se refleja inmediatamente y notifica a los inscritos.

* Los eventos cancelados desaparecen de los listados activos pero se conserva el historial.

* Los usuarios pueden auto-registrarse a eventos abiertos; la confirmación se envía automáticamente.

## **7.4 Reglas de Gestión de Espacios**

* No se pueden deshabilitar ubicaciones con eventos activos asignados.

* No se pueden deshabilitar lugares/salas con eventos activos asignados.

* El sistema previene solapamientos de horarios para una misma sala.

* Se permite gestión de salas para eventos simultáneos sin conflictos de programación.

## **7.5 Reglas de IA y Chatbot**

* (SC1) El contenido generado por la IA es siempre un borrador editable; nunca se envía o guarda automáticamente sin aprobación del Organizador.

* (SC1) La funcionalidad de IA generativa está disponible exclusivamente para eventos sobre los que el Organizador tiene permisos.

* (SC2) Las respuestas del chatbot se basan exclusivamente en datos reales disponibles en la plataforma; no inventa información.

* (SC2) Si el chatbot no puede responder una pregunta, lo informa de forma clara y transparente.

* (SC2) El chatbot no interfiere con los flujos principales de la interfaz del usuario.

## **7.6 Reglas de Trazabilidad y Auditoría**

* El sistema mantiene un historial completo de eventos, inscripciones, asistencias, encuestas y comunicaciones.

* Las operaciones de modificación y deshabilitación de ubicaciones y salas quedan registradas en auditoría.

* Todas las solicitudes de cambio sobre ítems de configuración deben tramitarse mediante el proceso formal del CCB.

* Solo los cambios en estado Aprobado por el CCB pueden implementarse y afectar una línea base.

* Los resultados de encuestas deben poder visualizarse y exportarse para análisis posterior.

# **8\. Entidades Principales del Sistema**

A continuación se describen las entidades principales que el sistema persiste en la base de datos MySQL, inferidas del análisis de los módulos y sus reglas de negocio:

| Entidad | Atributos / Descripción Principal |
| :---- | :---- |
| **Usuario** | ID, nombre, correo (único), contraseña (hash), estado (activo/deshabilitado), rol asignado, empresa asociada, fecha de creación. |
| **Rol** | ID, nombre (único), lista de permisos/funcionalidades autorizadas, estado (activo). |
| **Empresa** | ID, nombre (único), datos de contacto, estado (pendiente/aprobada/rechazada), gerente responsable. |
| **Ubicación** | ID, nombre (único por empresa), tipo (física/virtual), dirección o URL, empresa propietaria, estado (activa/deshabilitada). |
| **Lugar / Sala** | ID, nombre (único por ubicación), capacidad máxima, equipamiento, ubicación asociada, estado (activo/deshabilitado). |
| **Evento** | ID, nombre, descripción, fecha inicio, fecha fin, modalidad (presencial/virtual/híbrida), cupos disponibles, cupos ocupados, estado (borrador/publicado/cancelado/finalizado), organizador, empresa, ubicación o URL. |
| **Inscripción** | ID, asistente (usuario), evento, fecha de inscripción, estado (confirmada/cancelada), asistencia registrada (booleano). |
| **Actividad (Agenda)** | ID, nombre, descripción, hora inicio, hora fin, ponente asignado, sala/lugar asignado, evento, estado. |
| **Encuesta** | ID, título, tipo (pre/durante/post), estado (activa/cerrada), evento asociado, creador, preguntas. |
| **Respuesta de Encuesta** | ID, encuesta, usuario respondente, respuestas por pregunta, fecha de respuesta. |
| **Notificación** | ID, tipo, contenido del mensaje, evento asociado, destinatarios, fecha de envío, estado de envío. |
| **Auditoría** | ID, operación realizada, entidad afectada, usuario que realizó la operación, fecha y hora, datos anteriores y nuevos. |
| **Solicitud de Cambio (CRF)** | ID, descripción del cambio, justificación, solicitante, impactos, estado, decisión del CCB, fecha. |

# **9\. Inventario Completo de Historias de Usuario**

El sistema cuenta con 35 historias de usuario en su versión original más 7 historias adicionales de los módulos SC1 y SC2, para un total de 42 historias de usuario.

| HU | Módulo | Actor | Resumen |
| :---- | :---- | :---- | :---- |
| **HU-001** | EP-01 | Administrador | Crear usuarios en el sistema con rol asignado. |
| **HU-002** | EP-01 | Administrador | Modificar usuarios existentes: datos, permisos y rol. |
| **HU-003** | EP-01 | Administrador | Deshabilitar usuarios inactivos. |
| **HU-004** | EP-01 | Administrador | Asignar o cambiar el rol de un usuario. |
| **HU-005** | EP-02 | Administrador | Aprobar o rechazar solicitudes de afiliación de empresas. |
| **HU-006** | EP-02 | Gerente | Solicitar y gestionar la afiliación de la empresa. |
| **HU-007** | EP-02 | Gerente | Solicitar actualizaciones de la información de la empresa. |
| **HU-008** | EP-03 | Organizador | Crear eventos con fecha, lugar/URL, agenda y cupos. |
| **HU-009** | EP-03 | Organizador | Modificar información de eventos existentes. |
| **HU-010** | EP-03 | Organizador | Cancelar eventos y notificar a los inscritos. |
| **HU-011** | EP-03 | Asistente | Inscribirse en eventos disponibles. |
| **HU-012** | EP-03 | Organizador | Gestionar lista de inscritos; exportar en CSV. |
| **HU-013** | EP-03 | Organizador | Enviar notificaciones y recordatorios a los inscritos. |
| **HU-014** | EP-03 | Organizador | Obtener reportes estadísticos del evento. |
| **HU-015** | EP-04 | Organizador | Crear y administrar la agenda del evento. |
| **HU-016** | EP-04 | Asistente | Consultar la agenda completa del evento. |
| **HU-017** | EP-03 | Asistente | Consultar el catálogo de eventos disponibles. |
| **HU-018** | EP-04 | Ponente | Consultar la agenda personal de sus intervenciones. |
| **HU-019** | EP-03 | Asistente | Registrar asistencia al evento. |
| **HU-020** | EP-03 | Organizador | Gestionar salas/alas para eventos simultáneos. |
| **HU-021** | EP-03 | Ponente | Solicitar modificaciones a los detalles de su participación. |
| **HU-022** | EP-04 | Organizador | Modificar la agenda del evento. |
| **HU-023** | EP-04 | Organizador | Eliminar actividades específicas de la agenda. |
| **HU-024** | EP-05 | Organizador | Crear encuestas post-evento. |
| **HU-025** | EP-05 | Organizador | Crear encuestas pre-evento programadas. |
| **HU-026** | EP-05 | Ponente | Activar y gestionar encuestas en vivo durante la sesión. |
| **HU-027** | EP-05 | Asistente | Responder encuestas desde el dispositivo. |
| **HU-028** | EP-05 | Organizador | Exportar resultados de encuestas (CSV, XLS, PDF). |
| **HU-029** | EP-01 | Administrador | Crear roles diferenciados con permisos específicos. |
| **HU-030** | EP-02 | Gerente | Crear ubicaciones para la empresa. |
| **HU-031** | EP-02 | Gerente | Modificar ubicaciones de la empresa. |
| **HU-032** | EP-02 | Gerente | Deshabilitar ubicaciones de la empresa. |
| **HU-033** | EP-02 | Gerente | Crear lugares/salas dentro de una ubicación. |
| **HU-034** | EP-02 | Gerente | Modificar datos de un lugar/sala. |
| **HU-035** | EP-02 | Gerente | Deshabilitar lugares/salas sin eliminar su historial. |
| **HU-036** | SC2 Chatbot | Asistente | Consultar información básica del evento via chatbot. |
| **HU-038** | SC2 Chatbot | Asistente | Realizar preguntas frecuentes al chatbot. |
| **HU-039** | SC2 Chatbot | Asistente | Acceder al chatbot de forma visible en la interfaz. |
| **HU-040** | SC1 IA Gen. | Organizador | Solicitar propuesta de mensaje personalizado a la IA. |
| **HU-041** | SC1 IA Gen. | Organizador | Revisar y modificar el texto generado por la IA. |
| **HU-042** | SC1 IA Gen. | Organizador | Incorporar plantillas IA en notificaciones del evento. |
| **HU-043** | SC1 IA Gen. | Organizador | Solicitar a la IA una sugerencia de descripción del evento. |

# **10\. Requisitos Funcionales y No Funcionales**

## **10.1 Requisitos Funcionales**

| ID | Descripción | Prioridad |
| :---- | :---- | :---- |
| **RF-01** | Creación y publicación de eventos (fecha, lugar/URL, agenda, cupos). | Alta |
| **RF-02** | Inscripción en línea de asistentes a eventos. | Alta |
| **RF-03** | Gestión y envío de notificaciones y recordatorios a participantes. | Alta |
| **RF-04** | Gestión de agenda del evento (sesiones, horarios, ponentes). | Alta |
| **RF-05** | Control y registro de asistencia (check-in, seguimiento de participantes). | Alta |
| **RF-06** | Dashboard con estadísticas y reportes de actividad y desempeño del evento. | Media |
| **RF-07** | Gestión de usuarios y roles (crear, modificar, eliminar, asignar permisos). | Alta |
| **RF-08** | Gestión de empresas y afiliaciones (solicitar, aprobar, actualizar). | Alta |
| **RF-09** | Gestión de salas para eventos simultáneos y gestión de conflictos de programación. | Media |
| **RF-10** | Creación y administración de encuestas (previas, durante y posteriores al evento). | Media |
| **RF-11** | Visualización y exportación de resultados de encuestas y reportes estadísticos. | Baja |
| **RF-12** | Validación y gestión de participantes. | Baja |

## **10.2 Requisitos No Funcionales**

| ID | Atributo de Calidad | Descripción | Prioridad |
| :---- | :---- | :---- | :---- |
| **RNF-01** | **Usabilidad** | Interfaz intuitiva y accesible en dispositivos móviles y de escritorio. | Alta |
| **RNF-02** | **Disponibilidad / Confiabilidad** | Sistema disponible y estable incluso en eventos con alta participación. | Alta |
| **RNF-03** | **Seguridad** | Control de autenticación (JWT), cifrado, roles y permisos diferenciados. | Alta |
| **RNF-04** | **Rendimiento** | Tiempos de respuesta aceptables bajo carga normal. | Media |
| **RNF-05** | **Compatibilidad** | Compatibilidad con navegadores modernos (Edge, Chrome, Brave, OperaGX). | Alta |
| **RNF-06** | **Trazabilidad** | Registro completo de eventos, inscripciones, asistencias y comunicaciones. | Media |
| **RNF-07** | **Integrabilidad** | Integración con servicios externos vía API sin dependencia exclusiva. | Media |
| **RNF-08** | **Cumplimiento normativo** | Cumplimiento de normativas vigentes de privacidad y protección de datos. | Alta |
| **RNF-09** | **Mantenibilidad** | Mantenimiento sencillo y posibilidad de evolución sin grandes impactos. | Media |
| **RNF-10** | **Control de concurrencia** | Control de inscripciones simultáneas para evitar superar cupos disponibles. | Media |

# **11\. Equipo del Proyecto y Roles de Gestión**

| Persona | Rol en el Proyecto | Responsabilidades Principales |
| :---- | :---- | :---- |
| **Juan David Ortiz Cano** | Product Owner / Líder de Proyecto | Aprueba el plan de gestión, preside el CCB, prioriza solicitudes de cambio, valida baselines funcionales del producto. |
| **Jorge Andrés Forero Serrano** | Gestor de Configuración / Líder Tecnológico | Define el plan de configuración, administra repositorios, lidera auditorías, consolida el CMR, coordina reportes de estado. |
| **María Fernanda Corzo Castro** | QA Lead / Auditor de Configuración | Define estrategia de pruebas, verifica trazabilidad, ejecuta auditorías funcionales y físicas, valida evidencias por iteración. |
| **Alison Brigitte Martínez Machado** | Equipo de Desarrollo | Versiona código, registra solicitudes de cambio, actualiza documentación técnica, mantiene integridad de ramas. |
| **Jesús David Barrera Montes** | Equipo de Desarrollo | Implementa historias de usuario, aplica políticas de versionado, mantiene ramas del repositorio. |
| **Viviana Katherine Ortiz Gáfaro** | Equipo de Desarrollo | Implementa componentes frontend y backend, aplica políticas de versionado, mantiene ramas del repositorio. |
| **Ing. Judith del Pilar Rodríguez** | Auditor Académico | Audita cumplimiento del plan a nivel académico, revisa coherencia entre artefactos y producto, proporciona visto bueno académico. |
| **Ing. Jessica Lorena Leal** | Auditor Académico | Audita cumplimiento del plan a nivel académico, supervisa el proyecto desde la perspectiva del curso. |

## **11.1 Entornos de Desarrollo y Despliegue**

| Entorno | Descripción |
| :---- | :---- |
| **Desarrollo local** | Cada desarrollador trabaja en su entorno local con la misma configuración de stack tecnológico. |
| **Testing / Preproducción** | Entorno compartido de pruebas donde se validan las funcionalidades antes de la liberación. |
| **Producción** | Entorno final del sistema; las liberaciones llegan aquí solo después de ser auditadas y aprobadas por el CCB. |

## **11.2 Plan de Pruebas — Distribución por Sprint**

| Sprint | Épicas | Historias de Usuario Foco | Tipo de Pruebas |
| :---- | :---- | :---- | :---- |
| **Sprint 1 (Sem. 8-9)** | EP-01, EP-02 | HU-001 a HU-007, HU-029 | Unitarias y funcionales: autenticación, CRUD usuarios, asignación de roles, flujo de afiliación. |
| **Sprint 2 (Sem. 10-11)** | EP-02, EP-03 | HU-030 a HU-035, HU-008 a HU-013, HU-017, HU-019, HU-020 | Funcionales e integrales: empresas, ubicaciones, eventos, inscripciones, notificaciones, asistencia básica. |
| **Sprint 3 (Sem. 12-13)** | EP-03, EP-04 | HU-014, HU-021, HU-015, HU-016, HU-018, HU-022, HU-023 | Integración y sistema: agendas, ponentes, reportes, notificaciones integradas. Énfasis en regresión. |
| **Sprint 4 (Sem. 14-15)** | EP-05, SC1, SC2 | HU-024 a HU-028, HU-036, HU-038 a HU-043 | Funcionales y aceptación: encuestas, chatbot, IA generativa. Integración final y regresión global. |

*— Fin del Informe Contextual del Sistema EventPlanner —*

*Documento generado para uso de sistemas de IA. Basado exclusivamente en documentación oficial del proyecto.*