<script setup lang="ts">
import DayPlanCrud from '../../cruds/DayPlanCrud'
import {Crud, useCrud} from '@drax/crud-vue'
import {useI18n} from 'vue-i18n'
import DayPlan from '../DayPlan.vue'
const {t, locale} = useI18n()
function civilDate(value?: Date | string | null) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}
function formatDate(value?: Date | string | null) {
  const date = civilDate(value)
  return date ? new Intl.DateTimeFormat(locale.value, {timeZone: 'UTC', dateStyle: 'short'}).format(new Date(date)) : '-'
}
const {operation} = useCrud(DayPlanCrud.instance)
</script>

<template>
  <Crud :entity="DayPlanCrud.instance">
    <template #field.date="{modelValue, setValue}">
      <v-text-field :model-value="civilDate(modelValue)" type="date" :label="t('dayplan.field.date')"
        :readonly="operation === 'view' || operation === 'delete'"
        :rules="[value => !!value || t('validation.required')]"
        @update:model-value="setValue" />
    </template>
    <template #field.tasks="{form}"><DayPlan :item="form" :operation="operation || undefined" /></template>
    <template #field.status />
    <template #field.events />
    <template #field.habits />
    <template #field.suggestions />
    <template #item.date="{value}">{{ formatDate(value) }}</template>
    <template #item.user="{value}">{{ value?.username }}</template>
  </Crud>
</template>
