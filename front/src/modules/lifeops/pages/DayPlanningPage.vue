<script setup lang="ts">
import {computed, ref, watch, onBeforeUnmount} from 'vue'
import {onBeforeRouteLeave} from 'vue-router'
import {useI18n} from 'vue-i18n'
import DayPlan from '../components/DayPlan.vue'
import PlanningTaskPropertySelector from '../components/PlanningTaskPropertySelector.vue'
import {usePlanningTaskProperties} from '../composables/usePlanningTaskProperties'
import DayPlanProvider from '../providers/DayPlanProvider'
import type {IDayPlan} from '../interfaces/IDayPlan'

import {serialQueue, persistLatest} from '../components/planningPersistence'

const {t, locale} = useI18n()
const {visibleProperties} = usePlanningTaskProperties()
const provider = DayPlanProvider.instance
function localDate(offset = 0, base = new Date()) {
  const date = new Date(base)
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const date = ref(localDate())
const plan = ref<IDayPlan | null>(null)
const snapshot = ref('null')
const busy = ref(false)
const error = ref('')
const dirty = computed(() => JSON.stringify(plan.value) !== snapshot.value)
const scheduleOpen = ref(false)
const reservationDate = ref(localDate())
const taskId = ref<string | null>(null)
const startAt = ref<string | null>(null)
const slots = ref<Array<{startAt: string; endAt: string}>>([])
const slotsBusy = ref(false)
const slotsError = ref('')
let slotRequest = 0
const taskOptions = computed(() => (plan.value?.tasks || []).map(entry => ({title: entry.task?.title || entry.task, value: entry.task?._id || entry.task})))
const slotOptions = computed(() => slots.value.map(slot => ({value: slot.startAt, title: `${new Date(slot.startAt).toLocaleTimeString(locale.value, {hour: '2-digit', minute: '2-digit'})} – ${new Date(slot.endAt).toLocaleTimeString(locale.value, {hour: '2-digit', minute: '2-digit'})}`})))
function accept(value: IDayPlan | null) {
  plan.value = value
  snapshot.value = JSON.stringify(value)
}
const enqueue = serialQueue()
let retryAction: () => Promise<unknown> = async () => undefined
let pending = 0
async function flush() {
  if (!plan.value) return
  await persistLatest(() => plan.value!, () => snapshot.value,
    value => provider.update(value._id, value),
    (sent, response) => {
      if (response) accept(response)
      else snapshot.value = sent
    })
}
function run(action: () => Promise<unknown>) {
  pending++
  busy.value = true
  return enqueue(async () => {
    try {
      await flush()
      await action()
      error.value = ''
      return true
    } catch (e) {
      retryAction = action
      error.value = e instanceof Error ? e.message : t('dayplan.ui.saveError')
      return false
    } finally {
      pending--
      busy.value = pending > 0
    }
  })
}
function retry() { return run(retryAction) }
watch(plan, () => {
  if (dirty.value && !busy.value && !error.value) void run(async () => undefined)
}, {deep: true})
onBeforeRouteLeave(() => run(async () => undefined))
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value || busy.value) { event.preventDefault(); event.returnValue = '' }
}
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => { window.removeEventListener('beforeunload', beforeUnload); slotRequest++ })
async function changeDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || busy.value) return
  await run(async () => {
    const result = await provider.planning(value)
    date.value = value
    accept(result)
  })
}
function move(offset: number) { void changeDate(localDate(offset, new Date(`${date.value}T12:00:00`))) }
function load() { return changeDate(date.value) }
function generate() {
  if (busy.value) return
  return run(async () => { accept(await provider.generate(date.value)) })
}
function proposals(mode: 'more' | 'other') {
  if (busy.value || !plan.value) return
  return run(async () => { accept(await provider.proposals(plan.value!._id, mode)) })
}
function openSchedule(selectedTaskId?: string) {
  return run(async () => { taskId.value = selectedTaskId || null; reservationDate.value = date.value; scheduleOpen.value = true })
}
async function loadSlots() {
  const request = ++slotRequest
  startAt.value = null
  slots.value = []
  slotsBusy.value = false
  slotsError.value = ''
  if (!scheduleOpen.value || !/^\d{4}-\d{2}-\d{2}$/.test(reservationDate.value)) return
  slotsBusy.value = true
  try {
    const result = await provider.availableSlots(reservationDate.value)
    if (request === slotRequest) slots.value = result.slots
  } catch (e) { if (request === slotRequest) slotsError.value = e instanceof Error ? e.message : t('dayplan.ui.loadError') }
  finally { if (request === slotRequest) slotsBusy.value = false }
}
watch([reservationDate, scheduleOpen], loadSlots)
function schedule() {
  if (!plan.value || !taskId.value || !startAt.value || busy.value) return
  const id = plan.value._id
  const task = taskId.value
  const start = startAt.value
  return run(async () => {
    accept(await provider.scheduleTask(id, task, start))
    scheduleOpen.value = false
    void loadContext()
  })
}
const previousTaskIds = ref<string[]>([])
const capacity = ref<number | null>(null)
const capacityBusy = ref(false)
const capacityError = ref('')
const previousError = ref('')
let contextRequest = 0
async function loadContext() {
  const request = ++contextRequest
  const selectedDate = date.value
  capacity.value = null
  capacityBusy.value = true
  capacityError.value = ''
  previousError.value = ''
  previousTaskIds.value = []
  await Promise.all([
    provider.availableSlots(selectedDate).then(result => {
      if (request === contextRequest) capacity.value = result.slots.length
    }).catch(() => { if (request === contextRequest) capacityError.value = t('dayplan.ui.capacityError') })
      .finally(() => { if (request === contextRequest) capacityBusy.value = false }),
    provider.planning(localDate(-1, new Date(`${selectedDate}T12:00:00`))).then(previous => {
      if (request !== contextRequest) return
      previousTaskIds.value = (previous?.tasks || [])
        .filter(entry => (entry.priority || entry.decision === 'COMPROMETIDO' || entry.decision === 'DESEABLE') && entry.decision !== 'DESCARTADO' && typeof entry.task === 'object' && entry.task && !entry.task.completedAt && !entry.task.status?.completesTask)
        .map(entry => entry.task._id)
    }).catch(() => { if (request === contextRequest) previousError.value = t('dayplan.ui.previousError') })
  ])
}
watch(date, loadContext, {immediate: true})
onBeforeUnmount(() => { contextRequest++ })
void load()
</script>

