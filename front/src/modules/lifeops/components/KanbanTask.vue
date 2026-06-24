<script setup lang="ts">
import {computed, onBeforeMount, onBeforeUnmount, ref} from "vue";
import {useCrud, CrudDialog, CrudFilters, CrudFiltersAction} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front";
import {useI18n} from "vue-i18n";
import {useDisplay} from "vuetify";
import TaskCrud from "../cruds/TaskCrud";
import TaskProvider from "../providers/TaskProvider";
import TaskStatusProvider from "../providers/TaskStatusProvider";
import type {ITask} from "../interfaces/ITask";
import type {ITaskStatus} from "../interfaces/ITaskStatus";
import TaskForm from "./TaskForm.vue";
import ProjectCombobox from "../comboboxes/ProjectCombobox.vue";
import GoalCombobox from "../comboboxes/GoalCombobox.vue";
import TaskTypeCombobox from "../comboboxes/TaskTypeCombobox.vue";
import LifeAreaCombobox from "../comboboxes/LifeAreaCombobox.vue";

type KanbanColumn = {
  key: string
  title: string
}

type TaskCardPropertyKey =
    "priority"
    | "status"
    | "description"
    | "dueDate"
    | "scheduledDate"
    | "completedAt"
    | "source"
    | "type"
    | "lifeArea"
    | "project"
    | "goals"
    | "tags"
    | "user"
    | "valueScore"
    | "motivationScore"
    | "effortScore"
    | "urgencyScore"
    | "redmineIssueId"
    | "emailMessageId"
    | "calendarEventId"
    | "notes"
    | "statusHistory"
    | "createdAt"
    | "updatedAt"
    | "archivedAt";

type ScoreTaskCardPropertyKey = Extract<
    TaskCardPropertyKey,
    "valueScore" | "motivationScore" | "effortScore" | "urgencyScore"
>;

type EditableTaskCardPropertyKey = Extract<
    TaskCardPropertyKey,
    "project" | "goals" | "type" | "lifeArea"
>;

type TaskCardProperty = {
  key: TaskCardPropertyKey
  label: string
  icon: string
  group: string
}

type RenderedTaskCardProperty = TaskCardProperty & {
  value: string
  color?: string
}

const taskCrud = TaskCrud.instance;
const taskProvider = TaskProvider.instance;
const taskStatusProvider = TaskStatusProvider.instance;
const {t, te} = useI18n();
const {xs} = useDisplay();

const {
  dialog,
  operation,
  onCreate,
  onEdit,
  onDelete,
  resetCrudStore,
  prepareFilters,
  prepareSort,
  filters,
  setForm
} = useCrud(taskCrud);

const tasks = ref<ITask[]>([]);
const statuses = ref<ITaskStatus[]>([]);
const loading = ref(false);
const savingIds = ref<Set<string>>(new Set());
const triagingIds = ref<Set<string>>(new Set());
const error = ref("");
const draggedTaskId = ref<string | null>(null);
const dragOverStatus = ref<string | null>(null);
const dragPointer = ref({x: 0, y: 0});
const pointerDragStart = ref<{
  taskId: string
  pointerId: number
  startX: number
  startY: number
  source: HTMLElement
} | null>(null);
const draggedColumnKey = ref<string | null>(null);
const dragOverColumnKey = ref<string | null>(null);
const newTaskTitles = ref<Record<string, string>>({});
const creatingStatuses = ref<Set<string>>(new Set());
const hiddenStatusKeys = ref<Set<string>>(new Set());
const statusOrderKeys = ref<string[]>([]);
const visibleCardPropertyKeys = ref<Set<TaskCardPropertyKey>>(new Set());
const boardScrollEl = ref<HTMLElement | null>(null);
const filtersVisible = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref<"success" | "error">("success");

const STATUS_VISIBILITY_STORAGE_KEY = "lifeops.kanbanTask.hiddenStatuses";
const STATUS_ORDER_STORAGE_KEY = "lifeops.kanbanTask.statusOrder";
const CARD_PROPERTY_STORAGE_KEY = "lifeops.kanbanTask.visibleCardProperties";
const DEFAULT_TASK_STATUS_COLOR = "#64748b";

const defaultVisibleCardPropertyKeys: TaskCardPropertyKey[] = ["priority"];
const scorePropertyKeys: ScoreTaskCardPropertyKey[] = ["valueScore", "motivationScore", "effortScore", "urgencyScore"];
const editablePropertyKeys: EditableTaskCardPropertyKey[] = ["project", "goals", "type", "lifeArea"];
const scorePropertyColors: Record<ScoreTaskCardPropertyKey, string> = {
  valueScore: "primary",
  motivationScore: "success",
  effortScore: "error",
  urgencyScore: "warning"
};
const scoreValues = Array.from({length: 10}, (_, index) => index + 1);

const cardProperties: TaskCardProperty[] = [
  {key: "priority", label: "Prioridad", icon: "mdi-flag-outline", group: "Basicas"},
  {key: "status", label: "Estado", icon: "mdi-view-column-outline", group: "Basicas"},
  {key: "description", label: "Descripcion", icon: "mdi-text-box-outline", group: "Basicas"},
  {key: "type", label: "Tipo", icon: "mdi-shape-outline", group: "Clasificacion"},
  {key: "lifeArea", label: "Area de vida", icon: "mdi-compass-outline", group: "Clasificacion"},
  {key: "source", label: "Origen", icon: "mdi-source-branch", group: "Clasificacion"},
  {key: "dueDate", label: "Vencimiento", icon: "mdi-calendar-alert", group: "Fechas"},
  {key: "scheduledDate", label: "Agendada", icon: "mdi-calendar-clock", group: "Fechas"},
  {key: "completedAt", label: "Completada", icon: "mdi-check-circle-outline", group: "Fechas"},
  {key: "createdAt", label: "Creada", icon: "mdi-plus-circle-outline", group: "Fechas"},
  {key: "updatedAt", label: "Actualizada", icon: "mdi-update", group: "Fechas"},
  {key: "archivedAt", label: "Archivada", icon: "mdi-archive-outline", group: "Fechas"},
  {key: "project", label: "Proyecto", icon: "mdi-folder-open-outline", group: "Contexto"},
  {key: "goals", label: "Objetivos", icon: "mdi-bullseye-arrow", group: "Contexto"},
  {key: "tags", label: "Tags", icon: "mdi-tag-multiple-outline", group: "Contexto"},
  {key: "user", label: "Usuario", icon: "mdi-account-circle-outline", group: "Contexto"},
  {key: "valueScore", label: "Valor", icon: "mdi-chart-line", group: "Scoring"},
  {key: "motivationScore", label: "Motivacion", icon: "mdi-lightning-bolt-outline", group: "Scoring"},
  {key: "effortScore", label: "Esfuerzo", icon: "mdi-weight-lifter", group: "Scoring"},
  {key: "urgencyScore", label: "Urgencia", icon: "mdi-alarm", group: "Scoring"},
  {key: "redmineIssueId", label: "Redmine", icon: "mdi-ticket-outline", group: "Integraciones"},
  {key: "emailMessageId", label: "Email", icon: "mdi-email-outline", group: "Integraciones"},
  {key: "calendarEventId", label: "Calendario", icon: "mdi-calendar-link", group: "Integraciones"},
  {key: "notes", label: "Notas", icon: "mdi-note-text-outline", group: "Actividad"},
  {key: "statusHistory", label: "Historial", icon: "mdi-history", group: "Actividad"}
];

