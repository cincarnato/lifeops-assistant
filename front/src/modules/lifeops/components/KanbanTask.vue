<script setup lang="ts">
import {computed, onBeforeMount, ref} from "vue";
import {useCrud, CrudDialog} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front";
import TaskCrud from "../cruds/TaskCrud";
import TaskProvider from "../providers/TaskProvider";
import TaskStatusProvider from "../providers/TaskStatusProvider";
import type {ITask} from "../interfaces/ITask";
import type {ITaskStatus} from "../interfaces/ITaskStatus";
import TaskForm from "./TaskForm.vue";

type KanbanColumn = {
  key: string
  title: string
}

const taskCrud = TaskCrud.instance;
const taskProvider = TaskProvider.instance;
const taskStatusProvider = TaskStatusProvider.instance;

const {
  dialog,
  operation,
  onCreate,
  onEdit,
  resetCrudStore,
  prepareFilters,
  prepareSort,
  setForm
} = useCrud(taskCrud);

const tasks = ref<ITask[]>([]);
const statuses = ref<ITaskStatus[]>([]);
const loading = ref(false);
const savingIds = ref<Set<string>>(new Set());
const error = ref("");
const draggedTaskId = ref<string | null>(null);
const dragOverStatus = ref<string | null>(null);
const newTaskTitles = ref<Record<string, string>>({});
const creatingStatuses = ref<Set<string>>(new Set());
const inlineTitles = ref<Record<string, string>>({});
const hiddenStatusKeys = ref<Set<string>>(new Set());

const STATUS_VISIBILITY_STORAGE_KEY = "lifeops.kanbanTask.hiddenStatuses";

const fallbackStatuses: KanbanColumn[] = [
  {key: "TODO", title: "TODO"},
  {key: "IN_PROGRESS", title: "IN_PROGRESS"},
  {key: "DONE", title: "DONE"}
];

const allColumns = computed<KanbanColumn[]>(() => {
  const statusColumns = statuses.value.map(status => ({
    key: status.name || "",
    title: status.name || "Sin estado"
  })).filter(status => status.key);

  const known = new Set(statusColumns.map(status => status.key));
  const taskStatusColumns = tasks.value
      .map(task => task.status || "")
      .filter(status => status && !known.has(status))
      .map(status => {
        known.add(status);
        return {key: status, title: status};
      });

  const baseColumns = statusColumns.length > 0 ? statusColumns : fallbackStatuses;
  const mergedColumns = [...baseColumns, ...taskStatusColumns];

  return mergedColumns.some(column => column.key === "")
      ? mergedColumns
      : [{key: "", title: "Sin estado"}, ...mergedColumns];
});

const visibleColumns = computed(() => {
  return allColumns.value.filter(column => !hiddenStatusKeys.value.has(column.key));
});

const selectedStatusKeys = computed({
  get() {
    return allColumns.value
        .filter(column => !hiddenStatusKeys.value.has(column.key))
        .map(column => column.key);
  },
  set(value: string[]) {
    const selectedKeys = new Set(value);
    hiddenStatusKeys.value = new Set(
        allColumns.value
            .map(column => column.key)
            .filter(key => !selectedKeys.has(key))
    );
    saveHiddenStatuses();
  }
});

const tasksByStatus = computed(() => {
  return (status: string) => tasks.value.filter(task => (task.status || "") === status);
});

const totalTasks = computed(() => tasks.value.length);
const visibleTasks = computed(() => visibleColumns.value.reduce((total, column) => total + tasksByStatus.value(column.key).length, 0));

function setSaving(taskId: string, value: boolean) {
  const next = new Set(savingIds.value);
  if (value) {
    next.add(taskId);
  } else {
    next.delete(taskId);
  }
  savingIds.value = next;
}

function setCreating(status: string, value: boolean) {
  const next = new Set(creatingStatuses.value);
  if (value) {
    next.add(status);
  } else {
    next.delete(status);
  }
  creatingStatuses.value = next;
}

function taskId(task: ITask) {
  return task._id;
}

