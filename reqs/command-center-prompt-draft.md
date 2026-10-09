# Centro de comando Jarvops — análisis y prompt draft

Fecha del análisis: 2026-10-08. Estado: **borrador para seleccionar y definir alcance**, no especificación aprobada.

Este documento tiene dos partes: una propuesta de producto con opciones para elegir y un prompt de construcción reutilizable. Las ideas del catálogo no quedan aprobadas por estar enumeradas. La implementación futura debe limitarse a la selección explícita o, si no existe selección, a la base recomendada del apartado 7.

## 1. Historia de usuario y objetivo

**Como** propietario de Jarvops, **quiero** una pantalla desde la que pueda entender qué requiere mi atención, capturar información y operar mis entidades frecuentes, **para** organizar mi día y avanzar en proyectos y objetivos con menos cambios de pantalla.

El centro debe responder cuatro preguntas: **¿qué pasa?, ¿qué requiere atención?, ¿qué hago ahora? y ¿cómo sigo trabajando sin perder contexto?**

El objetivo es una superficie de trabajo cotidiana. Las estadísticas orientan; las acciones y los listados permiten resolver. “Espectacular” significa jerarquía visual, fluidez, densidad útil y coherencia con los datos reales de Jarvops.

## 2. Hallazgos del proyecto que condicionan el diseño

Se revisaron `docs/project-overview.md`, schemas Zod, controllers, services, repositories, providers, CRUDs Vue, Kanban, DayPlan, rutas, menú, layout y temas. También se recuperaron y revisaron la captura y el HTML de la pantalla Stitch indicada.

| Área | Capacidad confirmada | Implicación para el centro |
| --- | --- | --- |
| Tareas | CRUD, Kanban, detalle, notas, historial, triage IA; `dueDate`, `scheduledDate`, `urgent`, scores, proyecto y objetivos | La pestaña principal debe permitir operar tareas y cambiar de vista; no limitarse a mostrar cantidades |
| Estados de tarea | Catálogo `TaskStatus` por nombre, con color y flags `completesTask` / `archivesTask` | No fijar estados como `todo`, `done` o “En progreso”; completar mediante el estado configurado |
| Clasificación | Catálogos de prioridades, áreas, fuentes y tipos; varios valores se guardan como nombres | Resolver valores y colores según el contrato de cada entidad; no asumir que todo es un ID poblado |
| Tareas programadas | Plantilla, recurrencia, timezone, próxima/última corrida, último error y última tarea; endpoints activar/desactivar | Mostrar qué generará cada regla y cuándo; navegar a sus tareas y al último resultado |
| Jobs IA | Configuración, tools, schedule, timeout, reintentos y runtime; ejecuciones con resultado, errores y tokens | Separar el job configurado de cada ejecución. `active` no significa que esté ejecutándose |
| Proyectos | Objetivos, cliente, fechas, progreso, scores, tags y archivo | Permitir abrir sus tareas y objetivos manteniendo el contexto de proyecto |
| Objetivos | Área, horizonte temporal, fecha objetivo, progreso, completado y archivo | Mostrar dirección y avance declarado, sin inventar un cálculo automático |
| CRM | `BusinessPartner` también representa clientes/proveedores; contacto principal; contactos con organización textual, teléfonos/emails y cumpleaños | Ofrecer clientes y contactos por separado. La organización de un contacto no es una referencia directa a `BusinessPartner` |
| Memorias | Título, contenido, tipo, área, tags, prioridad y fuente | Excelente material para redescubrimiento; no hay relación directa con proyecto/objetivo ni marcador de favorito |
| Plan diario | DayPlan con eventos, tareas, hábitos, sugerencias y decisiones; generación manual disponible | Una pestaña opcional “Hoy” aporta valor transversal sin crear una nueva entidad |
| Integraciones | Google Calendar, Gmail y Contacts; agentes conversacionales; notificaciones/push | Accesos contextuales opcionales, condicionados a permisos, conexión y scopes |
| Experimental | Purpose, Habit y HabitLog | Disponibles como ampliación; no convertirlos en el eje de la primera versión |
| Base técnica | Vue 3, Vuetify, Pinia, vue-router, i18n, Drax; API Fastify/Zod; MongoDB y repositorios SQLite alternativos | Componer con la infraestructura existente y mantener las operaciones de datos dentro de repositorios |

### Límites y detalles importantes detectados