const fallbackStatuses: KanbanColumn[] = [
  {key: "TODO", title: "TODO"},
  {key: "IN_PROGRESS", title: "IN_PROGRESS"},
  {key: "DONE", title: "DONE"}
];

const baseColumns = computed<KanbanColumn[]>(() => {
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

const allColumns = computed<KanbanColumn[]>(() => {
  if (statusOrderKeys.value.length === 0) {
    return baseColumns.value;
  }

  const columnsByKey = new Map(baseColumns.value.map(column => [column.key, column]));
  const orderedColumns = statusOrderKeys.value
      .map(key => columnsByKey.get(key))
      .filter((column): column is KanbanColumn => Boolean(column));
  const orderedKeys = new Set(orderedColumns.map(column => column.key));
  const newColumns = baseColumns.value.filter(column => !orderedKeys.has(column.key));

  return [...orderedColumns, ...newColumns];
});

const visibleColumns = computed(() => {
  return allColumns.value.filter(column => !hiddenStatusKeys.value.has(column.key));
});

const statusesByName = computed(() => new Map(statuses.value.map(status => [status.name || "", status])));

const tasksByStatus = computed(() => {
  return (status: string) => tasks.value.filter(task => (task.status || "") === status);
});

const totalTasks = computed(() => tasks.value.length);
const visibleTasks = computed(() => visibleColumns.value.reduce((total, column) => total + tasksByStatus.value(column.key).length, 0));
const draggedTask = computed(() => tasks.value.find(task => taskId(task) === draggedTaskId.value) || null);
const visibleCardPropertiesCount = computed(() => visibleCardPropertyKeys.value.size);
const cardPropertyGroups = computed(() => {
  const groups: Array<{name: string; properties: TaskCardProperty[]}> = [];

  for (const property of cardProperties) {
    let group = groups.find(item => item.name === property.group);
    if (!group) {
      group = {name: property.group, properties: []};
      groups.push(group);
    }
    group.properties.push(property);
  }

  return groups;
});

function setSaving(taskId: string, value: boolean) {
  const next = new Set(savingIds.value);
  if (value) {
    next.add(taskId);
  } else {
    next.delete(taskId);
  }
  savingIds.value = next;
}

function setTriaging(taskId: string, value: boolean) {
  const next = new Set(triagingIds.value);
  if (value) {
    next.add(taskId);
  } else {
    next.delete(taskId);
  }
  triagingIds.value = next;
}

function showSnackbar(message: string, color: "success" | "error") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

function taskFieldLabel(label?: string) {
  if (!label) {
    return "";
  }

  if (te(label)) {
    return t(label);
  }

  const taskFieldKey = `task.field.${label}`;
  return te(taskFieldKey) ? t(taskFieldKey) : label;
}

function cardPropertyLabel(property: TaskCardProperty) {
  return taskFieldLabel(property.key) || property.label;
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

function taskStatusColor(status?: string) {
  return statusesByName.value.get(status || "")?.color || DEFAULT_TASK_STATUS_COLOR;
}

function kanbanColumnStyle(status: string) {
  return {
    "--kanban-status-color": taskStatusColor(status)
  };
}

function entityName(entity: any) {
  if (!entity) {
    return "";
  }

  if (typeof entity === "string") {
    return entity;
  }

  const fullName = [entity.givenName || entity.firstName, entity.familyName || entity.lastName].filter(Boolean).join(" ");

  return entity.name
      || entity.displayName
      || entity.title
      || entity.username
      || entity.email
      || fullName
      || entity._id
      || "";
}

function listNames(items?: Array<any>) {
  return (items || []).map(item => entityName(item)).filter(Boolean).join(", ");
}

function formatCardDate(value?: Date | string | null) {
  if (!value) {
    return "";
  }

  return formatDate(String(value));
}

function formatScore(value?: number) {
  return typeof value === "number" ? String(Math.round(value)) : "";
}

function isScoreProperty(key: TaskCardPropertyKey): key is ScoreTaskCardPropertyKey {
  return scorePropertyKeys.includes(key as ScoreTaskCardPropertyKey);
}

function isEditableProperty(key: TaskCardPropertyKey): key is EditableTaskCardPropertyKey {
  return editablePropertyKeys.includes(key as EditableTaskCardPropertyKey);
}

function entityId(value: any) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value._id || value.id || null;
}

function editablePropertyModelValue(task: ITask, key: TaskCardPropertyKey) {
  switch (key) {
    case "project":
      return entityId(task.project);
    case "goals":
      return (task.goals || []).map(goal => entityId(goal)).filter(Boolean);
    case "type":
      return task.type || null;
    case "lifeArea":
      return task.lifeArea || null;
    default:
      return null;
  }
}

function editablePropertyPayloadValue(key: EditableTaskCardPropertyKey, value: any) {
  if (key === "goals") {
    return Array.isArray(value)
        ? value.map(item => entityId(item) || item).filter(Boolean)
        : [];
  }

  if (key === "project") {
    return entityId(value) || value || null;
  }

  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.name || value._id || null;
}

function normalizedValue(value: any) {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).sort().join("|");
  }

  return value == null ? "" : String(value);
}

function notesCount(notes?: ITask["notes"]) {
  if (!notes) {
    return 0;
  }

  if (typeof notes === "string") {
    return notes.trim() ? 1 : 0;
  }

  return notes.filter(note => note?.note).length;
}

