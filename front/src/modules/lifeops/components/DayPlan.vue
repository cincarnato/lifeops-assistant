<script setup lang="ts">
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import type {IDayPlan, IDayPlanBase} from "../interfaces/IDayPlan";
import DayPlanProvider from "../providers/DayPlanProvider";

type DayPlanForm = IDayPlanBase & Partial<IDayPlan>
type Decision = "PENDIENTE" | "COMPROMETIDO" | "DESEABLE" | "DESCARTADO"
type DecisionTarget = { decision?: string }
type ContextItem = { key: string; label: string; type: string; progress?: number }
type DecisionCollection = "events" | "tasks" | "habits" | "suggestions"

const props = defineProps<{
  item: DayPlanForm
  operation?: string
}>()

const {t, te} = useI18n()
const dayPlanProvider = DayPlanProvider.instance
const savingDecisionKeys = ref<Set<string>>(new Set())
const saveError = ref("")

const decisionOptions: Array<{ title: string; value: Decision; color: string; icon: string }> = [
  {title: "Comprometido", value: "COMPROMETIDO", color: "success", icon: "mdi-check-circle-outline"},
  {title: "Deseable", value: "DESEABLE", color: "info", icon: "mdi-star-outline"},
  {title: "Descartado", value: "DESCARTADO", color: "error", icon: "mdi-close-circle-outline"}
]

const isDecisionReadonly = computed(() => ["view", "delete"].includes(props.operation || ""))
const isEditOperation = computed(() => props.operation === "edit")

const totalItems = computed(() =>
  (props.item.events?.length || 0) +
  (props.item.tasks?.length || 0) +
  (props.item.habits?.length || 0) +
  (props.item.suggestions?.length || 0)
)

const committedItems = computed(() => {
  const decisions = [
    ...(props.item.events || []),
    ...(props.item.tasks || []),
    ...(props.item.habits || []),
    ...(props.item.suggestions || [])
  ]

  return decisions.filter(item => item.decision === "COMPROMETIDO").length
})

const performance = computed(() => {
  if (!totalItems.value) return 0
  return Math.round((committedItems.value / totalItems.value) * 100)
})

const contextItems = computed(() => {
  const items = new Map<string, ContextItem>()

  props.item.suggestions?.forEach(suggestion => {
    addContextItem(items, suggestion.goal, "Meta")
    addContextItem(items, suggestion.project, "Proyecto")
  })

  props.item.tasks?.forEach(taskItem => {
    addContextItem(items, taskItem.task?.project, "Proyecto")
    taskItem.task?.goals?.forEach((goal: unknown) => addContextItem(items, goal, "Meta"))
  })

  return Array.from(items.values()).slice(0, 5)
})