- `CommandCenterPage.vue` y `components/command-center/CommandCenter.vue` ya existen como esqueletos vacíos. No se encontró su registro en las rutas de LifeOps revisadas. Reutilizarlos al implementar.
- Hay CRUDs, forms, comboboxes, providers y permisos para las ocho entidades solicitadas. No es necesario regenerarlas para construir esta pantalla.
- Los CRUDs de tareas actuales exponen muchas columnas. Incrustarlos sin adaptación ocuparía demasiado espacio y perdería la jerarquía buscada.
- El componente Drax `Crud` reinicia su store al montarse y reconoce `mode` / `id` en la ruta. La convivencia entre pestañas, formularios y Kanban debe diseñarse para que esos estados no se interfieran.
- `AgentJob.executeJob()` soporta ejecución manual internamente, pero las rutas y el provider de AgentJob revisados **no exponen “ejecutar ahora”**. Esa acción requiere trabajo backend si se selecciona.
- No se encontró un endpoint de memoria aleatoria ni un método especial en `MemoryService`. La selección aleatoria requiere una estrategia explícita; no asumir que ya existe.
- `AgentJobExecution` no tiene campo `user`; su controller actual desactiva el filtro por usuario. Una vista personal de ejecuciones requiere delimitar en backend los jobs accesibles mediante `AgentJob.createdBy`, además de los permisos. Filtrar solo en frontend no resuelve ese alcance.
- Regenerar DayPlan actualmente reemplaza las colecciones y sus decisiones por un borrador con `PENDIENTE`. Consultar o refrescar el centro no debe ejecutar esa regeneración. Si se ofrece regenerar, explicar y confirmar ese efecto.
- El archivo de tareas utiliza una colección/modelo separados, `TaskArchivedModel`. Un contador histórico de completadas puede requerir consultar ambos repositorios de datos; filtrar solo `Task` no garantiza un total histórico completo.
- No hay entidades de finanzas ni datos de ingresos, SLA, energía, sesiones de foco o duración estimada de tareas. `effortScore` no equivale a horas.

## 3. Cómo aprovechar el mockup de Stitch

Referencia: https://stitch.google.com/preview/5693371927758701197?node-id=d550efefaed846a993138cadaebeb0ce

Pantalla revisada: **Centro de Comando - Jarvops LifeOps**.

### Conservar

- Barra superior de métricas pequeñas, acciones rápidas en una fila y tarjetas breves de atención.
- Pestañas amplias que organizan el espacio de trabajo; tipografía con jerarquía y bordes discretos.
- Vista “Hoy” con dos columnas en desktop: pendientes/plan a la izquierda, agenda/automatizaciones a la derecha.
- Listas compactas con acciones próximas al contenido, estados por color y espacio suficiente para trabajar.
- Posibilidad de un bloque visual de actividad reciente, si utiliza ejecuciones reales.

### Adaptar a Jarvops

| Elemento del mockup | Tratamiento propuesto |
| --- | --- |
| `Energy Index`, `Focus Block`, horas disponibles | Reemplazar por estado del DayPlan, tareas comprometidas y decisiones pendientes |
| `Métricas SLA`, `Cola de espera`, telemetría | Omitir; no son capacidades verificadas de este dominio |
| `Operacional v2.4`, kernel, workers, PID y réplica primaria | Omitir; no hay evidencia de esos indicadores ni de un monitor integral del sistema |
| Consola `LIVE` | Sustituir opcionalmente por ejecuciones recientes, con hora de actualización y refresco real; no fingir streaming |
| Stripe, backups S3 y datos de ejemplo concretos | Usar únicamente registros reales del usuario; una recurrencia podría contener ese texto, pero no implica integración nativa |
| “Agent jobs en curso” | Contar ejecuciones `running`; para contar configuraciones `active`, rotular “Jobs activos” |
| Prioridades `P1`, `P2` | Usar el catálogo real y sus colores; no crear una escala que no existe |
| Objetivos por trimestre | Usar `timeHorizon` y `targetDate`; un trimestre solo puede mostrarse como derivación claramente definida |
| Sidebar, navegación superior y tabs internas simultáneas | Integrar en el layout actual; evitar tres niveles redundantes de navegación |
| Tema violeta y fuentes externas del HTML | Tomar la composición como referencia; utilizar Vuetify y el tema existente, cuyo primario claro es `#00DF78`. Cambiar la identidad visual queda como decisión opcional |

## 4. Composición de pantalla recomendada

Orden de arriba hacia abajo:

1. **Cabecera mínima:** “Centro de comando”, fecha, actualizar y, si se selecciona, búsqueda. Integrar con el app-bar existente.
2. **Barra de estadísticas:** entre cuatro y seis indicadores prioritarios visibles. Altura objetivo de 56–72 px en desktop; los secundarios pueden ir en expansión o desplazamiento horizontal.
3. **Acciones rápidas:** tarea y memoria como acciones principales; agregar una entidad desde menú secundario. “Agente” como acceso adicional si se selecciona.
4. **Tarjetas de atención:** una fila de hasta tres tarjetas visibles, con extracto y una acción. Memoria aleatoria, tarea que requiere atención y próxima automatización son una buena combinación.
5. **Área operativa con pestañas:** la mayor superficie de la pantalla. Cada pestaña tiene búsqueda/filtros y acciones propias. El detalle o edición se abre en diálogo o panel lateral.

En desktop de 1440 × 900, las pestañas y las primeras filas de trabajo deben estar visibles sin desplazarse; como orientación, reservar al menos el 60% del alto útil al área operativa. No reducir legibilidad para alcanzar ese objetivo. Encabezados, métricas y tarjetas se compactan o colapsan según ancho y tamaño de texto.

