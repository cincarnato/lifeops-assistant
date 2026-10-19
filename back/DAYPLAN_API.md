# DayPlan: planificación y agenda

## Contrato

Se conserva el prefijo existente **`/api/day-plans`**, no `/api/dayplans`. Todos los endpoints requieren autenticación. El usuario se obtiene de RBAC, nunca del body/query.

`plan.date` sigue representando una **fecha civil UTC**; planning/generate y la UI (formateando con `timeZone: 'UTC'`) mantienen esa convención. No hay migración ni desplazamiento de fechas de planes.

La fecha de reserva es independiente de `plan.date`: se puede reservar hoy una tarea de un plan de ayer. Para disponibilidad, `date` es el día local deseado y `utcOffsetMinutes` es opcional, entero entre **-840 y 840**, por defecto **0**, con el signo de `Date.getTimezoneOffset()` del navegador (UTC menos hora local). Ejemplos: UTC−3 → `180`; UTC+5:30 → `-330`.

- Inicio del día consultado: medianoche UTC de `date` **más** `utcOffsetMinutes` minutos.
- Fin: inicio más 24 horas. Se usa un offset fijo para toda la consulta, no una zona IANA con reglas DST.
- Los slots comienzan en horas exactas **locales**, duran 60 minutos y no tienen ventana laboral implícita.
- En schedule-task, el día local se calcula como `startAt - utcOffsetMinutes` y se consulta disponibilidad con ese mismo offset; no se compara con `plan.date`.
- Las respuestas `startAt`, `endAt` y `scheduledDate` siguen siendo instantes ISO UTC. El offset debe ser el correspondiente al día de reserva.

| Método y ruta | Entrada | Respuesta 200 | Permisos |
| --- | --- | --- | --- |
| `GET /api/day-plans/planning?date=YYYY-MM-DD` | Query `date` | `DayPlan` del usuario o `null` | `dayplan:view` |
| `POST /api/day-plans/:id/proposals` | `{ "mode": "more" }` o `{ "mode": "other" }` | `DayPlan` actualizado con tareas pobladas | `dayplan:update` + ownership |
| `POST /api/day-plans/generate` | `{ "date": "2030-01-02" }` | `DayPlan` existente intacto o nuevo | `dayplan:create` |
| `GET /api/day-plans/available-slots?date=YYYY-MM-DD&utcOffsetMinutes=-330` | Query `date`, `utcOffsetMinutes` opcional | `{ "slots": [{ "startAt": "2030-01-02T04:30:00.000Z", "endAt": "2030-01-02T05:30:00.000Z" }] }` | `dayplan:view` |
| `POST /api/day-plans/:id/schedule-task` | `{ "taskId": "<ObjectId>", "startAt": "2030-01-03T04:30:00Z", "utcOffsetMinutes": -330 }` | **DayPlan actualizado**, con tareas pobladas; también en reintentos | `dayplan:update` y `task:update` |

Se conserva `POST /api/day-plans/generate/today`, con la misma protección contra regeneración destructiva.

### Prioridades y confirmación

`tasks[].priority` es opcional y admite `null`, `A1`, `A2` o `A3`. No cambia `Task.priority`.

- No se permiten tareas repetidas ni prioridades no nulas repetidas.
- El estado se deriva en create, PUT y PATCH: tres ranks distintos A1/A2/A3 → `CONFIRMADO`; menos de tres → `BORRADOR`. Ningún rank puede estar `DESCARTADO`.
- Quitar un rank de un confirmado está permitido y lo devuelve a `BORRADOR`.
- `status` se acepta por compatibilidad, pero no controla el resultado. `VISTO` y `CERRADO` legados no bloquean edición: cualquier escritura normaliza su estado según ranks. Las lecturas y los no-op conservan el estado almacenado; no hay migración masiva.
- Un PATCH sólo de estado usa las tareas persistidas, no agrega defaults a campos omitidos.
- Los arrays enviados reemplazan el array completo; los campos omitidos no reciben defaults.
- Las tareas referenciadas deben pertenecer al dueño del plan.
- Las respuestas incluyen `tasks[].task.title`, `tasks[].task.project.name`, `importance`, `urgent`, `calendarEventId` y `scheduledDate`.

Ejemplo de confirmación:

```json
{
  "status": "CONFIRMADO",
  "tasks": [
    { "task": "222222222222222222222222", "priority": "A1", "decision": "COMPROMETIDO" },
    { "task": "333333333333333333333333", "priority": "A2", "decision": "COMPROMETIDO" },
    { "task": "444444444444444444444444", "priority": "A3", "decision": "COMPROMETIDO" }
  ]
}
```

### Propuestas de tareas reales por IA

La generación inicial y el endpoint `proposals` usan `AiProviderFactory.instance().prompt` con salida Zod `{taskIds: string[]}`. La IA considera importancia, urgencia, título/descripción, proyecto, fecha y eventos; para nuevas tandas también recibe las tareas actuales del plan. A1–A3 siguen siendo elecciones del usuario: la IA preselecciona propuestas `PENDIENTE`, sin asignar ranks ni crear tareas.

