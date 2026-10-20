<script setup lang="ts">
import {computed, onBeforeUnmount, ref, watch} from "vue";
import {CrudDialog, useCrud} from '@drax/crud-vue';
import {useAuth} from '@drax/identity-vue';
import {useI18n} from "vue-i18n";
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan";
import DayPlanProvider from "../providers/DayPlanProvider";
import TaskPlanningBoard from "./TaskPlanningBoard.vue";
import TaskForm from './TaskForm.vue';
import TaskCrud from '../cruds/TaskCrud';
import TaskProvider from '../providers/TaskProvider';
import PlanningTaskPropertySelector from './PlanningTaskPropertySelector.vue';
import {usePlanningTaskProperties} from '../composables/usePlanningTaskProperties';

type DayPlanForm = IDayPlanBase & Partial<IDayPlan>
type Decision = "PENDIENTE" | "COMPROMETIDO" | "DESEABLE" | "DESCARTADO"
type DecisionTarget = { decision?: string; priority?: "A1" | "A2" | "A3" | null }

const props = defineProps<{
  item: DayPlanForm
  previousTaskIds?: string[]
  operation?: string
  compact?: boolean
}>()

const emit = defineEmits<{schedule: [taskId: string]}>()

const {t, te, locale} = useI18n()
const saveError = ref("")

const decisionOptions = computed<Array<{ title: string; value: Decision; color: string; icon: string }>>(() => [
  {title: t("dayplan.ui.committed"), value: "COMPROMETIDO", color: "success", icon: "mdi-check-circle-outline"},
  {title: t("dayplan.ui.desirable"), value: "DESEABLE", color: "info", icon: "mdi-star-outline"},
  {title: t("dayplan.ui.discarded"), value: "DESCARTADO", color: "error", icon: "mdi-close-circle-outline"}
])

const isDecisionReadonly = computed(() => ["view", "delete"].includes(props.operation || ""))

const {visibleProperties} = usePlanningTaskProperties()
const taskCrud = TaskCrud.instance
const {hasPermission} = useAuth()
const canEditTask = computed(() => hasPermission(taskCrud.permissions.update) || hasPermission(taskCrud.permissions.manage))
const {dialog: taskDialog, operation: taskOperation, onEdit: editTask, onCancel: cancelTask} = useCrud(taskCrud)
const taskEditBusy = ref(false)
const taskEditError = ref('')
let taskEditRequest = 0
let editingTaskId: string | null = null
const taskEditContext = computed(() => `${props.item._id || ''}:${props.item.date}`)
let editingContext = ''

async function openTaskEditor(taskId: string) {
  if (!taskId || isDecisionReadonly.value || !canEditTask.value || taskEditBusy.value) return
  const request = ++taskEditRequest
  editingContext = taskEditContext.value
  editingTaskId = taskId
  taskEditBusy.value = true
  taskEditError.value = ''
  try {
    // Planning references may be partial or stale; edit a fresh task, never the plan entry.
    const task = await TaskProvider.instance.findById(taskId)
    if (request !== taskEditRequest || editingContext !== taskEditContext.value || isDecisionReadonly.value || !canEditTask.value) return
    if (!task) throw new Error(t('dayplan.ui.taskEditError'))
    cancelTask()
    editTask(task)
  } catch (error) {
    if (request === taskEditRequest) taskEditError.value = error instanceof Error ? error.message : t('dayplan.ui.taskEditError')
  } finally {
    if (request === taskEditRequest) taskEditBusy.value = false
  }
}

async function onTaskUpdated(item?: Record<string, unknown>) {
  const taskId = editingTaskId
  const context = editingContext
  const request = taskEditRequest
  if (!taskId || context !== taskEditContext.value) return
  try {
    const task = item?._id === taskId ? item : await TaskProvider.instance.findById(taskId)
    if (request !== taskEditRequest || context !== taskEditContext.value) return
    if (!task) throw new Error(t('dayplan.ui.taskEditError'))
    props.item.tasks?.forEach(entry => {
      if ((typeof entry.task === 'string' ? entry.task : entry.task?._id) === taskId) entry.task = task
    })
    taskDialog.value = false
    taskEditError.value = ''
  } catch (error) {
    if (request === taskEditRequest && context === taskEditContext.value) {
      taskEditError.value = error instanceof Error ? error.message : t('dayplan.ui.taskEditError')
    }
  }
}