function countLabel(count: number, singular: string, plural: string) {
  if (count <= 0) {
    return "";
  }

  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function taskCardPropertyValue(task: ITask, key: TaskCardPropertyKey) {
  const valueFormatters: Record<TaskCardPropertyKey, () => string> = {
    priority: () => task.priority || "",
    status: () => task.status || "",
    description: () => task.description || "",
    dueDate: () => formatCardDate(task.dueDate),
    scheduledDate: () => formatCardDate(task.scheduledDate),
    completedAt: () => formatCardDate(task.completedAt),
    source: () => task.source || "",
    type: () => task.type || "",
    lifeArea: () => task.lifeArea || "",
    project: () => entityName(task.project),
    goals: () => listNames(task.goals),
    tags: () => (task.tags || []).filter(Boolean).join(", "),
    user: () => entityName(task.user),
    valueScore: () => formatScore(task.valueScore),
    motivationScore: () => formatScore(task.motivationScore),
    effortScore: () => formatScore(task.effortScore),
    urgencyScore: () => formatScore(task.urgencyScore),
    redmineIssueId: () => task.redmineIssueId || "",
    emailMessageId: () => task.emailMessageId || "",
    calendarEventId: () => task.calendarEventId || "",
    notes: () => countLabel(notesCount(task.notes), "nota", "notas"),
    statusHistory: () => countLabel(task.statusHistory?.length || 0, "cambio", "cambios"),
    createdAt: () => formatCardDate(task.createdAt),
    updatedAt: () => formatCardDate(task.updatedAt),
    archivedAt: () => formatCardDate(task.archivedAt)
  };

  return valueFormatters[key]().trim();
}

function renderedCardProperties(task: ITask) {
  return cardProperties
      .filter(property => visibleCardPropertyKeys.value.has(property.key))
      .filter(property => property.key !== "priority" && property.key !== "dueDate")
      .map<RenderedTaskCardProperty | null>(property => {
        const value = taskCardPropertyValue(task, property.key);

        if (!value) {
          return null;
        }

        return {
          ...property,
          label: cardPropertyLabel(property),
          value,
          color: property.key === "status"
              ? taskStatusColor(task.status)
              : isScoreProperty(property.key) ? scorePropertyColors[property.key] : undefined
        };
      })
      .filter((property): property is RenderedTaskCardProperty => Boolean(property));
}

function loadHiddenStatuses() {
  try {
    const storedValue = localStorage.getItem(STATUS_VISIBILITY_STORAGE_KEY);
    const storedKeys = storedValue ? JSON.parse(storedValue) : [];
    hiddenStatusKeys.value = new Set(Array.isArray(storedKeys) ? storedKeys : []);
  } catch {
    hiddenStatusKeys.value = new Set();
  }
}

function loadStatusOrder() {
  try {
    const storedValue = localStorage.getItem(STATUS_ORDER_STORAGE_KEY);
    const storedKeys = storedValue ? JSON.parse(storedValue) : [];
    statusOrderKeys.value = Array.isArray(storedKeys) ? storedKeys.filter(key => typeof key === "string") : [];
  } catch {
    statusOrderKeys.value = [];
  }
}

function loadVisibleCardProperties() {
  try {
    const storedValue = localStorage.getItem(CARD_PROPERTY_STORAGE_KEY);
    const storedKeys = storedValue ? JSON.parse(storedValue) : defaultVisibleCardPropertyKeys;
    const availableKeys = new Set(cardProperties.map(property => property.key));
    visibleCardPropertyKeys.value = new Set(
        Array.isArray(storedKeys)
            ? storedKeys.filter((key): key is TaskCardPropertyKey => availableKeys.has(key))
            : defaultVisibleCardPropertyKeys
    );
  } catch {
    visibleCardPropertyKeys.value = new Set(defaultVisibleCardPropertyKeys);
  }
}

function saveHiddenStatuses() {
  localStorage.setItem(
      STATUS_VISIBILITY_STORAGE_KEY,
      JSON.stringify([...hiddenStatusKeys.value])
  );
}

function saveStatusOrder() {
  localStorage.setItem(
      STATUS_ORDER_STORAGE_KEY,
      JSON.stringify(statusOrderKeys.value)
  );
}

function saveVisibleCardProperties() {
  localStorage.setItem(
      CARD_PROPERTY_STORAGE_KEY,
      JSON.stringify([...visibleCardPropertyKeys.value])
  );
}

function isStatusVisible(key: string) {
  return !hiddenStatusKeys.value.has(key);
}

function isCardPropertyVisible(key: TaskCardPropertyKey) {
  return visibleCardPropertyKeys.value.has(key);
}

function setStatusVisible(key: string, visible: boolean) {
  const next = new Set(hiddenStatusKeys.value);
  if (visible) {
    next.delete(key);
  } else {
    next.add(key);
  }
  hiddenStatusKeys.value = next;
  saveHiddenStatuses();
}

function setCardPropertyVisible(key: TaskCardPropertyKey, visible: boolean) {
  const next = new Set(visibleCardPropertyKeys.value);
  if (visible) {
    next.add(key);
  } else {
    next.delete(key);
  }
  visibleCardPropertyKeys.value = next;
  saveVisibleCardProperties();
}

function showAllStatuses() {
  hiddenStatusKeys.value = new Set();
  saveHiddenStatuses();
}

function showDefaultCardProperties() {
  visibleCardPropertyKeys.value = new Set(defaultVisibleCardPropertyKeys);
  saveVisibleCardProperties();
}

function showAllCardProperties() {
  visibleCardPropertyKeys.value = new Set(cardProperties.map(property => property.key));
  saveVisibleCardProperties();
}

function resetStatusOrder() {
  statusOrderKeys.value = [];
  saveStatusOrder();
}

function persistColumnOrder(columns: KanbanColumn[]) {
  statusOrderKeys.value = columns.map(column => column.key);
  saveStatusOrder();
}

function moveColumn(key: string, direction: -1 | 1) {
  const currentColumns = [...allColumns.value];
  const currentIndex = currentColumns.findIndex(column => column.key === key);
  const nextIndex = currentIndex + direction;

  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentColumns.length) {
    return;
  }

  const [column] = currentColumns.splice(currentIndex, 1);
  currentColumns.splice(nextIndex, 0, column);
  persistColumnOrder(currentColumns);
}

function onColumnOrderDragStart(key: string) {
  draggedColumnKey.value = key;
}

