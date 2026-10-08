<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {displayValue, valueAt} from './commandCenter'

const props = defineProps<{value: unknown; field: string; colors?: Record<string, string>}>()
const {t, te, locale} = useI18n()
const text = computed(() => {
  if (props.field === 'schedule') {
    const schedule = props.value
    const type = String(valueAt(schedule, 'type') || '')
    const label = te(`commandCenter.recurrence.${type}`) ? t(`commandCenter.recurrence.${type}`) : type
    const extra = type === 'interval'
      ? `${displayValue(valueAt(schedule, 'interval.every'))} ${displayValue(valueAt(schedule, 'interval.unit'))}`
      : [valueAt(schedule, 'time'), valueAt(schedule, 'daysOfWeek'), valueAt(schedule, 'daysOfMonth'), valueAt(schedule, 'monthsOfYear'), valueAt(schedule, 'cronExpression'), valueAt(schedule, 'runAt')].filter(value => value && (!Array.isArray(value) || value.length)).map(displayValue).join(' · ')
    return [label, extra, valueAt(schedule, 'timezone')].filter(Boolean).join(' · ') || '—'
  }
  if (/Date$|At$/.test(props.field)) {
    if (!props.value) return '—'
    const date = new Date(String(props.value))
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locale.value, {dateStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires'}).format(date)
  }
  return displayValue(props.value)
})
</script>

<template>
  <v-chip v-if="field === 'active'" :color="value ? 'success' : undefined" size="x-small" variant="tonal">{{ t(value ? 'commandCenter.active' : 'commandCenter.paused') }}</v-chip>
  <div v-else-if="field === 'progressPercent' && typeof value === 'number'" class="d-flex align-center ga-2"><v-progress-linear :model-value="value" color="primary" rounded height="5" style="min-width: 60px" /><span class="text-caption">{{ value }}%</span></div>
  <v-chip v-else-if="['status', 'priority', 'runtime.lastStatus'].includes(field) && value" :color="colors?.[String(value)]" size="x-small">{{ text }}</v-chip>
  <span v-else :title="text" class="cell-text" :class="{'cell-excerpt': field === 'content'}">{{ text }}</span>
</template>

<style scoped>
.cell-text {
  overflow-wrap: anywhere;
}
.cell-excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
