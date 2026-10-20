<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import type {CenterItem, CenterTab} from './commandCenter'
import {displayValue, valueAt} from './commandCenter'

defineProps<{
  memory: {item: CenterItem | null; loading: boolean; error: boolean}
  attention: {item: CenterItem | null; reason: string; loading: boolean; error: boolean}
  automation: {item: CenterItem | null; tab: CenterTab; loading: boolean; error: boolean}
  visible: CenterTab[]
}>()
defineEmits<{open: [tab: CenterTab, item: CenterItem]; another: []; retryTask: []; retryAutomation: []}>()
const {t, locale} = useI18n()

function date(value: unknown) {
  if (!value) return '—'
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? '—' : new Intl.DateTimeFormat(locale.value, {timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short'}).format(parsed)
}
</script>

<template>
  <section id="command-center-attention" :aria-label="t('commandCenter.attentionCards')">
    <h2 v-if="visible.some(tab => ['memories', 'tasks', 'schedules', 'jobs'].includes(tab))" class="attention-heading text-caption font-weight-bold mb-3">{{ t('commandCenter.design.focus') }}</h2>
    <v-row dense>
      <v-col v-if="visible.includes('tasks')" cols="12">
        <v-card variant="flat" height="100%" class="attention-card attention-primary" rounded="lg">
          <v-card-text class="pa-4">
            <div class="attention-header d-flex align-center ga-2 mb-2"><v-icon icon="mdi-calendar-alert" size="18" />{{ t('commandCenter.attention') }}</div>
            <v-skeleton-loader v-if="attention.loading" type="text" />
            <div v-else-if="attention.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('retryTask')">{{ t('commandCenter.retry') }}</v-btn></div>
            <template v-else-if="attention.item">
              <v-btn class="attention-title attention-task-title text-none justify-start px-0 mb-2" variant="text" height="auto" @click="$emit('open', 'tasks', attention.item)"><span>{{ attention.item.title }}</span></v-btn>
              <div class="d-flex align-center flex-wrap ga-2 mb-2 text-caption">
                <v-chip size="x-small" variant="tonal" :color="attention.reason === 'overdue' ? 'error' : attention.reason === 'urgent' ? 'warning' : undefined" :prepend-icon="attention.reason === 'overdue' ? 'mdi-clock-alert-outline' : 'mdi-flag-outline'">{{ t(`commandCenter.presets.${attention.reason}`) }}</v-chip>
                <span v-if="attention.reason === 'overdue'" class="attention-muted">{{ date(attention.item.dueDate) }}</span>
              </div>
              <div class="text-caption attention-muted attention-metadata">{{ displayValue(attention.item.project) }} · {{ displayValue(attention.item.priority) }}</div>
            </template>
            <div v-else class="text-body-2 attention-muted">{{ t('commandCenter.noAttention') }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="visible.includes('memories')" cols="12">
        <v-card variant="flat" height="100%" class="attention-card" rounded="lg">
          <v-card-text class="pa-4">
            <div class="attention-header d-flex align-center ga-2 mb-2"><v-icon icon="mdi-brain" size="18" />{{ t('commandCenter.randomMemory') }}<v-spacer /><v-btn icon="mdi-shuffle-variant" size="x-small" variant="text" :loading="memory.loading" :aria-label="t('commandCenter.anotherMemory')" @click="$emit('another')" /></div>
            <v-skeleton-loader v-if="memory.loading" type="text" />
            <div v-else-if="memory.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('another')">{{ t('commandCenter.retry') }}</v-btn></div>
            <template v-else-if="memory.item">
              <v-btn class="attention-title text-none justify-start px-0 mb-2" variant="text" height="auto" size="small" @click="$emit('open', 'memories', memory.item)"><span>{{ memory.item.title }}</span></v-btn>
              <div class="text-caption excerpt">{{ memory.item.content }}</div>
              <div class="text-caption attention-muted attention-metadata mt-2">{{ displayValue(memory.item.type) }} · {{ displayValue(memory.item.tags) }}</div>
            </template>
            <div v-else class="text-body-2 text-medium-emphasis">{{ t('commandCenter.noMemories') }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="visible.includes('schedules') || visible.includes('jobs')" cols="12">
        <v-card variant="flat" height="100%" class="attention-card" rounded="lg">
          <v-card-text class="pa-4">
            <div class="attention-header d-flex align-center mb-2"><v-icon icon="mdi-calendar-clock" size="18" class="mr-2" />{{ t('commandCenter.nextAutomation') }}</div>
            <v-skeleton-loader v-if="automation.loading" type="text" />
            <div v-else-if="automation.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('retryAutomation')">{{ t('commandCenter.retry') }}</v-btn></div>
            <template v-else-if="automation.item">
              <v-btn class="attention-title text-none justify-start px-0 mb-2" variant="text" height="auto" size="small" @click="$emit('open', automation.tab, automation.item)"><span>{{ automation.item.name }}</span></v-btn>
              <div class="text-caption">{{ t(`commandCenter.tabs.${automation.tab}`) }} · {{ date(valueAt(automation.item, 'runtime.nextRunAt')) }}</div>
              <div class="text-caption attention-muted attention-metadata mt-2">{{ displayValue(valueAt(automation.item, 'schedule.timezone')) }}</div>
            </template>
            <div v-else class="text-body-2 text-medium-emphasis">{{ t('commandCenter.noAutomation') }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.attention-card :deep(.v-card-text) {
  padding: 14px !important;
}

.attention-card {
  border: 1px solid var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
  background: var(--cc-soft, rgba(var(--v-theme-on-surface), 0.035));
}

.attention-primary {
  background: rgb(var(--v-theme-surface));
  border-inline-start: 3px solid rgb(var(--v-theme-primary));
}

.attention-heading,
.attention-header,
.attention-muted {
  color: var(--cc-muted, rgba(var(--v-theme-on-surface), 0.65));
}

.attention-heading {
  letter-spacing: 0.06em;
}

.attention-header {
  min-height: 28px;
  font-size: 0.75rem;
  font-weight: 600;
}

.attention-title {
  max-width: 100%;
  min-height: 32px;
  letter-spacing: normal;
  font-weight: 600;
}

.attention-title :deep(.v-btn__content) {
  white-space: normal;
  text-align: start;
  overflow-wrap: anywhere;
  min-width: 0;
}

.attention-task-title {
  font-size: 0.9375rem;
  line-height: 1.4;
}

.attention-metadata {
  overflow-wrap: anywhere;
}
.excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
</style>