Pestañas propuestas: **Hoy · Tareas · Programadas · Jobs IA · Proyectos · Objetivos · Contactos · Clientes · Memorias**. Las ocho entidades pedidas están incluidas; “Hoy” es una recomendación adicional seleccionable. En Jobs IA, ejecuciones puede ser una subvista; no necesita otra pestaña principal.

Si nueve pestañas resultan demasiadas, alternativa a elegir: **Hoy · Tareas · Automatizaciones · Proyectos · Objetivos · CRM · Memorias**, con subpestañas para Programadas/Jobs y Contactos/Clientes. No implementar ambas variantes a la vez.

Desktop: tabla compacta o lista con detalle lateral opcional. Móvil: tabs desplazables, listas/tarjetas legibles, filtros en diálogo y formularios de pantalla completa. Evitar obligar al usuario móvil a operar una tabla de veinte columnas.

## 5. Catálogo de propuestas para seleccionar

**Leyenda:** E = capacidad existente para reutilizar; D = cálculo/composición nueva sobre datos existentes; N = necesita contrato, lógica backend o persistencia nueva. “Base” identifica una recomendación inicial, no una aprobación del usuario. La complejidad es relativa, no una estimación de tiempo.

### 5.1 Resumen, captura y navegación

| ID | Propuesta y valor | Base | Tipo / complejidad |
| --- | --- | --- | --- |
| CC01 | Métricas compactas y clicables; cada click abre la pestaña con el mismo filtro del contador | Sí | D / media |
| CC02 | Captura rápida de tarea: título primero, clasificación y vínculos mediante expansión opcional | Sí | E+D / baja |
| CC03 | Captura de memoria con título, contenido y tipo obligatorio; respetar campos requeridos | Sí | E / baja |
| CC04 | Crear cualquier entidad frecuente desde un menú “Agregar”; formularios en la misma pantalla | Sí | E+D / media |
| CC05 | Búsqueda en la pestaña activa con debounce, paginación y atajo de teclado | Sí, sin atajo obligatorio | E+D / baja |
| CC06 | Buscador global por tareas, proyectos, objetivos, contactos, clientes y memorias; resultados agrupados | No | D o N según API / media-alta |
| CC07 | Paleta de comandos: buscar acciones/entidades y crear mediante teclado | No | D / media |
| CC08 | Conservar pestaña, filtros, orden y scroll al navegar; URL compartible para contexto activo | Sí, estado básico | D / media |
| CC09 | Favoritos y “recientes” de navegación, almacenados por usuario; sin modificar entidades | No | D con persistencia local / baja-media |
| CC10 | Ajustar orden/visibilidad de métricas, tarjetas y tabs mediante opciones simples | No | D con persistencia local / media |

### 5.2 Atención, recordatorios y foco

| ID | Propuesta y valor | Base | Tipo / complejidad |
| --- | --- | --- | --- |
| CC11 | Memoria aleatoria: extracto, tipo/tags, “Leer” y “Otra memoria”; redescubrir contexto útil | Sí | D o N / media |
| CC12 | Tarea destacada por vencimiento/urgencia con motivo visible y acción “Abrir” o “Resolver” | Sí | D / media |
| CC13 | Próxima automatización: distinguir generación de tarea y job IA; fecha, timezone y acceso al detalle | Sí | D / media |
| CC14 | Alerta de automatizaciones con error, sin duplicar indefinidamente errores de ejecuciones antiguas | No | D / media |
| CC15 | Proyecto/objetivo próximo a su fecha: progreso declarado y acceso a tareas relacionadas | No | D / media |
| CC16 | Cumpleaños próximos usando `Contact.birthday`, tolerando año ausente | No | D / baja-media |
| CC17 | Registros sin clasificar: tareas sin proyecto, tipo, área o prioridad; revisar sin asumir que es un error | No | D / baja-media |
| CC18 | Próximo evento de Google Calendar, con origen y conexión utilizada | No | E+D / media |
| CC19 | “Sin movimiento”: proyectos sin actualización en N días o sin tareas abiertas; mostrar la regla explícita | No | D / media-alta |
| CC20 | Filtro de sesión “Quiero avanzar en este proyecto/objetivo”; concentra tareas y contexto | No | D / media |
| CC21 | Revisión semanal guiada: pendientes, objetivos próximos, automatizaciones fallidas y memorias recientes | No | D / media-alta |

Las tarjetas deben explicar su origen: “Venció hace 2 días”, “Urgente”, “Próxima corrida” o “Memoria elegida al azar”. No rotular una selección determinista como recomendación IA. “Sin movimiento” describe metadatos disponibles: `updatedAt` no demuestra avance real.

Ocultar una tarjeta durante la sesión no archiva la entidad ni modifica su estado. No introducir recordatorios persistentes, posponer tarjetas hasta una fecha o nuevos campos sin seleccionar ese comportamiento.

### 5.3 Operación de entidades y relaciones