function onColumnOrderDragEnd() {
  draggedColumnKey.value = null;
  dragOverColumnKey.value = null;
}

function onColumnOrderDrop(targetKey: string) {
  const sourceKey = draggedColumnKey.value;
  draggedColumnKey.value = null;
  dragOverColumnKey.value = null;

  if (!sourceKey || sourceKey === targetKey) {
    return;
  }

  const currentColumns = [...allColumns.value];
  const sourceIndex = currentColumns.findIndex(column => column.key === sourceKey);
  const targetIndex = currentColumns.findIndex(column => column.key === targetKey);

  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }

  const [column] = currentColumns.splice(sourceIndex, 1);
  const nextTargetIndex = currentColumns.findIndex(currentColumn => currentColumn.key === targetKey);
  currentColumns.splice(nextTargetIndex, 0, column);
  persistColumnOrder(currentColumns);
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
  } catch (e: any) {
    error.value = e?.message || "No se pudo cargar el tablero";
  } finally {
    loading.value = false;
  }
}

async function fetchTasks() {
  const limit = 500;
  const firstPage = await taskProvider.paginate({
    page: 1,
    limit,
    orderBy: "updatedAt",
    order: "desc",
    filters: filters.value
  });
  const totalPages = Math.ceil(firstPage.total / limit);

  if (totalPages <= 1) {
    return firstPage.items;
  }

  const restPages = await Promise.all(
      Array.from({length: totalPages - 1}, (_, index) => (
          taskProvider.paginate({
            page: index + 2,
            limit,
            orderBy: "updatedAt",
            order: "desc",
            filters: filters.value
          })
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
    newTaskTitles.value[status] = "";
  } catch (e: any) {
    error.value = e?.message || "No se pudo crear la tarea";
  } finally {
    setCreating(status, false);
  }
}

async function triageTask(task: ITask) {
  const id = taskId(task);
  if (!id || triagingIds.value.has(id)) {
    return;
  }

  setTriaging(id, true);
  error.value = "";
  try {
    const triaged = await taskProvider.triage(id);
    replaceTask(triaged);
    showSnackbar("Tarea analizada y actualizada con IA", "success");
  } catch (e: any) {
    console.error("Error triaging task:", e);
    showSnackbar(e?.message || "No se pudo analizar la tarea con IA", "error");
  } finally {
    setTriaging(id, false);
  }
}

async function updateTaskScore(task: ITask, key: TaskCardPropertyKey, value: number) {
  if (!isScoreProperty(key)) {
    return;
  }

  const id = taskId(task);
  if (!id || savingIds.value.has(id)) {
    return;
  }

  const previousValue = task[key];
  if (previousValue === value) {
    return;
  }

  task[key] = value;
  setSaving(id, true);
  error.value = "";
  try {
    const updatedTask = await taskProvider.updatePartial(id, {[key]: value} as Partial<ITask>);
    replaceTask(updatedTask);
    showSnackbar("Puntaje actualizado", "success");
  } catch (e: any) {
    task[key] = previousValue;
    console.error("Error updating task score:", e);
    showSnackbar(e?.message || "No se pudo actualizar el puntaje", "error");
  } finally {
    setSaving(id, false);
  }
}

async function updateEditableTaskProperty(task: ITask, key: TaskCardPropertyKey, value: any) {
  if (!isEditableProperty(key)) {
    return;
  }

  const id = taskId(task);
  if (!id || savingIds.value.has(id)) {
    return;
  }

  const payloadValue = editablePropertyPayloadValue(key, value);
  const previousValue = editablePropertyPayloadValue(key, editablePropertyModelValue(task, key));

  if (normalizedValue(previousValue) === normalizedValue(payloadValue)) {
    return;
  }

  setSaving(id, true);
  error.value = "";
  try {
    const updatedTask = await taskProvider.updatePartial(id, {[key]: payloadValue} as Partial<ITask>);
    replaceTask(updatedTask);
    showSnackbar("Tarea actualizada", "success");
  } catch (e: any) {
    console.error("Error updating task property:", e);
    showSnackbar(e?.message || "No se pudo actualizar la tarea", "error");
  } finally {
    setSaving(id, false);
  }
}

function replaceTask(updatedTask: ITask) {
  const index = tasks.value.findIndex(task => taskId(task) === taskId(updatedTask));
  if (index >= 0) {
    tasks.value.splice(index, 1, updatedTask);
  }
}

function clearTaskDrag() {
  const dragStart = pointerDragStart.value;
  if (dragStart?.source.hasPointerCapture(dragStart.pointerId)) {
    dragStart.source.releasePointerCapture(dragStart.pointerId);
  }
  pointerDragStart.value = null;
  draggedTaskId.value = null;
  dragOverStatus.value = null;
  document.body.classList.remove("kanban-pointer-dragging");
}

function statusFromPoint(clientX: number, clientY: number) {
  const element = document.elementFromPoint(clientX, clientY);
  const column = element?.closest<HTMLElement>("[data-kanban-status]");
  return column ? column.dataset.kanbanStatus ?? "" : null;
}

function updateDragOverFromPoint(clientX: number, clientY: number) {
  const status = statusFromPoint(clientX, clientY);
  if (status !== null) {
    dragOverStatus.value = status;
  } else {
    dragOverStatus.value = null;
  }
}

function autoScrollBoard(clientX: number) {
  const board = boardScrollEl.value;
  if (!board) {
    return;
  }

  const rect = board.getBoundingClientRect();
  const edgeSize = 72;
  const scrollStep = 18;

  if (clientX < rect.left + edgeSize) {
    board.scrollLeft -= scrollStep;
  } else if (clientX > rect.right - edgeSize) {
    board.scrollLeft += scrollStep;
  }
}

function onTaskPointerDown(task: ITask, event: PointerEvent) {
  if (event.button !== 0) {
    return;
  }

  const target = event.target as HTMLElement;
  if (target.closest(".kanban-card__action, .kanban-score-chip, .kanban-score-menu, .kanban-editable-chip, .kanban-editable-menu")) {
    return;
  }

  const source = event.currentTarget as HTMLElement;
  source.setPointerCapture(event.pointerId);

  pointerDragStart.value = {
    taskId: taskId(task),
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    source
  };

  window.addEventListener("pointermove", onTaskPointerMove, {passive: false});
  window.addEventListener("pointerup", onTaskPointerUp);
  window.addEventListener("pointercancel", onTaskPointerCancel);
}

function onTaskPointerMove(event: PointerEvent) {
  const dragStart = pointerDragStart.value;
  if (!dragStart) {
    return;
  }
  if (event.pointerId !== dragStart.pointerId) {
    return;
  }

  const movedX = Math.abs(event.clientX - dragStart.startX);
  const movedY = Math.abs(event.clientY - dragStart.startY);
  if (!draggedTaskId.value && movedX + movedY < 6) {
    return;
  }

  event.preventDefault();
  draggedTaskId.value = dragStart.taskId;
  dragPointer.value = {x: event.clientX, y: event.clientY};
  document.body.classList.add("kanban-pointer-dragging");
  autoScrollBoard(event.clientX);
  updateDragOverFromPoint(event.clientX, event.clientY);
}

async function onTaskPointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerDragStart.value?.pointerId) {
    return;
  }

  window.removeEventListener("pointermove", onTaskPointerMove);
  window.removeEventListener("pointerup", onTaskPointerUp);
  window.removeEventListener("pointercancel", onTaskPointerCancel);

  const movedTaskId = draggedTaskId.value;
  const targetStatus = movedTaskId ? statusFromPoint(event.clientX, event.clientY) : null;
  clearTaskDrag();

  if (movedTaskId && targetStatus !== null) {
    const task = tasks.value.find(item => taskId(item) === movedTaskId);
    if (task) {
      await moveTask(task, targetStatus);
    }
  }
}

