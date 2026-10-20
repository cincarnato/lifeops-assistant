<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'
import type {CenterDestination, CenterTab} from './commandCenter'

interface Metric {
  tab: CenterTab
  preset: string
  icon: string
  color: string
  aggregate?: 'amount' | 'runs'
  total: number | null
  loading: boolean
  error: boolean
}

const props = defineProps<{metrics: Metric[]}>()
defineEmits<{navigate: [destination: CenterDestination]; retry: []}>()
const {t, locale} = useI18n()
const {xs, sm, md, lg} = useDisplay()
const page = ref(0)
const paused = ref(false)
const hovered = ref(false)
const focused = ref(false)
const mounted = ref(false)
const reducedMotion = ref(false)
let motionPreference: MediaQueryList | undefined
function updateMotionPreference() {
  reducedMotion.value = motionPreference?.matches ?? false
  if (reducedMotion.value) paused.value = true
}
const perPage = computed(() => xs.value ? 1 : sm.value ? 2 : md.value ? 3 : lg.value ? 4 : 6)
const pages = computed(() => {
  const result: Metric[][] = []
  for (let index = 0; index < props.metrics.length; index += perPage.value) {
    result.push(props.metrics.slice(index, index + perPage.value))
  }
  return result
})
const rotating = computed(() => mounted.value && pages.value.length > 1 && !paused.value && !hovered.value && !focused.value)
const countFormatter = computed(() => new Intl.NumberFormat(locale.value))
const amountFormatter = computed(() => new Intl.NumberFormat(locale.value, {minimumFractionDigits: 2, maximumFractionDigits: 2}))
let timer: ReturnType<typeof setInterval> | undefined

function totalLabel(metric: Metric) {
  if (metric.total === null) return '—'
  return (metric.aggregate === 'amount' ? amountFormatter.value : countFormatter.value).format(metric.total)
}

function move(direction: number) {
  if (pages.value.length < 2) return
  page.value = (page.value + direction + pages.value.length) % pages.value.length
}

function stopRotation() {
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}

function startRotation() {
  stopRotation()
  if (rotating.value) timer = setInterval(() => move(1), 8000)
}

function onFocusOut(event: FocusEvent) {
  const container = event.currentTarget as HTMLElement
  focused.value = event.relatedTarget instanceof Node && container.contains(event.relatedTarget)
}

watch(rotating, startRotation)
watch(page, startRotation)
watch(perPage, (value, previous) => {
  page.value = Math.floor(page.value * previous / value)
})
watch(() => pages.value.length, count => {
  page.value = Math.min(page.value, Math.max(0, count - 1))
  startRotation()
})
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  motionPreference.addEventListener('change', updateMotionPreference)
  mounted.value = true
})
onBeforeUnmount(() => {
  stopRotation()
  motionPreference?.removeEventListener('change', updateMotionPreference)
})
</script>

