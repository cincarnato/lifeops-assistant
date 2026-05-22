<script setup lang="ts">
import {computed} from "vue";
import type {ITask} from "../interfaces/ITask";
import {CrudRefDisplay} from "@drax/crud-vue"
import ProjectCrud from "@/modules/lifeops/cruds/ProjectCrud.js";
import GoalCrud from "@/modules/lifeops/cruds/GoalCrud.js";


const props = defineProps<{
  task?: ITask | null
  item?: ITask | null
}>();

const task = computed(() => props.task || props.item || null);


type ScoreItem = {
  key: string
  label: string
  value?: number
  icon: string
  color: string
};

type DetailItem = {
  key: string
  label: string
  value: string
  icon: string
};

const scoreItems = computed<ScoreItem[]>(() => [
  {key: "value", label: "Valor", value: task.value?.valueScore, icon: "mdi-chart-line", color: "primary"},
  {
    key: "motivation",
    label: "Motivacion",
    value: task.value?.motivationScore,
    icon: "mdi-lightning-bolt-outline",
    color: "success"
  },
  {key: "effort", label: "Esfuerzo", value: task.value?.effortScore, icon: "mdi-weight-lifter", color: "error"},
  {key: "urgency", label: "Urgencia", value: task.value?.urgencyScore, icon: "mdi-alarm", color: "warning"}
]);

const classificationItems = computed<DetailItem[]>(() => compactDetails([
  {key: "source", label: "Origen", value: task.value?.source, icon: "mdi-source-branch"},
  {key: "type", label: "Tipo", value: task.value?.type, icon: "mdi-shape-outline"},
  {key: "status", label: "Estado", value: task.value?.status, icon: "mdi-list-status"},
  {key: "lifeArea", label: "Area", value: task.value?.lifeArea, icon: "mdi-image-area"},
  {key: "project", label: "Proyecto", value: task.value?.project, icon: "mdi-folder-open-outline"},
  {key: "goals", label: "Objetivos", value: task.value?.goals, icon: "mdi-folder-open-outline"},
  {key: "redmineIssueId", label: "Redmine", value: task.value?.redmineIssueId, icon: "mdi-ticket-outline"},
  {key: "emailMessageId", label: "Email", value: task.value?.emailMessageId, icon: "mdi-email-outline"},
  {key: "calendarEventId", label: "Calendario", value: task.value?.calendarEventId, icon: "mdi-calendar-link"}
]));

const dateItems = computed<DetailItem[]>(() => compactDetails([
  {key: "createdAt", label: "Creada", value: formatDateTime(task.value?.createdAt), icon: "mdi-plus-circle-outline"},
  {key: "updatedAt", label: "Actualizada", value: formatDateTime(task.value?.updatedAt), icon: "mdi-update"},
  {key: "dueDate", label: "Vencimiento", value: formatDateTime(task.value?.dueDate), icon: "mdi-calendar-alert"},
  {
    key: "scheduledDate",
    label: "Agendada",
    value: formatDateTime(task.value?.scheduledDate),
    icon: "mdi-calendar-clock"
  },
  {
    key: "completedAt",
    label: "Completada",
    value: formatDateTime(task.value?.completedAt),
    icon: "mdi-check-circle-outline"
  },
  {key: "archivedAt", label: "Archivada", value: formatDateTime(task.value?.archivedAt), icon: "mdi-archive-outline"}
]));


const normalizedNotes = computed(() => normalizeNotes(task.value?.notes));
const statusHistory = computed(() => task.value?.statusHistory || []);


function compactDetails(items: Array<Omit<DetailItem, "value"> & { value?: string | number | null }>): DetailItem[] {
  return items
    .map(item => ({...item, value: displayValue(item.value)}))
    .filter(item => item.value !== "");
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null) {
    return "";
  }

  if(Array.isArray(value)) {
    return value
  }

  return String(value).trim();
}

function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatScore(value?: number) {
  return typeof value === "number" ? value.toFixed(1) : "-";
}


function normalizeNotes(notes?: ITask["notes"]) {
  if (!notes) {
    return [];
  }

  if (typeof notes === "string") {
    const note = notes.trim();
    return note ? [{note}] : [];
  }

  return notes.filter(note => note?.note);
}

</script>