watch(taskEditContext, () => {
  taskEditRequest++
  taskEditBusy.value = false
  taskEditError.value = ''
  if (editingTaskId) cancelTask()
  editingTaskId = null
})
onBeforeUnmount(() => {
  taskEditRequest++
  if (editingTaskId) cancelTask()
})

function label(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

function decisionMeta(value?: string) {
  return decisionOptions.value.find(option => option.value === value) || {
    title: t("dayplan.ui.pending"),
    value: "PENDIENTE",
    color: "grey",
    icon: "mdi-clock-outline"
  }
}

function isDecision(value: unknown): value is Decision {
  return decisionOptions.value.some(option => option.value === value)
}

function setDecision(target: DecisionTarget, value: unknown) {
  if (!isDecision(value) || isDecisionReadonly.value) return
  target.decision = value
  if (value !== "COMPROMETIDO" && "priority" in target) target.priority = null
}

watch(() => props.item, async (item, _, onCleanup) => {
  let active = true
  onCleanup(() => { active = false })
  saveError.value = ""
  if (!item._id || ![
    ...(item.tasks || []).map(entry => entry.task),
    ...(item.habits || []).map(entry => entry.habit),
    ...(item.suggestions || []).flatMap(entry => [entry.goal, entry.project]),
    item.user
  ].some(value => typeof value === "string")) return
  try {
    const hydrated = await DayPlanProvider.instance.findById(item._id)
    if (!active) return
    if (typeof item.user === "string" && hydrated.user?._id === item.user) item.user = hydrated.user
    for (const collection of ["tasks", "habits", "suggestions"] as const) {
      const fields = collection === "tasks" ? ["task"] : collection === "habits" ? ["habit"] : ["goal", "project"]
      item[collection]?.forEach((entry, index: number) => {
        const references = entry as unknown as Record<string, unknown>
        for (const field of fields) {
          const value = (hydrated[collection]?.[index] as unknown as Record<string, unknown>)?.[field]
          if (typeof references[field] === "string" && isRecord(value) && value._id === references[field]) references[field] = value
        }
      })
    }
  } catch { if (active) saveError.value = t("dayplan.ui.loadError") }
}, {immediate: true})

function formatDate(value?: Date | string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat(locale.value, {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date)
}

function formatTime(value?: Date | string | null) {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(locale.value, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat(locale.value, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getPrimitiveText(value: unknown) {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function getRefText(value: unknown, fields: string[] = ["title", "name", "username"], depth = 0): string {
  if (!value) return "-"
  const primitive = getPrimitiveText(value)
  if (primitive) return primitive
  if (!isRecord(value)) return "-"
  if (depth > 3) return typeof value._id === "string" ? value._id : "-"

  const displayFields = [
    ...fields,
    "displayName",
    "label",
    "text",
    "value",
    "item",
    "raw",
    "data",
    "_doc"
  ]

  for (const field of displayFields) {
    const fieldValue = value[field]
    const fieldPrimitive = getPrimitiveText(fieldValue)
    if (fieldPrimitive) return fieldPrimitive

    if (isRecord(fieldValue)) {
      const nestedText = getRefText(fieldValue, fields, depth + 1)
      if (nestedText !== "-") return nestedText
    }
  }

  return typeof value._id === "string" ? value._id : "-"
}
</script>

<template>
  <v-sheet class="day-plan" :class="compact ? 'day-plan--compact pa-0' : 'pa-4 pa-md-6'" color="background">
    <div v-if="!compact" class="d-flex flex-column flex-md-row align-md-end justify-space-between ga-4 mb-6">
      <div class="min-w-0">
        <h1 class="day-plan__title text-h4 text-md-h3 font-weight-bold mb-2">{{ formatDate(item.date) }}</h1>
        <div class="d-flex flex-wrap align-center ga-2">
          <v-chip size="small" color="secondary" variant="tonal" prepend-icon="mdi-account-outline">
            {{ getRefText(item.user) }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-alert
      v-if="saveError"
      class="mb-4"
      type="error"
      variant="tonal"
      density="comfortable"
    >
      {{ saveError }}
    </v-alert>

    <div class="d-flex flex-wrap justify-end align-center ga-2 mb-3">
      <v-progress-circular v-if="taskEditBusy" indeterminate color="primary" size="18" width="2" :aria-label="t('dayplan.ui.loadingTask')" />
      <PlanningTaskPropertySelector v-model="visibleProperties" />
    </div>
    <v-alert v-if="taskEditError" type="error" variant="tonal" rounded="lg" class="mb-4" closable @click:close="taskEditError = ''">
      {{ taskEditError }}
      <v-btn v-if="editingTaskId" variant="text" :disabled="isDecisionReadonly || taskEditBusy" @click="openTaskEditor(editingTaskId)">{{ t('dayplan.ui.retry') }}</v-btn>
    </v-alert>

    <v-row class="align-start">
      <v-col cols="12" lg="3">
        <div class="d-flex flex-column ga-4">
        <v-card class="day-plan__panel" variant="outlined" rounded="xl">
          <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
            <v-icon icon="mdi-calendar-clock" color="primary"/>
            {{ t('dayplan.ui.calendarEvents') }}
            <v-spacer/>
            <span class="text-caption text-medium-emphasis">{{ item.events?.length || 0 }}</span>
          </v-card-title>

          <v-card-text>
            <div v-if="item.events?.length" class="day-plan__timeline">
              <div
                v-for="(event, index) in item.events"
                :key="event.googleEventId || `${event.title}-${index}`"
                class="day-plan__timeline-item"
              >
                <div
                  :class="[
                    'day-plan__timeline-dot',
                    event.decision === 'COMPROMETIDO' ? 'day-plan__timeline-dot--active' : ''
                  ]"
                />

                <div
                  :class="[
                    'day-plan__timeline-content',
                    event.decision === 'COMPROMETIDO' ? 'day-plan__item--committed' : ''
                  ]"
                >
                  <div class="text-caption text-primary font-weight-bold">
                    {{ formatTime(event.startAt) }}<template v-if="event.endAt"> - {{ formatTime(event.endAt) }}</template>
                  </div>
                  <div class="text-body-2 font-weight-bold mt-1">{{ event.title || "-" }}</div>
                  <p v-if="event.description" class="text-caption text-medium-emphasis mt-1 mb-3">
                    {{ event.description }}
                  </p>

                  <div class="d-flex flex-wrap align-center justify-space-between ga-2">
                    <v-chip :color="decisionMeta(event.decision).color" size="x-small" variant="tonal">
                      {{ decisionMeta(event.decision).title }}
                    </v-chip>
                    <v-btn-toggle
                      :model-value="event.decision"
                      class="day-plan__decision-toggle"
                      density="compact"
                      divided
                      variant="outlined"
                      :disabled="isDecisionReadonly"
                      @update:model-value="value => setDecision(event, value)"
                    >
                      <v-tooltip
                        v-for="option in decisionOptions"
                        :key="option.value"
                        :text="option.title"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            :value="option.value"
                            :color="event.decision === option.value ? option.color : undefined"
                            icon
                          >
                            <v-icon :icon="option.icon" size="18"/>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </v-btn-toggle>
                  </div>
                </div>
              </div>
            </div>

            <v-alert v-else variant="tonal" color="grey" density="compact">
              {{ label("dayplan.ui.noEvents", "Sin eventos.") }}
            </v-alert>
          </v-card-text>
        </v-card>

          <v-card class="day-plan__panel" variant="outlined" rounded="xl">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-repeat" color="primary"/>
              {{ t('dayplan.ui.dailyHabits') }}
              <v-spacer/>
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.habits?.filter(habit => habit.decision === 'COMPROMETIDO').length || 0 }}/{{ item.habits?.length || 0 }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-row v-if="item.habits?.length" dense>
                <v-col
                  v-for="(habitItem, index) in item.habits"
                  :key="habitItem.habit?._id || index"
                  cols="12"
                >
                  <v-card
                    class="day-plan__habit pa-3"
                    :class="{'day-plan__item--committed': habitItem.decision === 'COMPROMETIDO'}"
                    variant="outlined"
                    rounded="lg"
                  >
                    <div class="d-flex flex-wrap align-center ga-3">
                      <v-icon icon="mdi-autorenew" color="secondary"/>
                      <div class="flex-grow-1 min-w-0">
                        <div class="text-body-2 font-weight-medium">
                          {{ getRefText(habitItem.habit, ["name", "title"]) }}
                        </div>
                        <div v-if="habitItem.habit?.frequency?.type" class="text-caption text-medium-emphasis">
                          {{ habitItem.habit.frequency.type }}
                        </div>
                      </div>
                      <v-btn-toggle
                        :model-value="habitItem.decision"
                        class="day-plan__decision-toggle"
                        density="compact"
                        divided
                        variant="outlined"
                        :disabled="isDecisionReadonly"
                        @update:model-value="value => setDecision(habitItem, value)"
                      >
                        <v-tooltip
                          v-for="option in decisionOptions"
                          :key="option.value"
                          :text="option.title"
                          location="top"
                        >
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              :value="option.value"
                              :color="habitItem.decision === option.value ? option.color : undefined"
                              icon
                            >
                              <v-icon :icon="option.icon" size="18"/>
                            </v-btn>
                          </template>
                        </v-tooltip>
                      </v-btn-toggle>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else variant="tonal" color="grey" density="compact">
                {{ label("dayplan.ui.noHabits", "Sin habitos.") }}
              </v-alert>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" lg="6">
        <TaskPlanningBoard section="planned" :tasks="item.tasks || []" :readonly="isDecisionReadonly" :visible-properties="visibleProperties" :can-edit-task="canEditTask" :task-edit-busy="taskEditBusy" @edit-task="openTaskEditor" @schedule="emit('schedule', $event)" />
      </v-col>

      <v-col cols="12" lg="3">
        <div class="d-flex flex-column ga-4">
          <TaskPlanningBoard section="proposals" :tasks="item.tasks || []" :readonly="isDecisionReadonly" :previous-task-ids="previousTaskIds" :visible-properties="visibleProperties" :can-edit-task="canEditTask" :task-edit-busy="taskEditBusy" @edit-task="openTaskEditor">
            <template #proposal-actions><slot name="proposal-actions" /></template>
          </TaskPlanningBoard>
          <v-card class="day-plan__panel day-plan__suggestions" variant="outlined" rounded="xl">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-lightbulb-outline" color="warning"/>
              {{ label("dayplan.field.suggestions", "Sugerencias") }}
            </v-card-title>

            <v-card-text>
              <div v-if="item.suggestions?.length" class="d-flex flex-column ga-3">
                <div
                  v-for="(suggestion, index) in item.suggestions"
                  :key="`${suggestion.title}-${index}`"
                  class="day-plan__suggestion-item"
                >
                  <div class="text-body-2 font-weight-medium">{{ suggestion.title || "-" }}</div>
                  <div v-if="suggestion.goal || suggestion.project" class="text-caption opacity-80 mt-1">
                    <span v-if="suggestion.goal">{{ getRefText(suggestion.goal, ["name"]) }}</span>
                    <span v-if="suggestion.project"> · {{ getRefText(suggestion.project, ["name"]) }}</span>
                  </div>

                  <div class="d-flex flex-wrap align-center justify-space-between ga-2 mt-3">
                    <v-chip :color="decisionMeta(suggestion.decision).color" size="x-small" variant="flat">
                      {{ decisionMeta(suggestion.decision).title }}
                    </v-chip>
                    <v-btn-toggle
                      :model-value="suggestion.decision"
                      class="day-plan__decision-toggle"
                      density="compact"
                      divided
                      variant="outlined"
                      :disabled="isDecisionReadonly"
                      @update:model-value="value => setDecision(suggestion, value)"
                    >
                      <v-tooltip
                        v-for="option in decisionOptions"
                        :key="option.value"
                        :text="option.title"
                        location="top"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            :value="option.value"
                            :color="suggestion.decision === option.value ? option.color : undefined"
                            icon
                          >
                            <v-icon :icon="option.icon" size="18"/>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </v-btn-toggle>
                  </div>
                </div>
              </div>

              <v-alert v-else variant="tonal" color="grey" density="compact">
                {{ label("dayplan.ui.noSuggestions", "Sin sugerencias.") }}
              </v-alert>
            </v-card-text>
          </v-card>

          <div class="px-1">
            <div class="d-flex align-center ga-1 text-caption text-medium-emphasis text-uppercase font-weight-bold">
              <v-icon icon="mdi-update" size="14"/>
              {{ label("dayplan.ui.lastUpdate", "Ultima actualizacion") }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">{{ formatDateTime(item.updatedAt || item.createdAt) }}</div>
          </div>
        </div>
      </v-col>
    </v-row>

    <CrudDialog v-model="taskDialog" :entity="taskCrud" :operation="taskOperation">
      <TaskForm @updated="onTaskUpdated" @canceled="cancelTask" />
    </CrudDialog>
  </v-sheet>
</template>

<style scoped>
.day-plan {
  --plan-border: rgba(var(--v-theme-on-surface), 0.12);
  min-height: 100%;
}

.min-w-0 { min-width: 0; }

.day-plan :deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
}

.day-plan__panel > .v-card-title {
  min-height: 68px;
  padding: 16px;
  white-space: normal;
  overflow-wrap: anywhere;
  border-bottom: 1px solid var(--plan-border);
}

.day-plan__panel > .v-card-title > .v-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  font-size: 20px;
}

.day-plan__panel > .v-card-text { padding: 16px; }

.day-plan__habit {
  border-color: var(--plan-border);
  background: rgba(var(--v-theme-on-surface), 0.025);
  overflow-wrap: anywhere;
}

.day-plan__item--committed {
  background: rgba(var(--v-theme-primary), 0.06);
  border-color: rgba(var(--v-theme-primary), 0.25);
}

.day-plan__title {
  line-height: 1.12;
}

.day-plan__panel {
  background: rgb(var(--v-theme-surface));
  border-color: var(--plan-border);
}

.day-plan__timeline {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
}

.day-plan__timeline::before {
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  bottom: 0;
  content: "";
  left: 5px;
  position: absolute;
  top: 0;
  width: 2px;
}

.day-plan__timeline-item {
  min-width: 0;
  padding-left: 20px;
  position: relative;
}

.day-plan__timeline-dot {
  background: rgb(var(--v-theme-surface));
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 999px;
  height: 12px;
  left: 1px;
  position: absolute;
  top: 14px;
  width: 12px;
  z-index: 1;
}

.day-plan__timeline-dot--active {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}

.day-plan__timeline-content {
  border: 1px solid var(--plan-border);
  border-radius: 12px;
  min-width: 0;
  padding: 12px;
  overflow-wrap: anywhere;
}

.day-plan__suggestions > .v-card-title {
  background: rgba(var(--v-theme-warning), 0.045);
}

.day-plan__suggestions > .v-card-title > .v-icon {
  background: rgba(var(--v-theme-warning), 0.1);
}

.day-plan__suggestion-item {
  border-bottom: 1px solid var(--plan-border);
  padding-bottom: 16px;
  overflow-wrap: anywhere;
}

.day-plan__suggestion-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.day-plan__decision-toggle {
  flex: 0 0 auto;
  height: 32px;
}

.day-plan__decision-toggle :deep(.v-btn) {
  height: 32px;
  min-width: 34px;
  width: 34px;
}


@media (max-width: 700px) {

  .day-plan__decision-toggle :deep(.v-btn) {
    min-width: 32px;
    width: 32px;
  }
}
</style>