| ID | Propuesta y valor | Base | Tipo / complejidad |
| --- | --- | --- | --- |
| CC22 | Tareas en tabla compacta; chips Hoy/Vencidas/Urgentes/Sin proyecto y edición/detalle contextual | Sí | E+D / media |
| CC23 | Alternar Tareas entre lista y Kanban existente preservando filtros compatibles | No | E+D / media |
| CC24 | Acciones rápidas de tarea: estado, vencimiento, programación, prioridad y nota | No | E+D / media |
| CC25 | Triage IA por tarea, con loading propio y aviso de que clasifica y modifica datos | No | E / baja-media |
| CC26 | Operaciones masivas: completar, mover de estado, asociar proyecto o archivar | No | D o N / alta |
| CC27 | Programadas: resumen legible de recurrencia, activar/desactivar y ver última tarea/tareas generadas | Sí | E+D / media |
| CC28 | Jobs IA: pausar/activar, ver próxima corrida y ejecuciones, resultado, error y tools | Sí, ejecuciones sujetas a aislamiento backend | E+D, posible N / media |
| CC29 | Ejecutar job IA ahora y seguir el resultado; endpoint autorizado, control de ejecución simultánea y confirmación explícita | No | N / alta |
| CC30 | Proyecto → tareas/objetivos/cliente; objetivo → tareas/proyectos; cliente → proyectos/contacto principal | Sí, navegación por vínculos reales | D / media |
| CC31 | Memorias: lista con extracto, filtros por tipo/área/tags y lectura amplia | Sí | E+D / media |
| CC32 | Contactos: email/teléfono principal, copiar datos, abrir `mailto:` / `tel:` y estado de sync | No | E+D / baja-media |
| CC33 | Clientes: distinguir cliente/proveedor y abrir contacto principal/proyectos | Sí, detalle básico | E+D / media |
| CC34 | Comparar avance de objetivos/proyectos con sus tareas; cifras auxiliares separadas del progreso manual | No | D / media-alta |

**Regla transversal:** cada salto debe mantener la orientación. Ejemplo: desde Proyecto A → “Ver tareas” abre Tareas con chip “Proyecto A”; cerrar el detalle no elimina el filtro. Si se decide agregar la creación contextual, crear desde Proyecto A precarga su referencia y permite revisarla antes de guardar.

### 5.4 Día, IA, integraciones y experiencia

| ID | Propuesta y valor | Base | Tipo / complejidad |
| --- | --- | --- | --- |
| CC35 | Pestaña “Hoy”: resumen de DayPlan, tareas relevantes, próximos eventos y automatizaciones | No, muy recomendada | E+D / media |
| CC36 | Decidir dentro del plan: Comprometido/Deseable/Descartado; separar esas decisiones del estado real de tareas | No | E+D / media |
| CC37 | Agente contextual en diálogo/panel; pasar entidad y filtros para pedir ayuda sin salir | No | E+D o N según contrato / media-alta |
| CC38 | Actividad reciente de ejecuciones reales; detalle expandible, sin consola inventada | No | D con aislamiento backend / media |
| CC39 | Accesos a Gmail, Calendar y sincronización de contactos; indicar requisitos y efectos antes de operar | No | E+D / media |
| CC40 | Indicador/centro compacto de notificaciones internas con datos reales y permisos existentes | No | E+D / media |
| CC41 | Hábitos y propósitos como widgets/pestañas secundarios, conservando su carácter experimental | No | E+D / media |
| CC42 | Modo concentración: colapsar métricas/tarjetas para maximizar la pestaña activa | No | D / baja |
| CC43 | Filtros guardados existentes de Drax, después de verificar su integración con estas vistas | No | E+D / media |
| CC44 | Atajos accesibles, navegación con teclado, foco al cerrar formularios y anuncios de resultados | Accesibilidad sí; atajos opcionales | D / media |
| CC45 | Refresco automático moderado de ejecuciones, solo con pestaña visible y sin peticiones solapadas | No | D / media |

### Ideas que conviene reservar para otra iniciativa

Timeboxing real, Pomodoro, energía personal, seguimiento financiero, pipeline comercial, SLA, dependencias entre tareas, milestones, ranking IA persistente, recordatorios con snooze, relaciones nuevas Memory→Project/Goal y monitoreo técnico del servidor. Pueden ser útiles, pero requieren decisiones de dominio y datos que este centro no debe inventar.

## 6. Definiciones para métricas y tarjetas

Toda métrica tiene nombre, filtro, intervalo temporal, alcance de usuario y destino al hacer click. **No contar los elementos de una página como si fueran el total.** Usar totales paginados o agregaciones autorizadas. Un dato no disponible se representa como “—” o error recuperable, nunca como cero.

Para esta propuesta, tarea pendiente = `completedAt` ausente/nulo y `archivedAt` ausente/nulo. La etiqueta no corresponde a un nombre fijo de estado. Antes de implementar, comprobar que el API/operador usado contempla campos ausentes de registros antiguos.