function priorityColor(priority?: string) {
  const value = (priority || "").toLowerCase();
  if (value.includes("high") || value.includes("alta") || value.includes("urgent")) return "error";
  if (value.includes("medium") || value.includes("media")) return "warning";
  if (value.includes("low") || value.includes("baja")) return "success";
  return "default";
}

function loadHiddenStatuses() {
  try {
    const storedValue = localStorage.getItem(STATUS_VISIBILITY_STORAGE_KEY);
    const storedKeys = storedValue ? JSON.parse(storedValue) : [];
    hiddenStatusKeys.value = new Set(Array.isArray(storedKeys) ? storedKeys : []);
  } catch (e) {
    hiddenStatusKeys.value = new Set();
  }
}

function saveHiddenStatuses() {
  localStorage.setItem(
      STATUS_VISIBILITY_STORAGE_KEY,
      JSON.stringify([...hiddenStatusKeys.value])
  );
}

function showAllStatuses() {
  hiddenStatusKeys.value = new Set();
  saveHiddenStatuses();
}

async function loadBoard() {
  loading.value = true;
  error.value = "";
  try {
    const [statusItems, taskItems] = await Promise.all([
      taskStatusProvider.find({limit: 100, orderBy: "name", order: "asc"}),
      fetchTasks()
    ]);

    statuses.value = statusItems;
    tasks.value = taskItems;
    inlineTitles.value = taskItems.reduce((acc, task) => {
      acc[task._id] = task.title;
      return acc;
    }, {} as Record<string, string>);
  } catch (e: any) {
    error.value = e?.message || "No se pudo cargar el tablero";
  } finally {
    loading.value = false;
  }
}

async function fetchTasks() {
  const limit = 500;
  const firstPage = await taskProvider.paginate({page: 1, limit, orderBy: "updatedAt", order: "desc"});
  const totalPages = Math.ceil(firstPage.total / limit);

  if (totalPages <= 1) {
    return firstPage.items;
  }

  const restPages = await Promise.all(
      Array.from({length: totalPages - 1}, (_, index) => (
          taskProvider.paginate({page: index + 2, limit, orderBy: "updatedAt", order: "desc"})
      ))
  );

  return [
    ...firstPage.items,
    ...restPages.flatMap(page => page.items)
  ];
}

async function moveTask(task: ITask, status: string) {
  if ((task.status || "") === status) {
    return;
  }

  const previousStatus = task.status;
  task.status = status;
  setSaving(taskId(task), true);
  error.value = "";

  try {
    const updatedTask = await taskProvider.updatePartial(taskId(task), {status});
    replaceTask(updatedTask);
  } catch (e: any) {
    task.status = previousStatus;
    error.value = e?.message || "No se pudo mover la tarea";
  } finally {
    setSaving(taskId(task), false);
  }
}

async function saveInlineTitle(task: ITask) {
  const title = (inlineTitles.value[taskId(task)] || "").trim();
  if (!title || title === task.title) {
    inlineTitles.value[taskId(task)] = task.title;
    return;
  }

  const previousTitle = task.title;
  task.title = title;
  setSaving(taskId(task), true);
  error.value = "";

  try {
    const updatedTask = await taskProvider.updatePartial(taskId(task), {title});
    replaceTask(updatedTask);
  } catch (e: any) {
    task.title = previousTitle;
    inlineTitles.value[taskId(task)] = previousTitle;
    error.value = e?.message || "No se pudo actualizar la tarea";
  } finally {
    setSaving(taskId(task), false);
  }
}

async function createInlineTask(status: string) {
  const title = (newTaskTitles.value[status] || "").trim();
  if (!title) {
    return;
  }

  setCreating(status, true);
  error.value = "";

  try {
    const createdTask = await taskProvider.create({title, status} as any);
    tasks.value = [createdTask, ...tasks.value];
    inlineTitles.value[createdTask._id] = createdTask.title;
    newTaskTitles.value[status] = "";
  } catch (e: any) {
    error.value = e?.message || "No se pudo crear la tarea";
  } finally {
    setCreating(status, false);
  }
}