<template>
  <v-sheet v-if="task" class="task-view" color="background">
    <header class="task-view__appbar">
      <div class="task-view__appbar-title">
        <div>
          <div class="text-overline text-primary">Tarea</div>
          <h1 class="task-view__title">{{ task.title }}</h1>
        </div>
      </div>

      <div class="task-view__appbar-actions">
        <!--        <v-btn-->
        <!--            icon="mdi-pencil-outline"-->
        <!--            variant="text"-->
        <!--            density="comfortable"-->
        <!--            title="Editar"-->
        <!--            @click="onEdit"-->
        <!--        />-->
      </div>
    </header>


    <main class="task-view__content">
      <section class="task-view__hero">
        <div class="task-view__chips">
          <v-chip v-if="task.priority" color="primary" variant="flat" size="small">
            Prioridad: {{ task.priority }}
          </v-chip>
          <v-chip v-if="task.status" color="secondary" variant="tonal" size="small">
            Estado: {{ task.status }}
          </v-chip>
          <v-chip v-if="task.type" color="info" variant="tonal" size="small">
            Tipo: {{ task.type }}
          </v-chip>
        </div>
      </section>

      <v-card v-if="task.description" class="task-view__card" variant="outlined">
        <v-card-title class="task-view__section-title">Descripcion</v-card-title>
        <v-card-text class="text-body-1 text-medium-emphasis">
          {{ task.description }}
        </v-card-text>
      </v-card>

      <section class="task-view__section">
        <h3 class="task-view__section-heading">Scoring</h3>
        <div class="task-view__score-grid">
          <v-card
            v-for="score in scoreItems"
            :key="score.key"
            class="task-view__score-card"
            variant="outlined"
          >
            <v-icon :icon="score.icon" :color="score.color" size="28"/>
            <span class="task-view__score-label">{{ score.label }}</span>
            <strong class="task-view__score-value">{{ formatScore(score.value) }}</strong>
          </v-card>
        </div>
      </section>

      <v-card class="task-view__card" variant="outlined">
        <v-card-title class="task-view__section-title">Timeline y tracking</v-card-title>
        <v-card-text>
          <div v-if="dateItems.length" class="task-view__detail-list">
            <div v-for="item in dateItems" :key="item.key" class="task-view__detail-row">
              <div class="task-view__detail-label">
                <v-icon :icon="item.icon" size="20"/>
                <span>{{ item.label }}</span>
              </div>
              <strong>{{ item.value }}</strong>
            </div>
          </div>

          <v-alert v-if="!dateItems.length" type="info" variant="tonal" density="compact">
            Sin fechas cargadas.
          </v-alert>
        </v-card-text>
      </v-card>

      <v-card v-if="classificationItems.length" class="task-view__card" variant="outlined">
        <v-card-title class="task-view__section-title">Clasificacion e integraciones</v-card-title>
        <v-card-text class="task-view__detail-list">
          <div v-for="item in classificationItems" :key="item.key" class="task-view__detail-row">
            <div class="task-view__detail-label">
              <v-icon :icon="item.icon" size="20"/>
              <span>{{ item.label }}</span>
            </div>
            <strong>
              <crud-ref-display v-if="item.key === 'project'"
                                :entity="ProjectCrud.instance"
                                :value="item.value"
                                display-field="name"
              ></crud-ref-display>
              <crud-ref-display v-else-if="item.key === 'goals'"
                                :entity="GoalCrud.instance"
                                :value="item.value"
                                display-field="name"
              ></crud-ref-display>
              <template v-else>
                {{ item.value }}
              </template>

            </strong>
          </div>
          <div v-if="task.tags?.length">
            <span class="task-view__mini-label">Tags</span>
            <div class="task-view__chips">
              <v-chip v-for="tag in task.tags" :key="tag" size="small" variant="tonal" color="tertiary">
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </v-card-text>

      </v-card>


      <v-card class="task-view__card" variant="outlined">
        <v-card-title class="task-view__panel-title">
          <v-icon icon="mdi-note-text-outline" color="primary"/>
          Notas
          <v-chip class="ml-auto" size="x-small" variant="tonal">{{ normalizedNotes.length }}</v-chip>
        </v-card-title>
        <v-card-text v-if="normalizedNotes.length" class="task-view__stack">
          <div v-for="(note, index) in normalizedNotes" :key="`${note.date || index}-${note.note}`"
               class="task-view__note">
            <div class="task-view__note-meta">
              <strong>Nota {{ index + 1 }}</strong>
              <span v-if="note.date">{{ formatDateTime(note.date) }}</span>
            </div>
            <p>{{ note.note }}</p>
          </div>
        </v-card-text>
        <v-card-text v-else class="text-medium-emphasis">Sin notas cargadas.</v-card-text>
      </v-card>

      <v-card v-if="statusHistory.length" class="task-view__card" variant="outlined">
        <v-card-title class="task-view__panel-title">
          <v-icon icon="mdi-history" color="primary"/>
          Historial de estado
        </v-card-title>
        <v-card-text class="task-view__stack">
          <div v-for="(history, index) in statusHistory" :key="`${history.date || index}-${history.newStatus}`"
               class="task-view__history">
            <span>{{ formatDateTime(history.date) || "Sin fecha" }}</span>
            <strong>{{ history.previousStatus || "Sin estado" }} -> {{ history.newStatus || "Sin estado" }}</strong>
          </div>
        </v-card-text>
      </v-card>
    </main>

    <!--    <v-btn-->
    <!--        class="task-view__fab"-->
    <!--        icon="mdi-play"-->
    <!--        color="primary"-->
    <!--        size="large"-->
    <!--        elevation="8"-->
    <!--        @click="onStart"-->
    <!--    />-->
  </v-sheet>

  <v-alert v-else type="info" variant="tonal">
    No hay tarea seleccionada.
  </v-alert>