function onTaskPointerCancel() {
  window.removeEventListener("pointermove", onTaskPointerMove);
  window.removeEventListener("pointerup", onTaskPointerUp);
  window.removeEventListener("pointercancel", onTaskPointerCancel);
  clearTaskDrag();
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

function openDelete(task: ITask) {
  onDelete(task);
}

async function onFormSaved() {
  dialog.value = false;
  await loadBoard();
}

async function clearBoardFilters() {
  prepareFilters();
  await loadBoard();
}

onBeforeMount(async () => {
  loadHiddenStatuses();
  loadStatusOrder();
  loadVisibleCardProperties();
  resetCrudStore();
  prepareFilters();
  prepareSort();
  await loadBoard();
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onTaskPointerMove);
  window.removeEventListener("pointerup", onTaskPointerUp);
  window.removeEventListener("pointercancel", onTaskPointerCancel);
  clearTaskDrag();
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
        <v-btn
            v-if="taskCrud.filtersEnable"
            :icon="xs ? (filtersVisible ? 'mdi-filter-off-outline' : 'mdi-filter-outline') : undefined"
            :prepend-icon="xs ? undefined : (filtersVisible ? 'mdi-filter-off-outline' : 'mdi-filter-outline')"
            variant="tonal"
            density="compact"
            :title="filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'"
            :aria-label="filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'"
            @click="filtersVisible = !filtersVisible"
        >
          <span v-if="!xs">{{ filtersVisible ? "Ocultar filtros" : "Mostrar filtros" }}</span>
        </v-btn>
        <v-menu :close-on-content-click="false" location="bottom end">
          <template #activator="{props}">
            <v-badge
                v-if="xs"
                :content="visibleCardPropertiesCount"
                color="primary"
                location="top end"
            >
              <v-btn
                  v-bind="props"
                  icon="mdi-card-text-outline"
                  variant="tonal"
                  title="Propiedades"
                  aria-label="Propiedades"
              />
            </v-badge>
            <v-btn
                v-else
                v-bind="props"
                prepend-icon="mdi-card-text-outline"
                variant="tonal"
            >
              <span>Propiedades</span>
              <v-chip
                  class="ml-2"
                  size="x-small"
                  variant="flat"
              >
                {{ visibleCardPropertiesCount }}
              </v-chip>
            </v-btn>
          </template>

          <v-card
              class="kanban-property-selector"
              :min-width="xs ? undefined : 380"
              :width="xs ? 'calc(100vw - 32px)' : undefined"
          >
            <v-card-title class="text-subtitle-1">Propiedades de tarjeta</v-card-title>
            <v-card-text>
              <div class="kanban-property-groups">
                <section
                    v-for="group in cardPropertyGroups"
                    :key="group.name"
                    class="kanban-property-group"
                >
                  <div class="kanban-property-group__title">{{ group.name }}</div>
                  <div class="kanban-property-list">
                    <label
                        v-for="property in group.properties"
                        :key="property.key"
                        class="kanban-property-row"
                    >
                      <v-checkbox
                          :model-value="isCardPropertyVisible(property.key)"
                          density="compact"
                          hide-details
                          color="primary"
                          @update:model-value="setCardPropertyVisible(property.key, Boolean($event))"
                      />
                      <v-icon :icon="property.icon" size="18" class="text-medium-emphasis"/>
                      <span>{{ cardPropertyLabel(property) }}</span>
                    </label>
                  </div>
                </section>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" @click="showDefaultCardProperties">
                Predeterminado
              </v-btn>
              <v-spacer/>
              <v-btn variant="text" @click="showAllCardProperties">
                Mostrar todas
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-menu :close-on-content-click="false" location="bottom end">
          <template #activator="{props}">
            <v-btn
                v-bind="props"
                :icon="xs ? 'mdi-view-column-outline' : undefined"
                :prepend-icon="xs ? undefined : 'mdi-view-column-outline'"
                variant="tonal"
                title="Estados"
                aria-label="Estados"
            >
              <span v-if="!xs">Estados</span>
            </v-btn>
          </template>

          <v-card
              class="kanban-status-selector"
              :min-width="xs ? undefined : 360"
              :width="xs ? 'calc(100vw - 32px)' : undefined"
          >
            <v-card-title class="text-subtitle-1">Estados y orden</v-card-title>
            <v-card-text>
              <div class="kanban-status-list">
                <div
                    v-for="(column, index) in allColumns"
                    :key="column.key"
                    class="kanban-status-row"
                    :class="{'kanban-status-row--over': dragOverColumnKey === column.key}"
                    draggable="true"
                    @dragstart="onColumnOrderDragStart(column.key)"
                    @dragend="onColumnOrderDragEnd"
                    @dragover.prevent="dragOverColumnKey = column.key"
                    @dragleave="dragOverColumnKey = null"
                    @drop.prevent="onColumnOrderDrop(column.key)"
                >
                  <v-icon icon="mdi-drag" size="18" class="text-medium-emphasis kanban-status-row__drag"/>
                  <v-checkbox
                      :model-value="isStatusVisible(column.key)"
                      density="compact"
                      hide-details
                      color="primary"
                      @update:model-value="setStatusVisible(column.key, Boolean($event))"
                  />
                  <span class="kanban-status-row__title">{{ column.title }}</span>
                  <v-btn
                      icon="mdi-arrow-up"
                      variant="text"
                      density="comfortable"
                      size="small"
                      title="Subir"
                      :disabled="index === 0"
                      @click.stop="moveColumn(column.key, -1)"
                  />
                  <v-btn
                      icon="mdi-arrow-down"
                      variant="text"
                      density="comfortable"
                      size="small"
                      title="Bajar"
                      :disabled="index === allColumns.length - 1"
                      @click.stop="moveColumn(column.key, 1)"
                  />
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" @click="resetStatusOrder">
                Orden predeterminado
              </v-btn>
              <v-spacer/>
              <v-btn variant="text" @click="showAllStatuses">
                Mostrar todos
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
        <v-btn
            :icon="xs ? 'mdi-refresh' : undefined"
            :prepend-icon="xs ? undefined : 'mdi-refresh'"
            variant="text"
            :loading="loading"
            title="Actualizar"
            aria-label="Actualizar"
            @click="loadBoard"
        >
          <span v-if="!xs">Actualizar</span>
        </v-btn>
        <v-btn
            :icon="xs ? 'mdi-plus' : undefined"
            :prepend-icon="xs ? undefined : 'mdi-plus'"
            color="primary"
            variant="flat"
            title="Nueva tarea"
            aria-label="Nueva tarea"
            @click="openCreate()"
        >
          <span v-if="!xs">Nueva tarea</span>
        </v-btn>
      </div>
    </div>

    <v-expand-transition>
      <v-card v-if="taskCrud.filtersEnable && filtersVisible" flat class="kanban-filters mb-3">
        <div class="kanban-filters__fields">
          <crud-filters
              v-model="filters"
              :entity="taskCrud"
              @apply-filter="loadBoard"
          />
        </div>
        <div class="kanban-filters__actions">
          <crud-filters-action
              :entity="taskCrud"
              @apply-filter="loadBoard"
              @clear-filter="clearBoardFilters"
          />
        </div>
      </v-card>
    </v-expand-transition>

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

    <div ref="boardScrollEl" class="kanban-board-scroll">
      <template v-if="visibleColumns.length > 0">
        <div class="kanban-board">
          <section
              v-for="column in visibleColumns"
              :key="column.key"
              class="kanban-column"
              :class="{'kanban-column--over': dragOverStatus === column.key}"
              :data-kanban-status="column.key"
              :style="kanbanColumnStyle(column.key)"
          >
            <header class="kanban-column__header">
              <div>
                <h2 class="text-subtitle-1 font-weight-medium kanban-column__title">
                  <span class="kanban-column__color"/>
                  <span>{{ column.title }}</span>
                </h2>
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

            <form
                class="kanban-create"
                @submit.prevent="createInlineTask(column.key)"
            >
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
                  :class="[
                      `kanban-card--priority-${priorityColor(task.priority)}`,
                      {
                        'kanban-card--saving': savingIds.has(task._id),
                        'kanban-card--dragging': draggedTaskId === task._id
                      }
                  ]"
                  @pointerdown="onTaskPointerDown(task, $event)"
              >
                <div class="kanban-card__accent"/>

                <div class="kanban-card__body">
                  <div class="kanban-card__top">
                    <v-chip
                        v-if="isCardPropertyVisible('priority') && task.priority"
                        :color="priorityColor(task.priority)"
                        size="x-small"
                        variant="tonal"
                        class="kanban-priority-chip"
                    >
                      {{ task.priority }}
                    </v-chip>
                    <span v-else-if="isCardPropertyVisible('priority')" class="kanban-priority-placeholder">Sin prioridad</span>
                    <span v-else/>

                    <div class="kanban-card__tools">
                      <v-icon icon="mdi-drag" size="18" class="text-medium-emphasis kanban-card__drag"/>
                      <v-tooltip text="Analizar con IA">
                        <template #activator="{ props }">
                          <v-btn
                              v-bind="props"
                              class="kanban-card__action"
                              icon="mdi-auto-fix"
                              variant="text"
                              density="comfortable"
                              size="small"
                              color="primary"
                              :loading="triagingIds.has(task._id)"
                              :disabled="triagingIds.has(task._id)"
                              @click.stop="triageTask(task)"
                          />
                        </template>
                      </v-tooltip>
                      <v-btn
                          class="kanban-card__action"
                          icon="mdi-pencil-outline"
                          variant="text"
                          density="comfortable"
                          size="small"
                          title="Edicion detallada"
                          @click.stop="openEdit(task)"
                      />
                      <v-btn
                          class="kanban-card__action"
                          icon="mdi-trash-can-outline"
                          variant="text"
                          density="comfortable"
                          size="small"
                          color="error"
                          title="Eliminar tarea"
                          @click.stop="openDelete(task)"
                      />
                    </div>
                  </div>

                  <div class="kanban-title">
                    {{ task.title }}
                  </div>

                  <div v-if="renderedCardProperties(task).length" class="kanban-card__properties">
                    <template
                        v-for="property in renderedCardProperties(task)"
                        :key="property.key"
                    >
                      <v-menu
                          v-if="isScoreProperty(property.key)"
                          location="bottom"
                          :close-on-content-click="true"
                      >
                        <template #activator="{ props: menuProps }">
                          <v-tooltip
                              :text="property.label"
                              location="top"
                          >
                            <template #activator="{ props: tooltipProps }">
                              <v-chip
                                  v-bind="{...tooltipProps, ...menuProps}"
                                  :color="property.color"
                                  :disabled="savingIds.has(task._id)"
                                  size="x-small"
                                  variant="tonal"
                                  class="kanban-property-chip kanban-score-chip"
                                  @click.stop
                              >
                                <v-icon :icon="property.icon" size="14" start/>
                                <span class="kanban-property-chip__value">{{ property.value }}</span>
                              </v-chip>
                            </template>
                          </v-tooltip>
                        </template>

                        <v-card class="kanban-score-menu" @click.stop>
                          <v-card-subtitle class="kanban-score-menu__title">
                            {{ property.label }}
                          </v-card-subtitle>
                          <div class="kanban-score-menu__grid">
                            <v-btn
                                v-for="scoreValue in scoreValues"
                                :key="scoreValue"
                                :color="Number(property.value) === scoreValue ? property.color : undefined"
                                :variant="Number(property.value) === scoreValue ? 'flat' : 'text'"
                                size="small"
                                class="kanban-score-menu__option"
                                @click.stop="updateTaskScore(task, property.key, scoreValue)"
                            >
                              {{ scoreValue }}
                            </v-btn>
                          </div>
                        </v-card>
                      </v-menu>
                      <v-menu
                          v-else-if="isEditableProperty(property.key)"
                          location="bottom"
                          :close-on-content-click="false"
                      >
                        <template #activator="{ props: menuProps }">
                          <v-tooltip
                              :text="property.label"
                              location="top"
                          >
                            <template #activator="{ props: tooltipProps }">
                              <v-chip
                                  v-bind="{...tooltipProps, ...menuProps}"
                                  :color="property.color"
                                  :disabled="savingIds.has(task._id)"
                                  size="x-small"
                                  variant="tonal"
                                  class="kanban-property-chip kanban-editable-chip"
                                  @click.stop
                              >
                                <v-icon :icon="property.icon" size="14" start/>
                                <span class="kanban-property-chip__value">{{ property.value }}</span>
                              </v-chip>
                            </template>
                          </v-tooltip>
                        </template>

                        <v-card class="kanban-editable-menu" @click.stop>
                          <v-card-subtitle class="kanban-score-menu__title">
                            {{ property.label }}
                          </v-card-subtitle>
                          <project-combobox
                              v-if="property.key === 'project'"
                              :model-value="editablePropertyModelValue(task, property.key)"
                              :label="taskFieldLabel('project')"
                              density="compact"
                              variant="outlined"
                              hide-details
                              :clearable="false"
                              @update:model-value="updateEditableTaskProperty(task, property.key, $event)"
                          />
                          <goal-combobox
                              v-else-if="property.key === 'goals'"
                              :model-value="editablePropertyModelValue(task, property.key)"
                              :label="taskFieldLabel('goals')"
                              density="compact"
                              variant="outlined"
                              multiple
                              chips
                              hide-details
                              :clearable="false"
                              @update:model-value="updateEditableTaskProperty(task, property.key, $event)"
                          />
                          <task-type-combobox
                              v-else-if="property.key === 'type'"
                              :model-value="editablePropertyModelValue(task, property.key)"
                              :label="taskFieldLabel('type')"
                              item-value="name"
                              density="compact"
                              variant="outlined"
                              hide-details
                              :clearable="false"
                              @update:model-value="updateEditableTaskProperty(task, property.key, $event)"
                          />
                          <life-area-combobox
                              v-else-if="property.key === 'lifeArea'"
                              :model-value="editablePropertyModelValue(task, property.key)"
                              :label="taskFieldLabel('lifeArea')"
                              item-value="name"
                              density="compact"
                              variant="outlined"
                              hide-details
                              :clearable="false"
                              @update:model-value="updateEditableTaskProperty(task, property.key, $event)"
                          />
                        </v-card>
                      </v-menu>
                      <v-chip
                          v-else
                          :color="property.color"
                          size="x-small"
                          variant="tonal"
                          class="kanban-property-chip"
                      >
                        <v-icon :icon="property.icon" size="14" start/>
                        <span class="kanban-property-chip__label">{{ property.label }}</span>
                        <span class="kanban-property-chip__value">{{ property.value }}</span>
                      </v-chip>
                    </template>
                  </div>

                  <div
                      v-if="(isCardPropertyVisible('dueDate') && task.dueDate) || savingIds.has(task._id)"
                      class="kanban-card__meta"
                  >
                    <v-chip
                        v-if="isCardPropertyVisible('dueDate') && task.dueDate"
                        size="x-small"
                        variant="tonal"
                        class="kanban-date-chip"
                    >
                      <v-icon icon="mdi-calendar" size="14" start/>
                      {{ formatDate(String(task.dueDate)) }}
                    </v-chip>
                    <span v-else/>
                    <v-progress-circular
                        v-if="savingIds.has(task._id)"
                        indeterminate
                        size="16"
                        width="2"
                        color="primary"
                    />
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div
            v-if="draggedTask"
            class="kanban-drag-ghost"
            :style="{left: `${dragPointer.x}px`, top: `${dragPointer.y}px`}"
        >
          {{ draggedTask.title }}
        </div>
      </template>

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

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.kanban-task {
  max-width: 100%;
  min-height: 100%;
  min-width: 0;
  position: relative;
  z-index: 2;
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

.kanban-actions :deep(.v-btn) {
  min-height: 32px;
}

.kanban-filters {
  align-items: center;
  background: transparent;
  display: flex;
  gap: 8px;
  padding: 0;
}

.kanban-filters__fields {
  flex: 1 1 auto;
  min-width: 0;
}

.kanban-filters__fields :deep(.v-card) {
  background: transparent;
}

.kanban-filters__fields :deep(.v-row) {
  margin: 0;
}

.kanban-filters__fields :deep(.v-col) {
  padding: 0 4px;
}

.kanban-filters__fields :deep(.v-field) {
  min-height: 36px;
}

.kanban-filters__fields :deep(.v-field__input) {
  min-height: 34px;
  padding-bottom: 4px;
  padding-top: 4px;
}

.kanban-filters__actions {
  flex: 0 0 auto;
}

.kanban-filters__actions :deep(.v-card-actions) {
  gap: 6px;
  min-height: 36px;
  padding: 0;
}

.kanban-filters__actions :deep(.v-spacer) {
  display: none;
}

.kanban-filters__actions :deep(.v-btn) {
  min-height: 32px;
  padding-inline: 10px;
}

.kanban-status-selector,
.kanban-property-selector {
  border-radius: 8px;
}

.kanban-property-groups {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kanban-property-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kanban-property-group__title {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.kanban-property-list {
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.kanban-property-row {
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  display: grid;
  gap: 4px;
  grid-template-columns: 34px 20px minmax(0, 1fr);
  min-height: 34px;
  padding-right: 6px;
}

.kanban-property-row:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.kanban-property-row span {
  font-size: 0.84rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-status-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kanban-status-row {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 6px;
  display: grid;
  gap: 4px;
  grid-template-columns: 24px 40px minmax(0, 1fr) 32px 32px;
  min-height: 40px;
  padding: 2px 4px;
  transition: background-color 120ms ease, border-color 120ms ease;
}

.kanban-status-row--over {
  background: rgba(var(--v-theme-primary), 0.05);
  border-color: rgb(var(--v-theme-primary));
}

.kanban-status-row__drag {
  cursor: grab;
}

.kanban-status-row__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 14px;
  min-width: max-content;
}

.kanban-column {
  --kanban-status-color: #64748b;
  background:
      linear-gradient(180deg, color-mix(in srgb, var(--kanban-status-color) 12%, transparent), transparent 180px),
      color-mix(in srgb, rgb(var(--v-theme-surface)) 90%, var(--kanban-status-color) 10%);
  border: 1px solid color-mix(in srgb, var(--kanban-status-color) 38%, rgba(var(--v-border-color), var(--v-border-opacity)));
  border-radius: 12px;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--kanban-status-color) 18%, transparent);
  display: flex;
  flex: 0 0 320px;
  flex-direction: column;
  max-height: calc(100vh - 190px);
  min-height: 420px;
  overflow: hidden;
  width: 320px;
  transition: border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
}

.kanban-column--over {
  background:
      linear-gradient(180deg, color-mix(in srgb, var(--kanban-status-color) 20%, transparent), color-mix(in srgb, var(--kanban-status-color) 8%, transparent)),
      color-mix(in srgb, rgb(var(--v-theme-surface)) 82%, var(--kanban-status-color) 18%);
  border-color: var(--kanban-status-color);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--kanban-status-color) 26%, transparent);
}

.kanban-column__header {
  align-items: flex-start;
  border-bottom: 1px solid color-mix(in srgb, var(--kanban-status-color) 30%, rgba(var(--v-border-color), var(--v-border-opacity)));
  display: flex;
  justify-content: space-between;
  padding: 14px 14px 10px;
}

.kanban-column__title {
  align-items: center;
  display: flex;
  gap: 8px;
  min-width: 0;
}

.kanban-column__title span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-column__color {
  background: var(--kanban-status-color);
  border-radius: 999px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--kanban-status-color) 18%, transparent);
  flex: 0 0 10px;
  height: 10px;
  width: 10px;
}