- Se consultan hasta 200 tareas del dueño, sin `completedAt`/`archivedAt`, ordenadas por ID; además se excluyen estados de finalización/cierre/archivo. El límite de candidatos es una ventana, no una búsqueda exhaustiva de todo el backlog.
- Cada tanda contiene como máximo cinco IDs únicos de esa allowlist. Se excluyen todas las tareas ya presentes, incluidas descartadas. Duplicados de la IA se deduplican; IDs ajenos/inventados, JSON inválido, listas vacías o de más de cinco IDs activan fallback.
- **Fallback explícito en logs**: ante falla del proveedor o salida inválida, se eligen hasta cinco candidatos por `HIGH > MEDIUM > LOW > sin importance`, urgentes primero dentro del nivel y desempate por ID. No se generan tareas ficticias; la respuesta sigue siendo el plan, sin un campo adicional de diagnóstico.
- `more`: agrega una tanda a las tareas existentes; no hay tope acumulativo del plan.
- `other`: reemplaza sólo entradas de la tanda original sin rank y con decisión `PENDIENTE` u omitida. Preserva A1/A2/A3, `DESEABLE`, `COMPROMETIDO`, `DESCARTADO`, y propuestas agregadas concurrentemente. No modifica eventos, hábitos ni sugerencias.
- Antes de guardar se relee el plan y se revalida que cada nueva tarea siga siendo del usuario y pendiente. Si no queda ninguna nueva, devuelve el plan intacto, sin borrar propuestas anteriores.
- Las escrituras PUT/PATCH y el merge de propuestas se serializan por plan dentro de la instancia del servicio. La llamada IA queda fuera del bloqueo; el merge usa las decisiones más recientes. Esto evita sobrescribir cambios durante la espera de IA en un proceso; **no es un lock distribuido ni una transacción entre procesos**. Los arrays de PUT/PATCH siguen teniendo semántica de reemplazo explícito.
- La generación de un plan existente sigue devolviéndolo intacto, sin llamar a IA. Las sugerencias libres preexistentes del job son un campo separado (`suggestions`), no tareas propuestas.

La selección envía el contexto indicado al proveedor IA configurado y consume una llamada adicional en generación inicial o una por tanda con candidatos. Sin candidatos no invoca IA.

## Google Calendar

- Se consulta FreeBusy del calendario `primary`; contempla ocupaciones recurrentes y de día completo según Google.
- Se excluyen slots cuyo inicio ya pasó y cualquier intersección con un intervalo ocupado.
- Una conexión ausente, permisos insuficientes, errores de Google o respuesta incompleta producen error, **nunca disponibilidad ficticia**.
- Se necesita una conexión Google activa con permisos de lectura de disponibilidad y escritura de eventos (por ejemplo, scope `calendar`, o `calendar.readonly` + `calendar.events`). Sólo `calendar.events` no garantiza acceso a FreeBusy.
- Se verifica ownership del plan y tarea, pertenencia de la tarea al plan, hora exacta local y disponibilidad fresca del día local de `startAt` antes de insertar el evento. No se restringe la reserva al día del plan.
- La persistencia de `calendarEventId` y `scheduledDate` pasa por `TaskServiceFactory.instance.updatePartial`.
- El ID Google es determinista por usuario/tarea. Si Google creó el evento pero falló Mongo, un reintento recupera ese evento y completa la persistencia. Después de actualizar la tarea se vuelve a leer el plan con `findById`. Repetir la misma reserva ya persistida también vuelve a leer y devuelve el plan actualizado; cambiar su horario con este endpoint se rechaza. No es un endpoint de reprogramación.
- Se serializan las solicitudes de agenda de un usuario dentro del proceso. Google no ofrece una transacción FreeBusy+insert: otros clientes o procesos podrían ocupar un horario entre la consulta y la creación. El ID determinista evita eventos duplicados de la misma tarea, pero no puede impedir cambios externos concurrentes de agenda.

## Errores

Se usan los errores/payloads estándar de Drax: `401` sin autenticación, `403` sin permiso, `404` si el plan/tarea no existe o no pertenece al usuario, `400` para horario inválido/ocupado, tarea fuera del plan o ya agendada en otro horario, `422` para validaciones de negocio/Zod. Con validación Fastify activa, errores de formato pueden ser `400` antes de llegar al controller. Fallos de Google se propagan como error, no como `{slots: []}`.

## Validación local

Desde `back/`:

```sh
npx tsc --noEmit -p tsconfig.json
npx vitest run test/modules/lifeops/day-plan --reporter=dot
```

Los tests de integración usan Mongo en memoria y autenticación real. Google se simula; no se crean eventos reales. El esquema de arquitectura declara el enum opcional; la versión instalada de `@drax/arch` no tiene una opción `nullable`, por lo que la aceptación de `null` está definida explícitamente en el Zod backend.
