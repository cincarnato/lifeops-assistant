<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useTaskImportance} from '../composables/useTaskImportance'
import {formatPlanningTaskProperty, normalizePlanningTaskProperties, planningTaskProperties} from '../composables/usePlanningTaskProperties'

const props = defineProps<{task: unknown, visibleProperties: string[]}>()
const {t, locale} = useI18n()
const {importanceOption} = useTaskImportance()
const properties = computed(() => {
  const selected = new Set(normalizePlanningTaskProperties(props.visibleProperties))
  return planningTaskProperties.filter(property => selected.has(property.key)).map(property => {
    const value = formatPlanningTaskProperty(props.task, property.key, {
      locale: locale.value, t: (key, values) => values ? t(key, values) : t(key),
      importanceTitle: value => importanceOption(value as Parameters<typeof importanceOption>[0])?.title
    })
    const label = t(`task.field.${property.key}`)
    const task = props.task && typeof props.task === 'object' ? props.task as Record<string, unknown> : {}
    const color = property.key === 'importance'
      ? importanceOption(task.importance as Parameters<typeof importanceOption>[0])?.color
      : property.key === 'urgent' && task.urgent === true ? 'warning'
      : property.key === 'valueScore' ? 'primary'
      : property.key === 'motivationScore' ? 'success'
      : property.key === 'effortScore' ? 'error' : undefined
    return {...property, value, tooltip: `${label}: ${value}`, color}
  }).filter(property => property.value)
})
</script>

<template>
  <div v-if="properties.length" class="d-flex flex-wrap ga-1">
    <v-tooltip v-for="property in properties" :key="property.key" :text="property.tooltip">
      <template #activator="{props: activatorProps}">
        <v-chip v-bind="activatorProps" :prepend-icon="property.icon" :color="property.color"
                :aria-label="property.tooltip" tabindex="0" size="small" variant="tonal"
                class="planning-task-property">
          <span class="text-truncate">{{ property.value }}</span>
        </v-chip>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.planning-task-property {
  max-width: 100%;
  min-width: 0;
}
.planning-task-property :deep(.v-chip__content) {
  min-width: 0;
}
.planning-task-property:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
