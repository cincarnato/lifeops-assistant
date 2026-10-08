# Centro de comando

Entrada: `/command-center`, disponible desde el menú para usuarios autenticados. Cada pestaña y operación respeta el permiso de su entidad.

Implementa la base recomendada de `reqs/command-center-prompt-draft.md`: tareas, programadas, jobs IA, proyectos, objetivos, contactos, clientes y memorias. No incorpora la pestaña Hoy, Kanban ni ejecución manual de jobs.

## Componentes y reutilización

La composición y sus subcomponentes están en `front/src/modules/lifeops/components/command-center/`. `useCommandCenter` mantiene búsqueda, filtros, página, orden y resultados por pestaña durante la visita. La URL conserva pestaña, preset y contexto de relaciones. Carga únicamente la lista activa y las consultas pequeñas necesarias para el resumen.

Se reutilizan providers, definiciones de campos y validaciones de los CRUDs, `CrudForm`, `CrudFormField`, comboboxes, `TaskView` y `ContactForm`. Los formularios utilizan stores Drax separados de los CRUDs de otras páginas. La captura inicial de tarea pide título; la de memoria pide título, contenido y tipo. Los campos adicionales se pueden desplegar.

La edición envía PATCH con los campos modificados. No envía runtime, historial de estados ni campos readonly. Los cambios de estado pasan por el servicio de tareas. Activar o pausar una programación usa sus endpoints existentes; activar o pausar un job modifica su configuración y no lo ejecuta.

## Resúmenes

Las seis métricas usan los totales de la API paginada, con los mismos filtros que sus destinos: vencidas, para hoy, urgentes, programadas activas, jobs activos y jobs con último resultado fallido. Pendiente significa `completedAt` y `archivedAt` vacíos; el operador `empty` contempla campos nulos o ausentes.

Los límites de hoy son `[00:00, 00:00 del día siguiente)` en `America/Argentina/Buenos_Aires`. La unión de vencimiento/programación usa los grupos OR existentes de Drax: `(A y B) o (C y D)` se expresa como `(A o C) y (A o D) y (B o C) y (B o D)`, donde cada par corresponde a los límites de una fecha. Así se pagina y cuenta una sola consulta, sin duplicar tareas ni descargar el inventario.

La memoria aleatoria consulta el total y después una página de un elemento con orden estable por `_id`. Evita el índice anterior cuando hay más de una memoria. Cambios concurrentes entre conteo y lectura pueden desplazar el índice; si la página queda vacía usa el primer registro accesible. Refrescar otras secciones conserva la memoria elegida.

La tarea destacada es la pendiente con vencimiento más antiguo, o la urgente más antigua si no hay vencidas. La próxima automatización compara las próximas fechas futuras conocidas de reglas y jobs activos. No infiere una ejecución en curso a partir de `active`.

## Límites y validación

Los jobs muestran configuración y runtime. La subvista de ejecuciones queda pendiente del contrato backend que delimite acceso por propietario del job. Abrir o refrescar el centro consulta datos; no ejecuta IA, jobs ni regeneración del plan diario.

MongoDB resuelve los filtros anidados y las relaciones de esta vista. Los repositorios SQLite actuales tienen limitaciones previas con filtros sobre JSON/arrays: por ejemplo, `runtime.lastStatus`, próxima corrida y pertenencia a objetivos/tags. La comprobación SQLite cubre los predicados escalares de fechas/estados de tareas; no certifica esos flujos anidados. Un error de consulta permanece visible y recuperable en su sección.

La interfaz contempla errores y reintento por sección, ausencia de registros, temas claro/oscuro y listas móviles. En móvil las métricas se desplazan horizontalmente y las tarjetas de contexto se despliegan para conservar espacio de trabajo.

Validación: TypeScript y build del frontend; smoke de navegador con API simulada para captura, edición, relaciones, permisos, errores y layouts; comprobación de 256 combinaciones de fechas/estados con los filtros reales de Drax en MongoDB temporal y SQLite en memoria. Las pruebas de navegador usan fixtures explícitos y no escriben datos de producción.
