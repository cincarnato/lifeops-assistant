<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
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

defineProps<{metrics: Metric[]}>()
defineEmits<{navigate: [destination: CenterDestination]; retry: []}>()
const {t, locale} = useI18n()
const countFormatter = computed(() => new Intl.NumberFormat(locale.value))
const amountFormatter = computed(() => new Intl.NumberFormat(locale.value, {minimumFractionDigits: 2, maximumFractionDigits: 2}))

function totalLabel(metric: Metric) {
  if (metric.total === null) return '—'
  return (metric.aggregate === 'amount' ? amountFormatter.value : countFormatter.value).format(metric.total)
}
</script>

<template>
  <section v-if="metrics.length" id="command-center-metrics" class="metrics-strip my-1" tabindex="0" :aria-label="t('commandCenter.metricSummary.label')">
    <div class="d-flex flex-nowrap ga-1">
      <div v-for="metric in metrics" :key="`${metric.tab}-${metric.preset}`" class="d-flex align-center flex-shrink-0 ga-1">
        <v-chip
          variant="outlined" size="small" rounded="sm" class="metric-chip px-2"
          :aria-label="`${t(`commandCenter.metrics.${metric.tab}_${metric.preset}`)}: ${metric.loading ? t('commandCenter.loading') : metric.error ? t('commandCenter.loadError') : totalLabel(metric)}`"
          :aria-busy="metric.loading"
          @click="$emit('navigate', metric)"
        >
          <v-icon :icon="metric.icon" :color="metric.color" size="14" class="mr-1" />
          <span class="metric-label">{{ t(`commandCenter.metrics.${metric.tab}_${metric.preset}`) }}</span>
          <v-progress-circular v-if="metric.loading" indeterminate size="12" width="2" class="ml-2" :color="metric.color" />
          <v-icon v-else-if="metric.error" icon="mdi-alert-circle-outline" color="error" size="14" class="ml-2" />
          <span v-else class="metric-value font-weight-bold ml-2">{{ totalLabel(metric) }}</span>
          <v-tooltip activator="parent" location="bottom">{{ t(`commandCenter.metrics.${metric.tab}_${metric.preset}`) }} · {{ metric.error ? t('commandCenter.loadError') : t(`commandCenter.metricHints.${metric.tab}_${metric.preset}`) }}</v-tooltip>
        </v-chip>
        <v-btn
          v-if="metric.error" icon="mdi-refresh" size="x-small" variant="text"
          :aria-label="`${t('commandCenter.retry')}: ${t(`commandCenter.metrics.${metric.tab}_${metric.preset}`)}`"
          :title="t('commandCenter.retry')" @click="$emit('retry')"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.metrics-strip {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 2px;
}
.metric-chip {
  height: 26px;
  border-color: var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
}
.metric-chip :deep(.v-chip__content) {
  min-width: 0;
  white-space: nowrap;
}
.metric-label {
  color: var(--cc-muted, rgba(var(--v-theme-on-surface), 0.65));
}
.metric-value {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.metric-chip:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 1px;
}
</style>