.kanban-create {
  align-items: center;
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 32px;
  padding: 10px 12px 8px;
}

.kanban-create :deep(.v-field) {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 10px;
}

.kanban-column__items {
  background:
      linear-gradient(180deg, rgba(var(--v-theme-background), 0.62), rgba(var(--v-theme-background), 0.28)),
      rgba(var(--v-theme-surface), 0.42);
  border-radius: 10px;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  margin: 0 10px 10px;
  min-height: 0;
  overflow-y: auto;
  padding: 10px;
  scrollbar-gutter: stable;
  transition: background-color 120ms ease, outline-color 120ms ease;
}

.kanban-column--over .kanban-column__items {
  outline: 2px dashed rgba(var(--v-theme-primary), 0.42);
  outline-offset: -6px;
}

.kanban-drag-ghost {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.24);
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.92rem;
  font-weight: 600;
  left: 0;
  max-width: 280px;
  min-width: 220px;
  padding: 12px 14px;
  pointer-events: none;
  position: fixed;
  top: 0;
  transform: translate(12px, 12px);
  user-select: none;
  z-index: 10000;
}

.kanban-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) + 0.06));
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  cursor: grab;
  display: flex;
  flex: 0 0 auto;
  min-height: 0;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
}

.kanban-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.38);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card--saving {
  opacity: 0.72;
}