</template>

<style scoped>
.task-view {
  min-height: 100%;
  position: relative;
}

.task-view__appbar {
  align-items: center;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-height: 64px;
  padding: 8px 16px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.task-view__appbar-title {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.task-view__appbar-actions {
  display: flex;
  flex: 0 0 auto;
}

.task-view__title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 0;
  max-width: min(680px, 64vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-view__content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0 auto;
  max-width: 920px;
  padding: 16px 16px 16px;
}

.task-view__hero {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-view__headline {
  color: rgb(var(--v-theme-on-surface));
  font-size: clamp(1.45rem, 2vw, 2rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0;
}

.task-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.task-view__card {
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
}

.task-view__section,
.task-view__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-view__section-title,
.task-view__panel-title {
  align-items: center;
  color: rgb(var(--v-theme-primary));
  display: flex;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 8px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.task-view__section-heading {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0 4px;
}

.task-view__score-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.task-view__score-card {
  align-items: center;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 10px;
}

.task-view__score-label,
.task-view__mini-label {
  color: rgba(var(--v-theme-on-surface), 0.62);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.task-view__score-value {
  color: rgb(var(--v-theme-primary));
  font-size: 1.35rem;
  line-height: 1;
}

.task-view__detail-list {
  display: flex;
  flex-direction: column;
}

.task-view__detail-row {
  align-items: center;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 0;
}

.task-view__detail-row:last-child {
  border-bottom: 0;
}

.task-view__detail-label {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.72);
  display: flex;
  gap: 8px;
}

.task-view__detail-row strong {
  font-weight: 700;
  text-align: right;
}

.task-view__context {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.task-view__context-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.task-view__context-item {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 10px;
}

.task-view__context-item > span {
  color: rgba(var(--v-theme-on-surface), 0.62);
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.task-view__context-item > div {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.task-view__note p {
  margin: 0;
}

.task-view__note,
.task-view__history {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding-bottom: 12px;
}

.task-view__note:last-child,
.task-view__history:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.task-view__note-meta,
.task-view__history {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.task-view__note-meta span,
.task-view__history span {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.82rem;
}

.task-view__fab {
  bottom: 24px;
  position: fixed;
  right: 24px;
  z-index: 3;
}

@media (max-width: 720px) {
  .task-view__title {
    max-width: 58vw;
  }

  .task-view__content {
    padding-inline: 12px;
  }

  .task-view__score-grid,
  .task-view__context-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-view__detail-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .task-view__detail-row strong {
    text-align: left;
  }
}

@media (max-width: 420px) {
  .task-view__score-grid,
  .task-view__context-grid {
    grid-template-columns: 1fr;
  }
}
</style>