Definir `inicioHoy` / `inicioMañana` en la zona horaria acordada; usar intervalos `[inicio, fin)`. La propuesta inicial es `America/Argentina/Buenos_Aires`. El runtime de cada automatización conserva su timezone propio. No confundir hora del navegador con la del servidor; DayPlan actualmente calcula límites de día con la zona local del proceso backend.

| Indicador propuesto | Definición | Destino |
| --- | --- | --- |
| Vencidas | Tareas pendientes con `dueDate < inicioHoy`; así una tarea con fecha de hoy no se considera vencida a mitad del día | Tareas / Vencidas |
| Para hoy | Unión sin duplicados de tareas pendientes con `scheduledDate` o `dueDate` dentro de hoy | Tareas / Hoy |
| Urgentes | Tareas pendientes con `urgent = true` | Tareas / Urgentes |
| Programadas activas | `TaskSchedule.active = true` | Programadas / Activas |
| Jobs activos | `AgentJob.active = true` | Jobs IA / Activos |
| Jobs con último resultado fallido | Jobs accesibles con `runtime.lastStatus` en `failed` / `timeout` | Jobs IA / Con error |
| Proyectos abiertos, opcional | Proyectos sin `completedAt` ni `archivedAt` | Proyectos / Abiertos |
| Objetivos abiertos, opcional | Objetivos sin `completedAt` ni `archivedAt` | Objetivos / Abiertos |
| Ejecuciones en curso, opcional | Ejecuciones accesibles con `status = running`; no inferirlo de `AgentJob.active` | Jobs IA / Ejecuciones |
| Fallos en últimas 24 h, opcional | Ejecuciones `failed` / `timeout` con `finishedAt` dentro de esa ventana; aclarar si cuenta intentos | Jobs IA / Ejecuciones filtradas |
| Completadas en 7 días, opcional | Tareas con `completedAt` en la ventana; contemplar tareas trasladadas a archivo para un total completo | Historial, solo si su consulta se habilita |

“Para hoy” y “Vencidas” pueden solaparse: una tarea vencida puede estar programada para hoy. No sumar indicadores para presentar un total de pendientes. Implementar la unión del filtro de hoy de forma equivalente en contador y lista; si el API no soporta OR, resolver con contrato backend mínimo, no descargar todas las tareas.

No calcular “porcentaje de productividad” desde DayPlan: `COMPROMETIDO` representa una decisión, no una tarea realizada. Tampoco recalcular automáticamente `progressPercent` de objetivos/proyectos desde tareas sin una regla de negocio seleccionada.

### Memoria aleatoria: decisión concreta propuesta

- Buscar dentro de memorias accesibles al usuario y, si se selecciona, con filtros por tipo/área/tags.
- Mantener el resultado estable al refrescar otras secciones; cambiar mediante “Otra memoria”. Con una sola memoria, volver a mostrarla es válido; con varias, evitar repetición inmediata cuando sea posible.
- Mostrar título, extracto corto, tipo y tags; abrir el contenido completo en detalle. No fingir una relación con el proyecto activo.
- Sin registros: invitar a crear memoria. En un error: reintentar; no generar una memoria de relleno.
- Alternativa simple: elegir un índice aleatorio sobre el total y pedir una página de un elemento con orden estable, verificando límites del provider y aceptando concurrencia entre conteo/lectura. No elegir solo sobre la primera página sin explicitar ese sesgo.
- Si se necesita selección aleatoria consistente o hay restricciones de paginación, añadir operación mínima en Memory Repository, Service y endpoint autorizado. Mantener el contrato equivalente para los motores habilitados. No cargar toda la colección ni crear persistencia “memoria del día” por defecto.

## 7. Base recomendada y decisiones de selección

### Base candidata para una primera versión

**CC01–CC05, CC08, CC11–CC13, CC22, CC27–CC28, CC30–CC31 y CC33**, con estados de carga/error/vacío, responsive e i18n. Si se incluye la subvista de ejecuciones de CC28, incorporar su aislamiento backend; si no se implementa ese contrato, acotar CC28 a la configuración/runtime del job y dejar explícita la subvista pendiente.

Esto cubre las ocho entidades pedidas, seis métricas compactas, captura rápida, tres tarjetas y operación contextual. Agregaría **CC35 (“Hoy”)** como primera ampliación, porque conecta datos ya existentes y puede convertirse en la entrada cotidiana al centro. Otra combinación útil es CC23 + CC25 para quien trabaja principalmente con tareas.

### Selección editable antes de construir

```yaml
estado: draft
seleccion: base_recomendada # alternativa: lista_explicita
ids_seleccionados: [] # completar si seleccion = lista_explicita
ids_excluidos: [] # prevalecen sobre la base; sus controles también se omiten
incluir_hoy: false
pestana_inicial: tareas # hoy, si se selecciona CC35
organizacion_tabs: entidades_separadas # alternativa: automatizaciones_y_crm_agrupadas
metrica_hoy: vencimiento_o_programacion
timezone_centro: America/Argentina/Buenos_Aires
tarjetas_visibles: 3
tema: existente # cambio de paleta solo si se elige explícitamente
busqueda: pestaña_activa # global requiere CC06
detalle: dialogo # panel lateral requiere adaptación adicional
persistencia_preferencias: sesion # local_por_usuario si se selecciona
ejecutar_job_manualmente: false # requiere CC29
generacion_ia_automatica_al_abrir: false
```