function replaceTask(updatedTask: ITask) {
  const index = tasks.value.findIndex(task => taskId(task) === taskId(updatedTask));
  if (index >= 0) {
    tasks.value.splice(index, 1, updatedTask);
  }
  inlineTitles.value[taskId(updatedTask)] = updatedTask.title;
}

function onDragStart(task: ITask) {
  draggedTaskId.value = taskId(task);
}

function onDragEnd() {
  draggedTaskId.value = null;
  dragOverStatus.value = null;
}

async function onDrop(status: string) {
  const draggedTask = tasks.value.find(task => taskId(task) === draggedTaskId.value);
  dragOverStatus.value = null;
  draggedTaskId.value = null;

  if (draggedTask) {
    await moveTask(draggedTask, status);
  }
}

function openCreate(status?: string) {
  onCreate();
  if (status !== undefined) {
    setForm({...taskCrud.form, status});
  }
}

function openEdit(task: ITask) {
  onEdit(task);
}

async function onFormSaved() {
  dialog.value = false;
  await loadBoard();
}

onBeforeMount(async () => {
  loadHiddenStatuses();
  resetCrudStore();
  prepareFilters();
  prepareSort();
  await loadBoard();
});
</script>

<template>
  <v-container fluid class="kanban-task py-4">
    <div class="kanban-toolbar">
      <div>
        <h1 class="text-h5 font-weight-medium mb-1">Tareas</h1>
        <div class="text-body-2 text-medium-emphasis">
          {{ visibleTasks }} visibles de {{ totalTasks }} tareas
        </div>
      </div>
      <div class="kanban-actions">
        <v-menu :close-on-content-click="false" location="bottom end">
          <template #activator="{props}">
            <v-btn
                v-bind="props"
                prepend-icon="mdi-view-column-outline"
                variant="tonal"
            >
              Estados
            </v-btn>
          </template>

          <v-card class="kanban-status-selector" min-width="280">
            <v-card-title class="text-subtitle-1">Estados visibles</v-card-title>
            <v-card-text>
              <v-select
                  v-model="selectedStatusKeys"
                  :items="allColumns"
                  item-title="title"
                  item-value="key"
                  multiple
                  chips
                  closable-chips
                  density="compact"
                  variant="outlined"
                  hide-details
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn variant="text" @click="showAllStatuses">
                Mostrar todos
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-btn
            prepend-icon="mdi-refresh"
            variant="text"
            :loading="loading"
            @click="loadBoard"
        >
          Actualizar
        </v-btn>
        <v-btn
            prepend-icon="mdi-plus"
            color="primary"
            variant="flat"
            @click="openCreate()"
        >
          Nueva tarea
        </v-btn>
      </div>
    </div>

    <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="compact"
        class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3"/>

    <div class="kanban-board-scroll">
      <div v-if="visibleColumns.length > 0" class="kanban-board">
        <section
            v-for="column in visibleColumns"
            :key="column.key"
            class="kanban-column"
            :class="{'kanban-column--over': dragOverStatus === column.key}"
            @dragover.prevent="dragOverStatus = column.key"
            @dragleave="dragOverStatus = null"
            @drop.prevent="onDrop(column.key)"
        >
          <header class="kanban-column__header">
            <div>
              <h2 class="text-subtitle-1 font-weight-medium">{{ column.title }}</h2>
              <span class="text-caption text-medium-emphasis">
                {{ tasksByStatus(column.key).length }} tareas
              </span>
            </div>
            <v-btn
                icon="mdi-plus"
                variant="text"
                size="small"
                :title="`Crear en ${column.title}`"
                @click="openCreate(column.key)"
            />
          </header>

          <form class="kanban-create" @submit.prevent="createInlineTask(column.key)">
            <v-text-field
                v-model="newTaskTitles[column.key]"
                placeholder="Nueva tarea"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="creatingStatuses.has(column.key)"
            />
            <v-btn
                icon="mdi-check"
                size="small"
                variant="text"
                type="submit"
                :loading="creatingStatuses.has(column.key)"
            />
          </form>

          <div class="kanban-column__items">
            <article
                v-for="task in tasksByStatus(column.key)"
                :key="task._id"
                class="kanban-card"
                :class="{'kanban-card--saving': savingIds.has(task._id)}"
                draggable="true"
                @dragstart="onDragStart(task)"
                @dragend="onDragEnd"
            >
              <div class="kanban-card__top">
                <v-icon icon="mdi-drag" size="18" class="text-medium-emphasis"/>
                <v-btn
                    icon="mdi-pencil-outline"
                    variant="text"
                    density="comfortable"
                    size="small"
                    title="Edicion detallada"
                    @click="openEdit(task)"
                />
              </div>

              <v-textarea
                  v-model="inlineTitles[task._id]"
                  class="kanban-title"
                  rows="2"
                  auto-grow
                  density="compact"
                  variant="plain"
                  hide-details
                  @blur="saveInlineTitle(task)"
                  @keydown.enter.exact.prevent="saveInlineTitle(task)"
              />

              <div class="kanban-card__meta">
                <v-chip
                    v-if="task.priority"
                    :color="priorityColor(task.priority)"
                    size="x-small"
                    variant="tonal"
                >
                  {{ task.priority }}
                </v-chip>
                <v-chip v-if="task.dueDate" size="x-small" variant="tonal">
                  <v-icon icon="mdi-calendar" size="14" start/>
                  {{ formatDate(String(task.dueDate)) }}
                </v-chip>
                <v-progress-circular
                    v-if="savingIds.has(task._id)"
                    indeterminate
                    size="16"
                    width="2"
                    color="primary"
                />
              </div>
            </article>
          </div>
        </section>
      </div>

      <v-alert
          v-else
          type="info"
          variant="tonal"
          class="kanban-empty"
      >
        No hay estados visibles.
      </v-alert>
    </div>

    <crud-dialog
        v-model="dialog"
        :entity="taskCrud"
        :operation="operation"
    >
      <task-form
          @created="onFormSaved"
          @updated="onFormSaved"
          @deleted="onFormSaved"
          @canceled="dialog = false"
      />
    </crud-dialog>
  </v-container>