.kanban-card--dragging {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 16px 32px rgba(var(--v-theme-primary), 0.18);
  opacity: 0.72;
  transform: scale(0.98);
}

.kanban-card__accent {
  background: rgba(var(--v-theme-primary), 0.6);
  flex: 0 0 6px;
}

.kanban-card--priority-error .kanban-card__accent {
  background: rgb(var(--v-theme-error));
}

.kanban-card--priority-warning .kanban-card__accent {
  background: rgb(var(--v-theme-warning));
}

.kanban-card--priority-success .kanban-card__accent {
  background: rgb(var(--v-theme-success));
}

.kanban-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: 10px 10px 9px 12px;
}

.kanban-card__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 30px;
}

.kanban-card__tools {
  align-items: center;
  display: flex;
  gap: 2px;
  margin-right: -4px;
}

.kanban-card__drag {
  cursor: grab;
}

.kanban-title {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.35;
  padding: 8px 0 10px;
}

.kanban-card__properties {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding-bottom: 9px;
}

.kanban-property-chip {
  max-width: 100%;
}

.kanban-score-chip {
  cursor: pointer;
}

.kanban-editable-chip {
  cursor: pointer;
}

.kanban-score-menu {
  padding: 6px;
}

.kanban-editable-menu {
  min-width: 280px;
  padding: 6px;
}

