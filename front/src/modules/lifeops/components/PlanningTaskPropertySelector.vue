<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {DEFAULT_PLANNING_TASK_PROPERTIES, normalizePlanningTaskProperties, planningTaskProperties} from '../composables/usePlanningTaskProperties'

const props = defineProps<{modelValue: string[]; iconOnly?: boolean}>()
const emit = defineEmits<{'update:modelValue': [value: string[]]}>()
const {t} = useI18n()
const open = ref(false)
const groups = ['basic', 'classification', 'dates', 'context', 'scoring', 'integrations', 'activity'] as const
const selected = computed(() => new Set(normalizePlanningTaskProperties(props.modelValue)))
function toggle(key: string, checked: boolean | null) {
  const keys = new Set(selected.value)
  if (checked) keys.add(key as typeof planningTaskProperties[number]['key'])
  else keys.delete(key as typeof planningTaskProperties[number]['key'])
  emit('update:modelValue', [...keys])
}
</script>

<template>
  <v-dialog v-model="open" max-width="640" scrollable>
    <template #activator="{props: activatorProps}">
      <v-btn v-bind="activatorProps" :icon="iconOnly" :prepend-icon="iconOnly ? undefined : 'mdi-tune-variant'" :aria-label="t('dayplan.ui.taskProperties')" variant="text">
        <v-icon v-if="iconOnly" icon="mdi-tune-variant" />
        <v-tooltip v-if="iconOnly" activator="parent" :text="t('dayplan.ui.taskProperties')" />
        <template v-if="!iconOnly">{{ t('dayplan.ui.taskProperties') }}</template>
      </v-btn>
    </template>
    <v-card :title="t('dayplan.ui.taskProperties')" rounded="xl">
      <v-card-text>
        <p class="text-body-2 mb-4">{{ t('dayplan.ui.propertiesHint') }}</p>
        <v-row>
          <v-col v-for="group in groups" :key="group" cols="12" sm="6">
            <h3 class="text-subtitle-2 mb-2">{{ t(`dayplan.ui.propertyGroups.${group}`) }}</h3>
            <v-checkbox v-for="property in planningTaskProperties.filter(item => item.group === group)"
                        :key="property.key" :model-value="selected.has(property.key)"
                        :label="t(`task.field.${property.key}`)" :prepend-icon="property.icon"
                        density="compact" hide-details @update:model-value="toggle(property.key, $event)" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="flex-wrap ga-1">
        <v-btn @click="emit('update:modelValue', [...DEFAULT_PLANNING_TASK_PROPERTIES])">{{ t('dayplan.ui.defaultProperties') }}</v-btn>
        <v-btn @click="emit('update:modelValue', planningTaskProperties.map(property => property.key))">{{ t('dayplan.ui.allProperties') }}</v-btn>
        <v-spacer />
        <v-btn @click="open = false">{{ t('dayplan.ui.closeProperties') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