</template>

<style scoped>
.kanban-task {
  max-width: 100%;
  min-height: 100%;
  min-width: 0;
}

.kanban-toolbar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 16px;
}

.kanban-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.kanban-status-selector {
  border-radius: 8px;
}

.kanban-board-scroll {
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding-bottom: 12px;
  width: 100%;
}

.kanban-board {
  display: flex;
  gap: 12px;
  min-width: max-content;
}

.kanban-column {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  display: flex;
  flex: 0 0 320px;
  flex-direction: column;
  max-height: calc(100vh - 190px);
  min-height: 420px;
  width: 320px;
  transition: border-color 120ms ease, background-color 120ms ease;
}

.kanban-column--over {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgb(var(--v-theme-primary));
}

.kanban-column__header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  justify-content: space-between;
  padding: 12px 12px 8px;
}

.kanban-create {
  align-items: center;
  display: grid;
  gap: 4px;
  grid-template-columns: 1fr 32px;
  padding: 10px 10px 6px;
}

.kanban-column__items {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 8px 10px 12px;
}

.kanban-card {
  background: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  cursor: grab;
  padding: 8px;
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card--saving {
  opacity: 0.72;
}

.kanban-card__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 28px;
}

.kanban-title :deep(textarea) {
  font-size: 0.95rem;
  line-height: 1.35;
  padding-top: 0;
}

.kanban-card__meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 24px;
}

.kanban-empty {
  min-width: 280px;
}

@media (max-width: 720px) {
  .kanban-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .kanban-actions {
    justify-content: stretch;
  }

  .kanban-actions :deep(.v-btn) {
    flex: 1;
  }

  .kanban-column {
    flex-basis: 86vw;
    width: 86vw;
  }
}
</style>