function label(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

function decisionMeta(value?: string) {
  return decisionOptions.find(option => option.value === value) || {
    title: "Pendiente",
    value: "PENDIENTE",
    color: "grey",
    icon: "mdi-clock-outline"
  }
}

function isDecision(value: unknown): value is Decision {
  return decisionOptions.some(option => option.value === value)
}

async function setDecision(target: DecisionTarget, value: unknown, collection?: DecisionCollection, index?: number) {
  if (!isDecision(value) || isDecisionReadonly.value) return
  if (target.decision === value) return

  const previousDecision = target.decision
  target.decision = value

  if (!isEditOperation.value || !collection || typeof index !== "number") return

  const id = props.item._id
  if (!id) return

  const savingKey = decisionSavingKey(collection, index)
  setDecisionSaving(savingKey, true)
  saveError.value = ""

  try {
    const updatedItem = await dayPlanProvider.updatePartial(id, {
      [collection]: serializeDecisionCollection(collection)
    } as Partial<IDayPlanBase>)
    Object.assign(props.item, updatedItem)
  } catch (e: any) {
    target.decision = previousDecision
    saveError.value = e?.message || "No se pudo actualizar la decision."
  } finally {
    setDecisionSaving(savingKey, false)
  }
}

function decisionSavingKey(collection: DecisionCollection, index: number) {
  return `${collection}-${index}`
}

function isDecisionSaving(collection: DecisionCollection, index: number) {
  return savingDecisionKeys.value.has(decisionSavingKey(collection, index))
}

function setDecisionSaving(key: string, value: boolean) {
  const next = new Set(savingDecisionKeys.value)
  if (value) {
    next.add(key)
  } else {
    next.delete(key)
  }
  savingDecisionKeys.value = next
}

function serializeDecisionCollection(collection: DecisionCollection) {
  if (collection === "events") {
    return props.item.events?.map(event => ({
      googleEventId: event.googleEventId,
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      decision: event.decision
    }))
  }

  if (collection === "tasks") {
    return props.item.tasks?.map(taskItem => ({
      task: refId(taskItem.task),
      decision: taskItem.decision
    }))
  }

  if (collection === "habits") {
    return props.item.habits?.map(habitItem => ({
      habit: refId(habitItem.habit),
      decision: habitItem.decision
    }))
  }

  return props.item.suggestions?.map(suggestion => ({
    title: suggestion.title,
    decision: suggestion.decision,
    goal: refId(suggestion.goal),
    project: refId(suggestion.project)
  }))
}

function refId(value: unknown) {
  if (!value) return value
  if (typeof value === "string") return value
  if (isRecord(value)) return value._id
  return value
}

function formatDate(value?: Date | string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-AR", {
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

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "-"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("es-AR", {
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

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined
}

function getPriorityColor(priority?: string) {
  const value = priority?.toLowerCase()
  if (value === "alta" || value === "high") return "error"
  if (value === "media" || value === "medium") return "warning"
  if (value === "baja" || value === "low") return "grey"
  return "secondary"
}

function addContextItem(items: Map<string, ContextItem>, value: unknown, type: string) {
  if (!isRecord(value)) return

  const label = getRefText(value, ["name", "title"])
  if (label === "-") return

  const key = `${type}-${String(value._id || label)}`
  if (items.has(key)) return

  items.set(key, {
    key,
    label,
    type,
    progress: getNumber(value.progressPercent)
  })
}
</script>

<template>
  <v-sheet class="day-plan pa-4 pa-md-6" color="background">
    <div class="d-flex flex-column flex-md-row align-md-end justify-space-between ga-4 mb-6">
      <div class="min-w-0">
        <h1 class="day-plan__title text-h4 text-md-h3 font-weight-bold mb-2">{{ formatDate(item.date) }}</h1>
        <div class="d-flex flex-wrap align-center ga-2">
          <v-chip size="small" color="primary" variant="flat" prepend-icon="mdi-progress-check">
            {{ item.status || "-" }}
          </v-chip>
          <v-chip size="small" color="secondary" variant="tonal" prepend-icon="mdi-account-outline">
            {{ getRefText(item.user) }}
          </v-chip>
          <span class="text-body-2 text-medium-emphasis">
            {{ label("dayplan.ui.performance", "Rendimiento actual") }} {{ performance }}%
          </span>
        </div>
      </div>

      <div class="d-flex ga-3">
        <v-card variant="outlined" rounded="lg" class="px-4 py-2">
          <div class="text-caption text-medium-emphasis">{{ label("dayplan.ui.totalItems", "Items") }}</div>
          <div class="text-h6 font-weight-bold">{{ totalItems }}</div>
        </v-card>
        <v-card variant="outlined" rounded="lg" class="px-4 py-2">
          <div class="text-caption text-medium-emphasis">{{ label("dayplan.ui.committedItems", "Comprometidos") }}</div>
          <div class="text-h6 font-weight-bold">{{ committedItems }}</div>
        </v-card>
      </div>
    </div>

    <v-alert
      v-if="!totalItems"
      class="mb-4"
      type="info"
      variant="tonal"
      density="comfortable"
    >
      {{ label("dayplan.ui.empty", "No hay items planificados para este dia.") }}
    </v-alert>

    <v-alert
      v-if="saveError"
      class="mb-4"
      type="error"
      variant="tonal"
      density="comfortable"
    >
      {{ saveError }}
    </v-alert>

    <v-row class="align-start" dense>
      <v-col cols="12" lg="3">
        <v-card class="day-plan__panel" variant="outlined" rounded="lg">
          <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
            <v-icon icon="mdi-calendar-clock" color="primary"/>
            {{ label("dayplan.field.events", "Cronograma") }}
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
                    event.decision === 'COMPROMETIDO' ? 'bg-primary-lighten-5 border-s-primary' : ''
                  ]"
                >
                  <div class="text-caption text-primary font-weight-bold">
                    {{ formatTime(event.startAt) }}<template v-if="event.endAt"> - {{ formatTime(event.endAt) }}</template>
                  </div>
                  <div class="text-body-2 font-weight-bold mt-1">{{ event.title || "-" }}</div>
                  <p v-if="event.description" class="text-caption text-medium-emphasis mt-1 mb-3">
                    {{ event.description }}
                  </p>

                  <div class="d-flex align-center justify-space-between ga-2">
                    <v-chip :color="decisionMeta(event.decision).color" size="x-small" variant="tonal">
                      {{ decisionMeta(event.decision).title }}
                    </v-chip>
                    <v-btn-toggle
                      :model-value="event.decision"
                      class="day-plan__decision-toggle"
                      density="compact"
                      divided
                      variant="outlined"
                      :disabled="isDecisionReadonly || isDecisionSaving('events', index)"
                      @update:model-value="value => setDecision(event, value, 'events', index)"
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
                            :loading="isDecisionSaving('events', index) && event.decision === option.value"
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
      </v-col>

      <v-col cols="12" lg="6">
        <div class="d-flex flex-column ga-4">
          <v-card class="day-plan__panel" variant="outlined" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-checkbox-marked-circle-outline" color="primary"/>
              {{ label("dayplan.field.tasks", "Tareas pendientes") }}
              <v-spacer/>
              <span class="text-caption text-primary font-weight-bold">{{ item.tasks?.length || 0 }}</span>
            </v-card-title>

            <v-card-text>
              <v-list v-if="item.tasks?.length" class="py-0" density="compact">
                <v-list-item
                  v-for="(taskItem, index) in item.tasks"
                  :key="taskItem.task?._id || index"
                  class="day-plan__list-item px-0 py-3"
                >
                  <template #prepend>
                    <v-icon :color="decisionMeta(taskItem.decision).color" :icon="decisionMeta(taskItem.decision).icon"/>
                  </template>

                  <v-list-item-title class="font-weight-medium text-wrap">
                    {{ getRefText(taskItem.task, ["title", "name"]) }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="text-wrap">
                    <span v-if="taskItem.task?.project">{{ getRefText(taskItem.task.project, ["name"]) }}</span>
                    <span v-if="taskItem.task?.valueScore" class="ml-2">
                      <v-icon icon="mdi-lightning-bolt-outline" size="14"/>
                      {{ taskItem.task.valueScore }}/10 valor
                    </span>
                    <span v-if="taskItem.task?.effortScore" class="ml-2">
                      <v-icon icon="mdi-weight-lifter" size="14"/>
                      {{ taskItem.task.effortScore }}/10 esfuerzo
                    </span>
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="d-flex align-center ga-2">
                      <v-chip
                        v-if="taskItem.task?.priority"
                        :color="getPriorityColor(taskItem.task.priority)"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ taskItem.task.priority }}
                      </v-chip>
                      <v-btn-toggle
                        :model-value="taskItem.decision"
                        class="day-plan__decision-toggle"
                        density="compact"
                        divided
                        variant="outlined"
                        :disabled="isDecisionReadonly || isDecisionSaving('tasks', index)"
                        @update:model-value="value => setDecision(taskItem, value, 'tasks', index)"
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
                              :color="taskItem.decision === option.value ? option.color : undefined"
                              :loading="isDecisionSaving('tasks', index) && taskItem.decision === option.value"
                              icon
                            >
                              <v-icon :icon="option.icon" size="18"/>
                            </v-btn>
                          </template>
                        </v-tooltip>
                      </v-btn-toggle>
                    </div>
                  </template>
                </v-list-item>
              </v-list>

              <v-alert v-else variant="tonal" color="grey" density="compact">
                {{ label("dayplan.ui.noTasks", "Sin tareas.") }}
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card class="day-plan__panel" variant="outlined" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-repeat" color="primary"/>
              {{ label("dayplan.field.habits", "Habitos diarios") }}
              <v-spacer/>
              <div class="d-flex ga-1">
                <v-icon
                  v-for="index in Math.max(item.habits?.length || 0, 1)"
                  :key="index"
                  icon="mdi-circle"
                  size="10"
                  :color="index <= (item.habits?.filter(habit => habit.decision === 'COMPROMETIDO').length || 0) ? 'primary' : 'grey-lighten-1'"
                />
              </div>
            </v-card-title>

            <v-card-text>
              <v-row v-if="item.habits?.length" dense>
                <v-col
                  v-for="(habitItem, index) in item.habits"
                  :key="habitItem.habit?._id || index"
                  cols="12"
                  md="6"
                >
                  <v-card
                    class="pa-3"
                    :color="habitItem.decision === 'COMPROMETIDO' ? 'primary-lighten-5' : undefined"
                    variant="outlined"
                    rounded="lg"
                  >
                    <div class="d-flex align-center ga-3">
                      <v-icon icon="mdi-autorenew" color="secondary"/>
                      <div class="flex-grow-1 min-w-0">
                        <div class="text-body-2 font-weight-medium text-truncate">
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
                        :disabled="isDecisionReadonly || isDecisionSaving('habits', index)"
                        @update:model-value="value => setDecision(habitItem, value, 'habits', index)"
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
                              :loading="isDecisionSaving('habits', index) && habitItem.decision === option.value"
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

      <v-col cols="12" lg="3">
        <div class="d-flex flex-column ga-4">
          <v-card class="day-plan__suggestions" color="primary" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-lightbulb-outline"/>
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

                  <div class="d-flex align-center justify-space-between ga-2 mt-3">
                    <v-chip :color="decisionMeta(suggestion.decision).color" size="x-small" variant="flat">
                      {{ decisionMeta(suggestion.decision).title }}
                    </v-chip>
                    <v-btn-toggle
                      :model-value="suggestion.decision"
                      class="day-plan__decision-toggle day-plan__decision-toggle--on-primary"
                      density="compact"
                      divided
                      variant="outlined"
                      :disabled="isDecisionReadonly || isDecisionSaving('suggestions', index)"
                      @update:model-value="value => setDecision(suggestion, value, 'suggestions', index)"
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
                            :loading="isDecisionSaving('suggestions', index) && suggestion.decision === option.value"
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

              <v-alert v-else variant="tonal" color="white" density="compact">
                {{ label("dayplan.ui.noSuggestions", "Sin sugerencias.") }}
              </v-alert>
            </v-card-text>
          </v-card>

          <v-card class="day-plan__panel" variant="outlined" rounded="lg">
            <v-card-title class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
              <v-icon icon="mdi-target" color="primary"/>
              {{ label("dayplan.ui.goalContext", "Contexto de metas") }}
            </v-card-title>

            <v-card-text>
              <div v-if="contextItems.length" class="d-flex flex-column ga-4">
                <div v-for="context in contextItems" :key="context.key">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <div class="text-caption font-weight-bold text-truncate">
                      {{ context.type }}: {{ context.label }}
                    </div>
                    <span v-if="typeof context.progress === 'number'" class="text-caption text-medium-emphasis">
                      {{ context.progress }}%
                    </span>
                  </div>
                  <v-progress-linear
                    v-if="typeof context.progress === 'number'"
                    :model-value="context.progress"
                    color="primary"
                    bg-color="surface-variant"
                    height="6"
                    rounded
                  />
                </div>
              </div>

              <v-alert v-else variant="tonal" color="grey" density="compact">
                {{ label("dayplan.ui.noContext", "Sin contexto asociado.") }}
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
  </v-sheet>
</template>

<style scoped>
.day-plan {
  min-height: 100%;
}

.day-plan__title {
  line-height: 1.12;
}

.day-plan__panel {
  background: rgb(var(--v-theme-surface));
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
  left: 11px;
  position: absolute;
  top: 0;
  width: 2px;
}

.day-plan__timeline-item {
  min-width: 0;
  padding-left: 36px;
  position: relative;
}

.day-plan__timeline-dot {
  background: rgb(var(--v-theme-surface));
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 999px;
  height: 22px;
  left: 1px;
  position: absolute;
  top: 2px;
  width: 22px;
  z-index: 1;
}

.day-plan__timeline-dot--active {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}

.day-plan__timeline-content {
  border-left: 4px solid transparent;
  border-radius: 8px;
  min-width: 0;
  padding: 8px 10px;
}

.day-plan__list-item {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.day-plan__list-item:last-child {
  border-bottom: 0;
}

.day-plan__suggestions {
  box-shadow: 0 10px 28px rgba(var(--v-theme-primary), .18);
}

.day-plan__suggestion-item {
  border-bottom: 1px solid rgba(255, 255, 255, .24);
  padding-bottom: 12px;
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

.day-plan__decision-toggle--on-primary :deep(.v-btn) {
  color: rgb(var(--v-theme-on-primary));
}

@media (max-width: 700px) {
  .day-plan {
    padding: 16px !important;
  }

  .day-plan__decision-toggle :deep(.v-btn) {
    min-width: 32px;
    width: 32px;
  }
}
</style>
