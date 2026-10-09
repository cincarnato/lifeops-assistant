<script setup lang="ts">
import {Crud, useCrud} from '@drax/crud-vue'
import {formatDate} from '@drax/common-front'
import {useI18n} from 'vue-i18n'
import type {ValidationRule} from 'vuetify'
import ServiceTransactionCrud from '../../cruds/ServiceTransactionCrud'

const entity = ServiceTransactionCrud.instance
const {operation} = useCrud(entity)
const {t} = useI18n()
</script>

<template>
  <crud :entity="entity">
    <template #field.status="{field, modelValue, setValue}">
      <v-select
        :model-value="modelValue"
        :label="t('servicetransaction.field.status')"
        :items="field.enum?.map((value: string) => ({title: t(`servicetransaction.status.${value}`), value}))"
        :rules="entity.getRule(field.name) as ValidationRule[]"
        :readonly="operation === 'view' || operation === 'delete'"
        variant="outlined"
        @update:model-value="setValue"
      />
    </template>
    <template #item.service="{value}">{{ value?.name }}</template>
    <template #item.status="{value}">{{ t(`servicetransaction.status.${value}`) }}</template>
    <template #item.paidAt="{value}">{{ value ? formatDate(value) : '—' }}</template>
  </crud>
</template>
