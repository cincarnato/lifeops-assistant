<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'
import type {CenterDestination} from './commandCenter'
import {centerMetrics} from './commandCenter'

defineProps<{metrics: (typeof centerMetrics[number] & {total: number | null; loading: boolean; error: boolean})[]}>()
defineEmits<{navigate: [destination: CenterDestination]; retry: []}>()
const {t} = useI18n()
const {smAndDown} = useDisplay()
</script>

<template>
  <v-row dense class="mb-2" :class="{'flex-nowrap overflow-x-auto': smAndDown}">
    <v-col v-for="metric in metrics" :key="`${metric.tab}-${metric.preset}`" cols="6" sm="4" lg="2">
      <v-card variant="flat" border height="100%" :aria-label="t(`commandCenter.metrics.${metric.tab}_${metric.preset}`)" @click="$emit('navigate', metric)">
        <div class="d-flex align-center ga-3 px-3 py-2">
          <v-icon :icon="metric.icon" :color="metric.color" size="24" />
          <div class="flex-grow-1">
            <div class="text-caption text-medium-emphasis">{{ t(`commandCenter.metrics.${metric.tab}_${metric.preset}`) }}</div>
            <v-progress-linear v-if="metric.loading" indeterminate :color="metric.color" class="my-2" />
            <div v-else class="text-h6 font-weight-bold">{{ metric.total ?? '—' }}</div>
          </div>
          <v-btn v-if="metric.error" icon="mdi-refresh" size="x-small" variant="text" :aria-label="t('commandCenter.retry')" @click.stop="$emit('retry')" />
        </div>
        <v-tooltip activator="parent" location="bottom">{{ t(`commandCenter.metricHints.${metric.tab}_${metric.preset}`) }}</v-tooltip>
      </v-card>
    </v-col>
  </v-row>
</template>