Puntos para elegir: ¿Hoy o Tareas como entrada?, ¿ocho entidades separadas o agrupaciones?, ¿tabla sola o también Kanban?, ¿cuáles cuatro/seis métricas?, ¿tres tarjetas o más?, ¿agente contextual?, ¿preferencias locales?, ¿ejecución manual de jobs? Son decisiones de producto abiertas; no bloquean la revisión de este borrador.

## 8. Prompt reutilizable para la IA que lo construya

> Copiar desde “Inicio del prompt” hasta “Fin del prompt”, junto con la selección del apartado 7 y este documento como referencia. Cuando se haya elegido el alcance, ajustar esa selección antes de ejecutar.

### Inicio del prompt

Actúa como diseñador de producto y desarrollador senior del proyecto Jarvops / LifeOps. Construye un **centro de comando personal visualmente cuidado, compacto y operativo**, integrado en este repositorio. Debe permitirme entender qué requiere atención y trabajar con Task, TaskSchedule, AgentJob, Project, Goal, Contact, BusinessPartner y Memory desde la misma pantalla.

#### A. Alcance y fuentes de verdad

1. Lee `AGENTS.md`, `docs/project-overview.md` y `reqs/command-center-prompt-draft.md`. Lee las skills/workflows locales que apliquen al alcance seleccionado: CRUD frontend, formularios, identidad, estilos y, solo cuando corresponda, backend, dashboards y pruebas.
2. Los schemas Zod y los contratos instalados son la fuente de verdad. Verifica providers, rutas, permisos, filtros, stores y formularios antes de usarlos. El overview es contexto y puede estar desactualizado.
3. Resuelve el alcance con la selección del apartado 7. Si no hay selección personalizada, implementa únicamente su base recomendada. Las opciones del catálogo no seleccionadas no autorizan cambios ni botones de demostración. `ids_excluidos` prevalece; incorporar `incluir_hoy` solo si es verdadero. Enumera brevemente el alcance efectivo antes de editar.
4. Usa la referencia Stitch del apartado 3 como orientación de composición y jerarquía. Si no puedes acceder, sigue la descripción del documento. Sus números, nombres, telemetría y procesos no son requisitos ni datos de producción.
5. Reutiliza los esqueletos de CommandCenter existentes y examina modificaciones locales antes de editar. Conserva trabajo ajeno y no lo incluyas en tu commit.

#### B. Experiencia y diseño visual

6. Organiza la pantalla como cabecera mínima → métricas compactas → acciones rápidas → tarjetas de atención → gran área operativa con pestañas.
7. Utiliza Vuetify, `v-row` / `v-col`, clases existentes, iconos del proyecto y ambos modos de tema. Usa i18n para textos, etiquetas, errores y accesibilidad. Mantén la paleta actual salvo selección expresa de otra.
8. Evita un hero alto, gráficos decorativos y padding excesivo. La pestaña activa y sus primeras filas deben verse en un desktop habitual sin scroll inicial. Usa densidad compacta con controles legibles y foco visible; no conviertas el mockup en una maqueta microscópica.
9. Presenta cuatro/seis métricas prioritarias, cada una con su definición temporal y destino. En móvil, desplaza o distribuye el resumen de forma controlada y reduce las tarjetas expandidas.
10. Prioriza “Nueva tarea” y “Nueva memoria”; las demás creaciones pueden vivir en “Agregar”. Abrir formularios y detalles no debe abandonar el centro. Acciones con efectos deben mostrar loading, resultado y error reales.
11. Las tarjetas de la base son memoria aleatoria, tarea que requiere atención y próxima automatización. Extractos breves y acciones claras; permitir detalle sin agrandar toda la fila. Refrescar otra sección no debe cambiar la memoria elegida.
12. Expón las ocho entidades frecuentes en pestañas o en las agrupaciones seleccionadas. Solo añade Hoy si se selecciona. Oculta o adapta entradas según autorización; no inventes rutas ni una sidebar alternativa.
13. Cada tab mantiene búsqueda, filtros, orden, página y selección sin mezclarlos con otra entidad. Conserva el contexto al abrir/cerrar un detalle. Evita que `mode` / `id` globales abran formularios de otra pestaña.
14. En móvil, usa listas/tarjetas, filtros en diálogo y formularios adecuados al ancho. Evita scroll horizontal de toda la página. Prueba texto largo, zoom y navegación por teclado.

#### C. Comportamiento por entidad

