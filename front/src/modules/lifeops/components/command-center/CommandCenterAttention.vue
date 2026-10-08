<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {ref} from 'vue'
import {useDisplay} from 'vuetify'
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
const {smAndDown} = useDisplay()
const expanded = ref(false)
function date(value: unknown) {
  if (!value) return '—'
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? '—' : new Intl.DateTimeFormat(locale.value, {timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'short', timeStyle: 'short'}).format(parsed)
}
</script>

<template>
  <v-btn v-if="smAndDown && visible.some(tab => ['memories', 'tasks', 'schedules', 'jobs'].includes(tab))" block variant="tonal" class="mb-3 text-none" :append-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" :aria-expanded="expanded" aria-controls="command-center-attention" @click="expanded = !expanded">{{ t('commandCenter.attentionCards') }}</v-btn>
  <v-row v-show="!smAndDown || expanded" id="command-center-attention" dense class="mb-3">
    <v-col v-if="visible.includes('memories')" cols="12" md="4">
      <v-card variant="flat" border height="100%">
        <v-card-text class="pa-3">
          <div class="d-flex align-center ga-2 mb-1 text-caption text-medium-emphasis"><v-icon icon="mdi-brain" size="18" />{{ t('commandCenter.randomMemory') }}<v-spacer /><v-btn icon="mdi-shuffle-variant" size="x-small" variant="text" :loading="memory.loading" :aria-label="t('commandCenter.anotherMemory')" @click="$emit('another')" /></div>
          <v-skeleton-loader v-if="memory.loading" type="text" />
          <div v-else-if="memory.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('another')">{{ t('commandCenter.retry') }}</v-btn></div>
          <template v-else-if="memory.item">
            <v-btn class="text-none justify-start px-0 mw-100" variant="text" size="small" @click="$emit('open', 'memories', memory.item)"><span class="text-truncate">{{ memory.item.title }}</span></v-btn>
            <div class="text-caption excerpt">{{ memory.item.content }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ displayValue(memory.item.type) }} · {{ displayValue(memory.item.tags) }}</div>
          </template>
          <div v-else class="text-body-2 text-medium-emphasis">{{ t('commandCenter.noMemories') }}</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-if="visible.includes('tasks')" cols="12" md="4">
      <v-card variant="flat" border height="100%">
        <v-card-text class="pa-3">
          <div class="text-caption text-medium-emphasis mb-2"><v-icon icon="mdi-calendar-alert" size="18" class="mr-2" />{{ t('commandCenter.attention') }}</div>
          <v-skeleton-loader v-if="attention.loading" type="text" />
          <div v-else-if="attention.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('retryTask')">{{ t('commandCenter.retry') }}</v-btn></div>
          <template v-else-if="attention.item">
            <v-btn class="text-none justify-start px-0 mw-100" variant="text" size="small" @click="$emit('open', 'tasks', attention.item)"><span class="text-truncate">{{ attention.item.title }}</span></v-btn>
            <div class="text-caption text-error">{{ t(`commandCenter.presets.${attention.reason}`) }}<span v-if="attention.reason === 'overdue'"> · {{ date(attention.item.dueDate) }}</span></div>
            <div class="text-caption text-medium-emphasis">{{ displayValue(attention.item.project) }} · {{ displayValue(attention.item.priority) }}</div>
          </template>
          <div v-else class="text-body-2 text-medium-emphasis">{{ t('commandCenter.noAttention') }}</div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col v-if="visible.includes('schedules') || visible.includes('jobs')" cols="12" md="4">
      <v-card variant="flat" border height="100%">
        <v-card-text class="pa-3">
          <div class="text-caption text-medium-emphasis mb-2"><v-icon icon="mdi-calendar-clock" size="18" class="mr-2" />{{ t('commandCenter.nextAutomation') }}</div>
          <v-skeleton-loader v-if="automation.loading" type="text" />
          <div v-else-if="automation.error" role="alert">{{ t('commandCenter.loadError') }} <v-btn variant="text" size="small" @click="$emit('retryAutomation')">{{ t('commandCenter.retry') }}</v-btn></div>
          <template v-else-if="automation.item">
            <v-btn class="text-none justify-start px-0 mw-100" variant="text" size="small" @click="$emit('open', automation.tab, automation.item)"><span class="text-truncate">{{ automation.item.name }}</span></v-btn>
            <div class="text-caption">{{ t(`commandCenter.tabs.${automation.tab}`) }} · {{ date(valueAt(automation.item, 'runtime.nextRunAt')) }}</div>
            <div class="text-caption text-medium-emphasis">{{ displayValue(valueAt(automation.item, 'schedule.timezone')) }}</div>
          </template>
          <div v-else class="text-body-2 text-medium-emphasis">{{ t('commandCenter.noAutomation') }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
</style>