<template>
  <section
    v-if="metrics.length"
    class="metrics-section mb-3"
    role="region"
    :aria-label="t('commandCenter.metricCarousel.label')"
    :aria-roledescription="t('commandCenter.metricCarousel.description')"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
  >
    <div class="metrics-strip d-flex align-stretch ga-2">
      <div class="metrics-controls d-flex flex-column align-center justify-center ga-1">
        <span class="metrics-page text-caption" :aria-label="t('commandCenter.metricCarousel.page', {current: page + 1, total: pages.length})">{{ page + 1 }} / {{ pages.length }}</span>
        <div class="d-flex align-center">
        <v-btn
          :icon="paused ? 'mdi-play' : 'mdi-pause'" size="x-small" variant="text"
          :disabled="pages.length < 2" :aria-pressed="paused"
          :aria-label="t(paused ? 'commandCenter.metricCarousel.resume' : 'commandCenter.metricCarousel.pause')"
          :title="t(paused ? 'commandCenter.metricCarousel.resume' : 'commandCenter.metricCarousel.pause')"
          @click="paused = !paused"
        />
        <v-btn
          icon="mdi-chevron-left" size="x-small" variant="text"
          :disabled="pages.length < 2"
          :aria-label="t('commandCenter.metricCarousel.previous')"
          :title="t('commandCenter.metricCarousel.previous')"
          @click="move(-1)"
        />
        <v-btn
          icon="mdi-chevron-right" size="x-small" variant="text"
          :disabled="pages.length < 2"
          :aria-label="t('commandCenter.metricCarousel.next')"
          :title="t('commandCenter.metricCarousel.next')"
          @click="move(1)"
        />
        </div>
      </div>
    <v-window v-model="page" class="metrics-window flex-grow-1" :aria-live="rotating ? 'off' : 'polite'">
      <v-window-item
        v-for="(group, index) in pages" :key="index" :value="index"
        :transition="reducedMotion ? false : undefined" :reverse-transition="reducedMotion ? false : undefined"
        role="group" :aria-label="t('commandCenter.metricCarousel.page', {current: index + 1, total: pages.length})"
      >
        <v-row dense class="flex-nowrap ma-0">
          <v-col v-for="metric in group" :key="`${metric.tab}-${metric.preset}`" :cols="12 / perPage">
            <v-card variant="flat" class="metric-card d-flex align-center" rounded="lg">
              <v-btn
                variant="text" height="100%" class="metrics-navigation flex-grow-1 pa-2 text-none"
                :aria-label="`${t(`commandCenter.metrics.${metric.tab}_${metric.preset}`)}: ${metric.loading ? t('commandCenter.loading') : totalLabel(metric)}`"
                @click="$emit('navigate', metric)"
              >

                <div class="metrics-text flex-grow-1 text-start">
                  <div class="metrics-title text-caption text-wrap">{{ t(`commandCenter.metrics.${metric.tab}_${metric.preset}`) }}</div>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear v-if="metric.loading" indeterminate :color="metric.color" class="my-2 flex-grow-1" />
                    <div v-else class="metric-value font-weight-bold">{{ totalLabel(metric) }}</div>
                    <v-icon :icon="metric.icon" :color="metric.color" size="18" class="metric-icon flex-shrink-0" />
                  </div>
                </div>
                <v-tooltip activator="parent" location="bottom">{{ t(`commandCenter.metrics.${metric.tab}_${metric.preset}`) }} · {{ t(`commandCenter.metricHints.${metric.tab}_${metric.preset}`) }}</v-tooltip>
              </v-btn>
              <v-btn
                v-if="metric.error" icon="mdi-refresh" size="x-small" variant="text" class="mr-1 flex-shrink-0"
                :aria-label="t('commandCenter.retry')" :title="t('commandCenter.loadError')"
                @click.stop="$emit('retry')"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
    </div>
  </section>
</template>

<style scoped>
.metrics-window,
.metrics-navigation,
.metrics-text {
  min-width: 0;
}

.metrics-controls,
.metrics-title {
  color: var(--cc-muted, rgba(var(--v-theme-on-surface), 0.65));
}


.metrics-controls {
  order: 1;
  flex-shrink: 0;
  align-self: stretch;
  margin-block: 4px;
  border: 1px solid var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
  border-radius: 10px;
  padding: 4px;
}

.metric-card {
  height: 100%;
  min-height: 68px;
  border: 1px solid var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
  background: var(--cc-soft, rgba(var(--v-theme-on-surface), 0.035));
}

.metrics-navigation {
  border-radius: inherit;
  letter-spacing: normal;
}

.metrics-title {
  line-height: 1rem;
  overflow-wrap: anywhere;
}

.metric-icon {
  opacity: 0.7;
}

.metric-value {
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
  white-space: normal;
}

.metric-value,
.metrics-page {
  font-variant-numeric: tabular-nums;
}

.metrics-navigation:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -3px;
}

.metrics-navigation :deep(.v-btn__content) {
  width: 100%;
  min-width: 0;
}
</style>