15. Tareas: tabla/lista de columnas esenciales —título, estado, prioridad, proyecto y fechas relevantes—; clasificación completa, scores, notas e historial disponibles en detalle. Presets Hoy/Vencidas/Urgentes/Sin proyecto según selección. Usa el catálogo TaskStatus y sus automatismos para completar; no escribas directamente una fecha para simular un cambio de estado.
16. Si se selecciona Kanban, reutiliza la vista actual, adaptando su ciclo de montaje y filtros; no dupliques su lógica. Si se selecciona triage, informa que puede modificar la tarea y ejecútalo únicamente por acción explícita.
17. Programadas: muestra nombre, título de la plantilla, recurrencia legible, timezone, activo, siguiente ejecución y último resultado. Reutiliza endpoints activar/desactivar y permite abrir última tarea o filtrar tareas por `taskSchedule`. Runtime y `scheduledFor` no son campos de edición manual.
18. Jobs IA: muestra configuración separada de ejecuciones. Activar/pausar modifica `active` a través del Service; `runtime.lastStatus` no prueba que haya una ejecución actual. Muestra resultados/errores/tokens solo desde ejecuciones reales y autorizadas. No crear ni editar estados de ejecución como forma de lanzar un job.
19. “Ejecutar ahora” solo existe si se selecciona CC29: añade el contrato mínimo autorizado y reutiliza el runner existente. Respeta tools, timeout, reintentos e inactividad, evita duplicados y representa el progreso real. No confundir activar con ejecutar.
20. Proyectos y objetivos: muestra fecha objetivo, progreso almacenado, prioridad y vínculos reales. “Ver tareas” aplica el filtro correspondiente. No sobrescribas `progressPercent` con una fórmula inventada.
21. Clientes: muestra roles reales, contacto principal y proyectos relacionados. Contactos: muestra datos disponibles, estado y organización textual. No deduzcas un BusinessPartner por coincidencia de nombre; el vínculo confirmado es `BusinessPartner.mainContact`.
22. Memorias: prioriza lectura de contenido y filtros por tipo, área y tags. La captura exige título/contenido/tipo. Implementa selección aleatoria con alcance de usuario, sin cargar toda la colección; explica la estrategia elegida y sus límites.
23. Si se selecciona Hoy, consulta el DayPlan existente sin generarlo automáticamente. Presenta decisiones como decisiones, no como completado. La tarea se completa mediante TaskService. La regeneración manual debe advertir y confirmar que actualmente reemplaza decisiones y colecciones; no efectuarla al abrir o refrescar.
24. Si se incluyen integraciones o agente, reutiliza conexiones, scopes, providers y componentes existentes. Diferencia sin conexión, sin permisos, vacío y error. Abrir la pantalla no debe ejecutar tools de IA, sincronizaciones ni jobs.

#### D. Datos, arquitectura y rendimiento

25. Implementa las métricas con las definiciones del apartado 6: usuario actual, tareas pendientes, límites de fecha explícitos y unión sin duplicados para Hoy. Contador y destino deben usar la misma condición. No confundas elementos de página con totales.
26. Resuelve estados/prioridades desde catálogos; maneja referencias que llegan como ID o como objeto según el contrato. Incluye fechas nulas, datos antiguos y referencias eliminadas. Nunca sustituir errores de carga por estadísticas en cero.
27. Reutiliza providers y capacidades de paginación/agregación de Drax verificadas. No descargar todo el inventario, hacer N+1 por cada fila ni cargar las ocho tabs al iniciar. Carga la activa y los resúmenes necesarios; conserva resultados y refresca lo afectado después de una mutación.
28. Encapsula lógica reutilizable en composables y separa cabecera/métricas/acciones/tarjetas/pestañas cuando ayude a mantener componentes pequeños. Evita crear un framework genérico de widgets o de layouts para esta única página.
29. Verifica el estado compartido de `EntityCrud.instance`, `useCrud` y Pinia. El componente Crud reinicia store al montar; no montar dos consumidores de la misma entidad sin aislamiento. Inicializa instancias que dependen de Pinia dentro de setup, no durante la importación del módulo.
30. Si la API existente no resuelve una operación seleccionada —memoria aleatoria, unión para Hoy, agregaciones o alcance personal de ejecuciones— añade solo el contrato mínimo necesario. El endpoint agregado del centro es una opción, no un requisito automático.
31. Controllers/orquestación acceden a entidades mediante sus ServiceFactory/Services; solo sus Repositories operan la base de datos. Usa schemas Zod para contratos nuevos, builders de documentación apropiados y errores de `@drax/common-back`. Conserva compatibilidad con los repositorios habilitados; no agregar modelos de persistencia para simples resúmenes de lectura.
32. Respeta permisos de consulta/creación/actualización/eliminación en UI y backend. Delimita datos personales en backend. Para ejecuciones, verifica acceso al job relacionado mediante `createdBy`; el controller actual no aplica ese alcance. No confiar en IDs o filtros enviados por el cliente como autorización.
33. Las actualizaciones PATCH no deben introducir defaults en campos omitidos, reemplazar objetos no incluidos ni alterar runtime desde un formulario. Reutiliza y valida las reglas actuales de servicios para tareas, programaciones y jobs.
34. Ofrece errores recuperables por sección: un fallo de tarjetas o métricas no bloquea las pestañas restantes. Usa skeletons proporcionados al layout y diferencia permisos, ausencia de datos y conexión fallida. Preserva filtros al reintentar.
35. Refresco manual consulta datos; no genera planes ni ejecuta automatizaciones. Si se selecciona polling, solo mientras corresponde y con cancelación/limpieza al desmontar; mostrar hora de actualización sin afirmar “LIVE” si no hay streaming.
36. No inventes datos, propiedades, integraciones o KPIs; no incluyas energía, horas de foco, ingresos, SLA, workers ni consola del sistema. Mocks solo en pruebas o fixtures explícitos, nunca como fallback de producción.

