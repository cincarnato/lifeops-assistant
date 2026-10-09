<script setup lang="ts">
import {Crud, useCrud} from '@drax/crud-vue'
import {useI18n} from 'vue-i18n'
import type {ValidationRule} from 'vuetify'
import ServiceCrud from '../../cruds/ServiceCrud'

const entity = ServiceCrud.instance
const {operation} = useCrud(entity)
const {t} = useI18n()
</script>

<template>
  <crud :entity="entity">
    <template #field.type="{field, modelValue, setValue}">
      <v-select
        :model-value="modelValue"
        :label="t('service.field.type')"
        :items="field.enum?.map((value: string) => ({title: t(`service.type.${value}`), value}))"
        :rules="entity.getRule(field.name) as ValidationRule[]"
        :readonly="operation === 'view' || operation === 'delete'"
        variant="outlined"
        @update:model-value="setValue"
      />
    </template>
    <template #field.frequency="{field, modelValue, setValue}">
      <v-select
        :model-value="modelValue"
        :label="t('service.field.frequency')"
        :items="field.enum?.map((value: string) => ({title: t(`service.frequency.${value}`), value}))"
        :rules="entity.getRule(field.name) as ValidationRule[]"
        :readonly="operation === 'view' || operation === 'delete'"
        variant="outlined"
        @update:model-value="setValue"
      />
    </template>
    <template #item.businessPartner="{value}">{{ value?.name }}</template>
    <template #item.type="{value}">{{ t(`service.type.${value}`) }}</template>
    <template #item.frequency="{value}">{{ t(`service.frequency.${value}`) }}</template>
  </crud>
</template>