<template>
  <v-container fluid class="planning-page pa-3 pa-md-5">
    <v-card class="planning-header mb-4" variant="flat" rounded="xl">
      <v-card-text class="pa-3">
        <v-defaults-provider :defaults="{VBtn: {size: 'small', variant: 'text', rounded: 'lg'}}">
          <v-row align="center" dense role="group" :aria-label="t('dayplan.ui.planning')">
            <v-col cols="auto">
              <div class="d-flex align-center ga-2">
                <v-avatar color="primary" variant="tonal" rounded="lg" size="32">
                  <v-icon icon="mdi-calendar-check-outline" size="20" />
                </v-avatar>
                <h1 class="text-subtitle-1 font-weight-bold">{{ t('dayplan.ui.planning') }}</h1>
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="planning-toolbar d-flex flex-wrap align-center ga-2">
                <div class="planning-date-nav d-flex align-center ga-1 pa-1 rounded-lg">
                  <v-btn icon="mdi-chevron-left" :aria-label="t('dayplan.ui.previous')" :disabled="busy" @click="move(-1)" />
                  <v-text-field class="planning-date" :model-value="date" type="date" :label="t('dayplan.field.date')" density="compact" variant="outlined" hide-details :disabled="busy" @update:model-value="changeDate" />
                  <v-btn icon="mdi-chevron-right" :aria-label="t('dayplan.ui.next')" :disabled="busy" @click="move(1)" />
                </div>
                <div class="d-flex align-center ga-1">
                  <v-btn color="primary" :variant="date === localDate() ? 'tonal' : 'text'" :aria-pressed="date === localDate()" :disabled="busy" @click="changeDate(localDate())">{{ t('dayplan.ui.today') }}</v-btn>
                  <v-btn color="primary" :variant="date === localDate(1) ? 'tonal' : 'text'" :aria-pressed="date === localDate(1)" :disabled="busy" @click="changeDate(localDate(1))">{{ t('dayplan.ui.tomorrow') }}</v-btn>
                  <v-btn :disabled="busy" icon="mdi-refresh" :aria-label="t('dayplan.ui.reload')" :title="t('dayplan.ui.reload')" @click="changeDate(date); loadContext()" />
                </div>
              </div>
            </v-col>
            <v-col cols="auto" class="ml-sm-auto">
              <v-tooltip :text="capacityError || t('dayplan.ui.capacityHint')">
                <template #activator="{props}">
                  <v-btn v-bind="props" class="planning-capacity" :color="capacityError ? 'warning' : 'primary'" variant="tonal" :prepend-icon="capacityError ? 'mdi-clock-alert-outline' : 'mdi-clock-outline'" :loading="capacityBusy" :aria-label="capacityBusy ? t('dayplan.ui.capacityLoading') : capacityError || t('dayplan.ui.capacityHint')" @click="loadContext">
                    {{ capacityError ? t('dayplan.ui.retry') : capacity !== null ? t('dayplan.ui.capacity', {count: capacity, hours: capacity}) : t('dayplan.ui.capacityLoading') }}
                  </v-btn>
                </template>
              </v-tooltip>
            </v-col>
            <v-col v-if="plan" cols="auto">
              <PlanningTaskPropertySelector v-model="visibleProperties" icon-only />
            </v-col>
            <v-col v-if="plan" cols="auto">
              <div class="planning-save-state d-flex align-center ga-1 text-caption" :class="error ? 'text-error' : busy || dirty ? 'text-warning' : 'text-success'" role="status" aria-live="polite">
                <v-icon :icon="error ? 'mdi-alert-circle-outline' : busy || dirty ? 'mdi-cloud-sync-outline' : 'mdi-cloud-check-outline'" size="18" />
                <span>{{ t(error ? 'dayplan.ui.saveError' : busy ? 'dayplan.ui.saving' : dirty ? 'dayplan.ui.unsaved' : 'dayplan.ui.saved') }}</span>
              </div>
            </v-col>
          </v-row>
        </v-defaults-provider>
      </v-card-text>
      <v-progress-linear :active="busy" indeterminate color="primary" height="3" />
    </v-card>
    <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ error }}
      <v-btn variant="text" rounded="lg" :disabled="busy" @click="retry">{{ t('dayplan.ui.retry') }}</v-btn>
    </v-alert>
    <v-alert v-if="previousError" type="warning" variant="tonal" rounded="lg" density="compact" class="mb-4 text-body-2">{{ previousError }}</v-alert>
    <template v-if="plan">
      <DayPlan compact :visible-task-properties="visibleProperties" :item="plan" :operation="busy ? 'view' : 'edit'" :previous-task-ids="previousTaskIds" @schedule="openSchedule">
        <template #proposal-actions>
          <div class="planning-proposal-actions d-flex ga-2 w-100 mt-3">
            <v-btn class="flex-1-1-0" size="small" rounded="lg" color="primary" prepend-icon="mdi-plus" :disabled="busy" variant="tonal" @click="proposals('more')">{{ t('dayplan.ui.moreProposals') }}</v-btn>
            <v-btn class="flex-1-1-0" size="small" rounded="lg" color="primary" prepend-icon="mdi-swap-horizontal" :disabled="busy" variant="text" @click="proposals('other')">{{ t('dayplan.ui.otherProposals') }}</v-btn>
          </div>
        </template>
      </DayPlan>
    </template>
    <v-card v-else-if="!busy && !error" class="planning-empty pa-6 pa-sm-10 text-center" variant="flat" rounded="xl">
      <v-avatar color="primary" variant="tonal" rounded="xl" size="72" class="mb-5">
        <v-icon icon="mdi-calendar-plus" size="36" />
      </v-avatar>
      <h2 class="text-h6 font-weight-bold mb-2">{{ t('dayplan.ui.noPlan') }}</h2>
      <p class="planning-empty-hint text-body-2 text-medium-emphasis mx-auto mb-6">{{ t('dayplan.ui.prioritiesHint') }}</p>
      <v-btn class="planning-generate" color="primary" variant="flat" rounded="lg" prepend-icon="mdi-plus" @click="generate">{{ t('dayplan.ui.generate') }}</v-btn>
    </v-card>
    <v-dialog v-model="scheduleOpen" max-width="600" scrollable :persistent="busy" aria-labelledby="planning-schedule-title">
      <v-card class="planning-dialog" rounded="xl">
        <v-card-title class="planning-dialog-header d-flex align-center ga-3 pa-4 pa-sm-5">
          <v-avatar color="primary" variant="tonal" rounded="lg" size="44">
            <v-icon icon="mdi-calendar-clock" />
          </v-avatar>
          <h2 id="planning-schedule-title" class="text-h6 font-weight-bold">{{ t('dayplan.ui.schedule') }}</h2>
        </v-card-title>
        <v-card-text class="pa-4 pa-sm-5">
          <v-alert v-if="error" type="error" variant="tonal" rounded="lg" class="mb-4">
            {{ error }}
            <v-btn variant="text" :disabled="busy" @click="retry">{{ t('dayplan.ui.retry') }}</v-btn>
          </v-alert>
          <v-alert v-if="slotsError" type="error" variant="tonal" rounded="lg" class="mb-4">
            {{ slotsError }}
            <v-btn variant="text" :disabled="busy || slotsBusy" @click="loadSlots">{{ t('dayplan.ui.retry') }}</v-btn>
          </v-alert>
          <v-alert type="info" variant="tonal" rounded="lg" class="mb-5 text-body-2">{{ t('dayplan.ui.reservationHint') }}</v-alert>
          <v-defaults-provider :defaults="{VSelect: {variant: 'outlined', density: 'comfortable', hideDetails: 'auto'}, VTextField: {variant: 'outlined', density: 'comfortable', hideDetails: 'auto'}}">
            <v-row>
              <v-col cols="12">
                <v-select v-model="taskId" :items="taskOptions" :label="t('dayplan.field.task')" prepend-inner-icon="mdi-checkbox-marked-circle-outline" :disabled="busy" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="reservationDate" type="date" :label="t('dayplan.ui.reservationDate')" prepend-inner-icon="mdi-calendar-outline" :disabled="busy" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="startAt" :items="slotOptions" :label="t('dayplan.ui.slot')" prepend-inner-icon="mdi-clock-outline" :loading="slotsBusy" :disabled="busy || slotsBusy" />
              </v-col>
            </v-row>
          </v-defaults-provider>
          <v-alert v-if="!slotsBusy && !slotsError && !slots.length" type="info" variant="tonal" rounded="lg" density="compact" class="mt-4 text-body-2" role="status">{{ t('dayplan.ui.noSlots') }}</v-alert>
        </v-card-text>
        <v-card-actions class="planning-dialog-actions d-flex flex-wrap justify-end ga-2 pa-4 pa-sm-5">
          <v-btn rounded="lg" :disabled="busy" @click="scheduleOpen = false">{{ t('dayplan.ui.cancel') }}</v-btn>
          <v-btn class="planning-schedule-submit" color="primary" variant="flat" rounded="lg" prepend-icon="mdi-calendar-plus" :disabled="busy || slotsBusy || !taskId || !startAt" :loading="busy" @click="schedule">{{ t('dayplan.ui.createEvent') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.planning-page,
.planning-dialog {
  --planning-border: rgba(var(--v-theme-on-surface), 0.12);
  --planning-control-surface: rgba(var(--v-theme-on-surface), 0.025);
  color: rgb(var(--v-theme-on-surface));
}

.planning-header,
.planning-empty,
.planning-dialog-header {
  background: linear-gradient(120deg, rgba(var(--v-theme-primary), 0.045), rgb(var(--v-theme-surface)) 60%), rgb(var(--v-theme-surface));
}

.planning-header,
.planning-empty,
.planning-dialog {
  border: 1px solid var(--planning-border);
}


.planning-header :deep(.v-btn),
.planning-proposal-actions :deep(.v-btn),
.planning-generate,
.planning-dialog :deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.planning-save-state {
  white-space: nowrap;
}

.planning-date-nav {
  max-width: 100%;
  border: 1px solid var(--planning-border);
  background: var(--planning-control-surface);
}

.planning-date {
  flex: 1 1 164px;
  min-width: 0;
  width: 164px;
}

.planning-date :deep(.v-field),
.planning-dialog :deep(.v-field) {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  font-size: 0.875rem;
}

.planning-date :deep(.v-field:not(.v-field--focused) .v-field__outline),
.planning-dialog :deep(.v-field:not(.v-field--focused) .v-field__outline) {
  --v-field-border-opacity: 0.16;
}

.planning-date :deep(input) {
  min-width: 0;
}

.planning-capacity,
.planning-proposal-actions :deep(.v-btn),
.planning-schedule-submit {
  height: auto;
  min-height: 36px;
  max-width: 100%;
  padding-block: 8px;
}

.planning-capacity :deep(.v-btn__content),
.planning-proposal-actions :deep(.v-btn__content),
.planning-schedule-submit :deep(.v-btn__content) {
  white-space: normal;
  overflow-wrap: anywhere;
  min-width: 0;
}

.planning-proposal-actions :deep(.v-btn) {
  min-width: 0;
  padding-inline: 8px;
}

.planning-proposal-actions {
  min-width: 0;
  padding-top: 12px;
  border-top: 1px solid var(--planning-border);
}

.planning-empty-hint {
  max-width: 480px;
  line-height: 1.7;
}

.planning-dialog-header {
  white-space: normal;
  border-bottom: 1px solid var(--planning-border);
}

.planning-dialog-actions {
  border-top: 1px solid var(--planning-border);
  background: var(--planning-control-surface);
}

@media (max-width: 599px) {

  .planning-dialog-actions > .v-btn {
    width: 100%;
    margin-inline: 0;
  }
}
</style>