#### E. Flujos y aceptación

37. Flujo principal: entrar → consultar resumen → crear o elegir una entidad → operar en su pestaña → abrir relaciones → guardar → actualizar lista y resúmenes afectados sin perder contexto.
38. Verifica estos escenarios, adaptados al alcance efectivo:
    - Con datos reales, se ven métricas y área operativa; cada métrica abre una lista cuyo filtro y total coinciden con su definición.
    - Crear/editar desde el centro valida requeridos y mantiene la pestaña; guardar actualiza datos afectados y un error permite corregir/reintentar sin perder el formulario.
    - Abrir Proyecto → tareas mantiene su chip de contexto; cambiar de pestaña y volver conserva su estado. Mode/id de detalle no abren formularios de entidades equivocadas.
    - Con cero memorias o una sola, la tarjeta responde correctamente; “Otra memoria” no escribe datos y solo muestra registros accesibles.
    - Sin permiso o ante fallo de una API, se restringe la operación correspondiente y el resto del centro sigue utilizable. Las ejecuciones de otro usuario no aparecen ni pueden consultarse indirectamente.
    - Fechas próximas a medianoche, fechas nulas, tareas vencidas programadas hoy y estados personalizados producen filtros/contadores coherentes; no se duplican tareas en la unión.
    - Abrir/refrescar no ejecuta IA, jobs ni regeneración de DayPlan. Si se selecciona regenerar, el efecto se confirma explícitamente.
39. Comprueba desktop, móvil, tema claro/oscuro, teclado y contenidos largos. Ejecuta comprobación TypeScript y build del frontend: `npm run vuetsc` y `npm run build` en `front/`. No uses el lint con `--fix` de todo el proyecto para formatear cambios ajenos.
40. Si modificas backend, añade/ejecuta pruebas focalizadas para contratos, autorización, fechas y efectos relevantes, siguiendo los tests actuales. Una edición documental no requiere ejecutar suites de la aplicación. Reporta fallos previos sin ampliar el alcance para corregirlos.
41. Entrega código funcional del alcance seleccionado, una explicación breve de decisiones, validación ejecutada y límites reales. Actualiza documentación si cambia un contrato y genera un commit solo de tu trabajo según AGENTS.md, sin push.

### Fin del prompt

## 9. Riesgos a resolver al implementar

- **Contadores incorrectos:** paginación, unión para Hoy, límites de día y colección de archivo. Verificar fórmulas antes del tratamiento visual.
- **Estado de navegación compartido:** resets de Drax, stores por entidad y query params. Probar cambio de tab con filtros y formulario abierto.
- **Ejecuciones fuera del ámbito personal:** permisos no sustituyen el filtro por propietario del job. Resolver el contrato antes de mostrar el feed.
- **Acciones con efectos no evidentes:** triage modifica datos, regenerar plan reemplaza decisiones y ejecutar un job puede utilizar tools. Etiquetar y disparar explícitamente.
- **Sobrepeso visual y de red:** más tarjetas no siempre mejoran el centro; seleccionar lo que se usará y cargar lo que esté visible.

## 10. Rutas de código útiles para la implementación

- `front/src/modules/lifeops/pages/CommandCenterPage.vue`
- `front/src/modules/lifeops/components/command-center/CommandCenter.vue`
- `front/src/modules/lifeops/components/cruds/`
- `front/src/modules/lifeops/components/TaskForm.vue`, `TaskView.vue`, `KanbanTask.vue`, `TaskDashboard.vue`, `DayPlan.vue`
- `front/src/modules/lifeops/cruds/`, `providers/`, `comboboxes/`, `interfaces/`
- `front/src/modules/lifeops/routes/CustomRoute.ts`, `routes/index.ts`
- `front/src/menu/index.ts`, `front/src/layouts/base.vue`, `front/src/plugins/themes/`
- `back/src/modules/lifeops/schemas/`, `controllers/`, `services/`, `repository/`, `factory/services/`, `permissions/`
- `back/src/modules/lifeops/jobs/AgentJob.ts`, `DayPlanJob.ts`, `TaskArchiveJob.ts`
- `back/src/modules/lifeops/models/TaskArchivedModel.ts`
- `back/test/modules/lifeops/agent-job/`, `task/`, `task-schedule/`, `day-plan/`

Este entregable define y propone. La implementación del centro queda para la sesión en que se use el prompt con el alcance elegido.
