<script setup lang="ts">
import {computed, ref, watch, onBeforeUnmount} from 'vue'
import {onBeforeRouteLeave} from 'vue-router'
import {useI18n} from 'vue-i18n'
import DayPlan from '../components/DayPlan.vue'
import DayPlanProvider from '../providers/DayPlanProvider'
import type {IDayPlan} from '../interfaces/IDayPlan'

import {serialQueue, persistLatest} from '../components/planningPersistence'

const {t, locale} = useI18n()
const provider = DayPlanProvider.instance
function localDate(offset = 0, base = new Date()) {
  const date = new Date(base)
  date.setDate(date.getDate() + offset)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
const date = ref(localDate(-1))
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
function openSchedule() {
  return run(async () => { scheduleOpen.value = true })
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
  })
}
void load()
</script>

<template>
  <v-container fluid>
    <h1 class="text-h4 mb-4">{{ t('dayplan.ui.planning') }}</h1>
    <v-row align="center">
      <v-col cols="12" md="6" class="d-flex align-center ga-2">
        <v-btn icon="mdi-chevron-left" :aria-label="t('dayplan.ui.previous')" :disabled="busy" @click="move(-1)" />
        <v-text-field :model-value="date" type="date" :label="t('dayplan.field.date')" hide-details :disabled="busy" @update:model-value="changeDate" />
        <v-btn icon="mdi-chevron-right" :aria-label="t('dayplan.ui.next')" :disabled="busy" @click="move(1)" />
      </v-col>
      <v-col cols="12" md="6" class="d-flex flex-wrap ga-2">
        <v-btn :disabled="busy" @click="changeDate(localDate())">{{ t('dayplan.ui.today') }}</v-btn>
        <v-btn :disabled="busy" @click="changeDate(localDate(1))">{{ t('dayplan.ui.tomorrow') }}</v-btn>
        <v-btn :disabled="busy" icon="mdi-refresh" :aria-label="t('dayplan.ui.reload')" @click="changeDate(date)" />
      </v-col>
    </v-row>
    <v-alert v-if="error" type="error" class="my-4">
      {{ error }}
      <v-btn variant="text" :disabled="busy" @click="retry">{{ t('dayplan.ui.retry') }}</v-btn>
    </v-alert>
    <v-progress-linear v-if="busy" indeterminate class="my-4" />
    <template v-if="plan">
      <div class="d-flex flex-wrap ga-2 my-4">
        <v-btn prepend-icon="mdi-calendar-plus" :disabled="busy" @click="openSchedule">{{ t('dayplan.ui.schedule') }}</v-btn>
        <span role="status" class="text-caption align-self-center">{{ t(busy ? 'dayplan.ui.saving' : dirty ? 'dayplan.ui.unsaved' : 'dayplan.ui.saved') }}</span>
      </div>
      <DayPlan :item="plan" :operation="busy ? 'view' : 'edit'">
        <template #proposal-actions>
          <div class="d-flex flex-wrap ga-2 my-3">
            <v-btn :disabled="busy" variant="tonal" @click="proposals('more')">{{ t('dayplan.ui.moreProposals') }}</v-btn>
            <v-btn :disabled="busy" variant="text" @click="proposals('other')">{{ t('dayplan.ui.otherProposals') }}</v-btn>
          </div>
        </template>
      </DayPlan>
    </template>
    <v-card v-else-if="!busy && !error" class="pa-6 mt-4" variant="outlined">
      <p class="mb-4">{{ t('dayplan.ui.noPlan') }}</p>
      <v-btn color="primary" @click="generate">{{ t('dayplan.ui.generate') }}</v-btn>
    </v-card>
    <v-dialog v-model="scheduleOpen" max-width="600" :persistent="busy">
      <v-card :title="t('dayplan.ui.schedule')">
        <v-card-text>
          <v-alert v-if="error" type="error" class="mb-4">
            {{ error }}
            <v-btn variant="text" :disabled="busy" @click="retry">{{ t('dayplan.ui.retry') }}</v-btn>
          </v-alert>
          <v-alert v-if="slotsError" type="error" class="mb-4">
            {{ slotsError }}
            <v-btn variant="text" :disabled="busy || slotsBusy" @click="loadSlots">{{ t('dayplan.ui.retry') }}</v-btn>
          </v-alert>
          <v-alert type="info" variant="tonal" class="mb-4">{{ t('dayplan.ui.reservationHint') }}</v-alert>
          <v-select v-model="taskId" :items="taskOptions" :label="t('dayplan.field.task')" :disabled="busy" />
          <v-text-field v-model="reservationDate" type="date" :label="t('dayplan.ui.reservationDate')" :disabled="busy" />
          <v-select v-model="startAt" :items="slotOptions" :label="t('dayplan.ui.slot')" :loading="slotsBusy" :disabled="busy || slotsBusy" />
          <p v-if="!slotsBusy && !slotsError && !slots.length">{{ t('dayplan.ui.noSlots') }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="busy" @click="scheduleOpen = false">{{ t('dayplan.ui.cancel') }}</v-btn>
          <v-spacer />
          <v-btn color="primary" :disabled="busy || slotsBusy || !taskId || !startAt" :loading="busy" @click="schedule">{{ t('dayplan.ui.createEvent') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
