<script setup lang="ts">
import {computed} from 'vue'
import {CrudFormField} from '@drax/crud-vue'
import type {IEntityCrud, IEntityCrudField} from '@drax/crud-share'
import {valueAt} from './commandCenter'

const props = defineProps<{entity: IEntityCrud; field: IEntityCrudField; modelValue: Record<string, unknown>; readonly: boolean}>()
const emit = defineEmits<{'update:modelValue': [value: Record<string, unknown>]}>()
const fieldsByType: Record<string, string[]> = {
  once: ['runAt'], interval: ['interval'], daily: ['time'], weekly: ['time', 'daysOfWeek'],
  monthly: ['time', 'monthlyMode', 'daysOfMonth'], yearly: ['time', 'monthsOfYear', 'daysOfMonth'], cron: ['cronExpression'],
}
const fields = computed(() => {
  const names = ['type', 'timezone', ...(fieldsByType[String(props.modelValue?.type)] ?? [])]
  return props.field.objectFields?.filter(field => names.includes(field.name) && !(field.name === 'daysOfMonth' && props.modelValue?.monthlyMode === 'lastDayOfMonth')) ?? []
})

function update(field: IEntityCrudField, value: unknown) {
  if (field.name === 'type') {
    const defaults = props.field.default as Record<string, unknown>
    const names = ['timezone', ...(fieldsByType[String(value)] ?? [])]
    const schedule = Object.fromEntries(names.map(name => [name, name === 'timezone' ? props.modelValue?.timezone || defaults.timezone : structuredClone(defaults[name] ?? null)]))
    emit('update:modelValue', {...schedule, type: value})
  } else {
    emit('update:modelValue', {...props.modelValue, [field.name]: value})
  }
}
</script>

<template>
  <v-row dense>
    <v-col v-for="nested in fields" :key="nested.name" cols="12">
      <crud-form-field :entity="entity" :field="nested" parent-field="schedule" :model-value="valueAt(modelValue, nested.name)" :readonly="readonly" @update:model-value="update(nested, $event)" />
    </v-col>
  </v-row>
</template>
