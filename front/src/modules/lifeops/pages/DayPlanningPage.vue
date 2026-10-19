<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {onBeforeRouteLeave} from 'vue-router'
import {useI18n} from 'vue-i18n'
import DayPlan from '../components/DayPlan.vue'
import DayPlanProvider from '../providers/DayPlanProvider'
import type {IDayPlan} from '../interfaces/IDayPlan'

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
let slotRequest = 0
const taskOptions = computed(() => (plan.value?.tasks || []).map(entry => ({title: entry.task?.title || entry.task, value: entry.task?._id || entry.task})))
const slotOptions = computed(() => slots.value.map(slot => ({value: slot.startAt, title: `${new Date(slot.startAt).toLocaleTimeString(locale.value, {hour: '2-digit', minute: '2-digit'})} – ${new Date(slot.endAt).toLocaleTimeString(locale.value, {hour: '2-digit', minute: '2-digit'})}`})))
function accept(value: IDayPlan | null) {
  plan.value = value
  snapshot.value = JSON.stringify(value)
}
function discardAllowed() { return !dirty.value || window.confirm(t('dayplan.ui.discardChanges')) }
onBeforeRouteLeave(() => !busy.value && discardAllowed())
async function changeDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || busy.value || !discardAllowed()) return
  date.value = value
  await load()
}
function move(offset: number) { void changeDate(localDate(offset, new Date(`${date.value}T12:00:00`))) }
async function load() {
  busy.value = true
  error.value = ''
  accept(null)
  try { accept(await provider.planning(date.value)) }
  catch (e) { error.value = e instanceof Error ? e.message : t('dayplan.ui.loadError') }
  finally { busy.value = false }
}
async function generate() {
  busy.value = true
  error.value = ''
  try { accept(await provider.generate(date.value)) }
  catch (e) { error.value = e instanceof Error ? e.message : t('dayplan.ui.saveError') }
  finally { busy.value = false }
}
async function save() {
  if (!plan.value) return
  busy.value = true
  error.value = ''
  try { accept(await provider.update(plan.value._id, plan.value)) }
  catch (e) { error.value = e instanceof Error ? e.message : t('dayplan.ui.saveError') }
  finally { busy.value = false }
}
function cancel() { accept(JSON.parse(snapshot.value)) }
async function loadSlots() {
  const request = ++slotRequest
  startAt.value = null
  slots.value = []
  slotsBusy.value = false
  if (!scheduleOpen.value || !/^\d{4}-\d{2}-\d{2}$/.test(reservationDate.value)) return
  slotsBusy.value = true
  error.value = ''
  try {
    const result = await provider.availableSlots(reservationDate.value)
    if (request === slotRequest) slots.value = result.slots
  } catch (e) { if (request === slotRequest) error.value = e instanceof Error ? e.message : t('dayplan.ui.loadError') }
  finally { if (request === slotRequest) slotsBusy.value = false }
}
watch([reservationDate, scheduleOpen], loadSlots)
async function schedule() {
  if (!plan.value || !taskId.value || !startAt.value || dirty.value) return
  busy.value = true
  error.value = ''
  try {
    accept(await provider.scheduleTask(plan.value._id, taskId.value, startAt.value))
    scheduleOpen.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('dayplan.ui.saveError')
    const message = error.value
    await loadSlots()
    error.value = message
  } finally { busy.value = false }
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
    <v-alert v-if="error" type="error" class="my-4">{{ error }}</v-alert>
    <v-progress-linear v-if="busy" indeterminate class="my-4" />
    <template v-if="plan">
      <div class="d-flex flex-wrap ga-2 my-4">
        <v-btn color="primary" :disabled="busy || !dirty" @click="save">{{ t('dayplan.ui.save') }}</v-btn>
        <v-btn :disabled="busy || !dirty" @click="cancel">{{ t('dayplan.ui.cancel') }}</v-btn>
        <v-btn prepend-icon="mdi-calendar-plus" :disabled="busy || dirty" @click="scheduleOpen = true">{{ t('dayplan.ui.schedule') }}</v-btn>
        <span v-if="dirty" class="text-caption align-self-center">{{ t('dayplan.ui.saveBeforeSchedule') }}</span>
      </div>
      <v-select v-model="plan.status" :items="['BORRADOR', 'VISTO', 'CONFIRMADO', 'CERRADO']" :label="t('dayplan.field.status')" :disabled="busy" />
      <DayPlan :item="plan" :operation="busy ? 'view' : 'edit'" />
    </template>
    <v-card v-else-if="!busy && !error" class="pa-6 mt-4" variant="outlined">
      <p class="mb-4">{{ t('dayplan.ui.noPlan') }}</p>
      <v-btn color="primary" @click="generate">{{ t('dayplan.ui.generate') }}</v-btn>
    </v-card>
    <v-dialog v-model="scheduleOpen" max-width="600" :persistent="busy">
      <v-card :title="t('dayplan.ui.schedule')">
        <v-card-text>
          <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
          <v-alert type="info" variant="tonal" class="mb-4">{{ t('dayplan.ui.reservationHint') }}</v-alert>
          <v-select v-model="taskId" :items="taskOptions" :label="t('dayplan.field.task')" :disabled="busy" />
          <v-text-field v-model="reservationDate" type="date" :label="t('dayplan.ui.reservationDate')" :disabled="busy" />
          <v-select v-model="startAt" :items="slotOptions" :label="t('dayplan.ui.slot')" :loading="slotsBusy" :disabled="busy || slotsBusy" />
          <p v-if="!slotsBusy && !slots.length">{{ t('dayplan.ui.noSlots') }}</p>
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
