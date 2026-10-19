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
| `POST /api/day-plans/generate` | `{ "date": "2030-01-02" }` | `DayPlan` existente intacto o nuevo | `dayplan:create` |
| `GET /api/day-plans/available-slots?date=YYYY-MM-DD&utcOffsetMinutes=-330` | Query `date`, `utcOffsetMinutes` opcional | `{ "slots": [{ "startAt": "2030-01-02T04:30:00.000Z", "endAt": "2030-01-02T05:30:00.000Z" }] }` | `dayplan:view` |
| `POST /api/day-plans/:id/schedule-task` | `{ "taskId": "<ObjectId>", "startAt": "2030-01-03T04:30:00Z", "utcOffsetMinutes": -330 }` | **DayPlan actualizado**, con tareas pobladas; también en reintentos | `dayplan:update` y `task:update` |

Se conserva `POST /api/day-plans/generate/today`, con la misma protección contra regeneración destructiva.

### Prioridades y confirmación

`tasks[].priority` es opcional y admite `null`, `A1`, `A2` o `A3`. No cambia `Task.priority`.

- No se permiten tareas repetidas ni prioridades no nulas repetidas.
- Para confirmar mediante `PATCH /api/day-plans/:id` con `{ "status": "CONFIRMADO" }`, el plan resultante debe tener exactamente una tarea A1, una A2 y una A3. Ninguna de ellas puede estar `DESCARTADO`.
- La regla también se mantiene al editar planes `CONFIRMADO` o `CERRADO`.
- Un PATCH puede enviar simultáneamente `status` y `tasks`; un PATCH que sólo cambia `status` valida las tareas persistidas.
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

La selección del job ordena `HIGH > MEDIUM > LOW > sin importance`; dentro de cada nivel, `urgent: true` primero. Conserva el límite existente de hasta cinco tareas propuestas. A1–A3 son elecciones del usuario: el job no las asigna automáticamente ni exige que las tres tareas elegidas tengan `importance: HIGH`.

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