.kanban-score-menu__title {
  font-size: 0.76rem;
  min-height: 0;
  padding: 2px 4px 6px;
}

.kanban-score-menu__grid {
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(5, 30px);
}

.kanban-score-menu__option {
  min-width: 30px;
  padding: 0;
}

.kanban-property-chip__label {
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-weight: 700;
  margin-right: 4px;
}

.kanban-property-chip__value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanban-card__meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: space-between;
  margin-top: auto;
  min-height: 24px;
}

.kanban-priority-chip {
  max-width: 180px;
}

.kanban-priority-placeholder,
.kanban-date-placeholder {
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.58);
  display: inline-flex;
  font-size: 0.72rem;
  gap: 4px;
}

.kanban-date-chip {
  max-width: 190px;
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

  .kanban-filters {
    align-items: stretch;
    flex-direction: column;
  }

  .kanban-filters__fields :deep(.v-col) {
    padding: 3px 0;
  }

  .kanban-filters__actions :deep(.v-card-actions) {
    justify-content: flex-end;
  }

  .kanban-column {
    flex-basis: 86vw;
    width: 86vw;
  }

  .kanban-property-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .kanban-actions {
    justify-content: flex-start;
  }

  .kanban-actions :deep(.v-btn),
  .kanban-actions :deep(.v-badge) {
    flex: 0 0 auto;
  }

  .kanban-status-selector :deep(.v-card-actions),
  .kanban-property-selector :deep(.v-card-actions) {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .kanban-status-selector :deep(.v-card-actions .v-btn),
  .kanban-property-selector :deep(.v-card-actions .v-btn) {
    flex: 1 1 auto;
  }
}
</style>
