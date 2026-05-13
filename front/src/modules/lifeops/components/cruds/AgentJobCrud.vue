
<script setup lang="ts">
import AgentJobCrud from '../../cruds/AgentJobCrud'
import {Crud, CrudFormField, useCrudStore} from "@drax/crud-vue";
import type {IEntityCrudField} from "@drax/crud-share";
import {computed} from "vue";

type ScheduleType = 'once' | 'daily' | 'weekly' | 'monthly' | 'interval' | 'cron'

const scheduleFieldsByType: Record<ScheduleType, string[]> = {
  once: ['runAt'],
  daily: ['time'],
  weekly: ['time', 'daysOfWeek'],
  monthly: ['time', 'daysOfMonth'],
  interval: ['interval'],
  cron: ['cronExpression'],
}

const scheduleDefaults = {
  runAt: null,
  time: '',
  daysOfWeek: [],
  daysOfMonth: [],
  interval: {
    every: null,
    unit: null,
  },
  cronExpression: '',
}

const store = useCrudStore(AgentJobCrud.instance.name)

const isReadonly = computed(() => store.operation === 'delete' || store.operation === 'view')

function scheduleField(field: IEntityCrudField, name: string) {
  return field.objectFields?.find((objectField) => objectField.name === name)
}

function scheduleVisibleFields(field: IEntityCrudField, schedule: any) {
  const type = schedule?.type as ScheduleType | undefined
  const fieldNames = ['type', ...(type ? ['timezone', ...(scheduleFieldsByType[type] || [])] : [])]
  return fieldNames
    .map((name) => scheduleField(field, name))
    .filter((objectField): objectField is IEntityCrudField => !!objectField)
}

function updateScheduleType(schedule: any, type: ScheduleType | null, setValue: (value: any) => void) {
  const nextSchedule = {
    ...schedule,
    ...scheduleDefaults,
    type,
    timezone: schedule?.timezone || 'America/Argentina/Buenos_Aires',
    interval: {...scheduleDefaults.interval},
  }

  setValue(nextSchedule)
}

</script>

<template>
  <crud :entity="AgentJobCrud.instance">
    <template v-slot:field.schedule="{field, modelValue, setValue}">
      <v-card class="mt-3" variant="flat" border>
        <v-card-title class="text-h5">{{ field.label }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col
                v-for="scheduleObjectField in scheduleVisibleFields(field, modelValue)"
                :key="scheduleObjectField.name"
                cols="12"
            >
              <crud-form-field
                  v-if="scheduleObjectField.name !== 'type'"
                  :entity="AgentJobCrud.instance"
                  :field="scheduleObjectField"
                  parent-field="schedule"
                  :readonly="isReadonly || scheduleObjectField.readonly"
                  v-model="modelValue[scheduleObjectField.name]"
              />
              <crud-form-field
                  v-else
                  :entity="AgentJobCrud.instance"
                  :field="scheduleObjectField"
                  parent-field="schedule"
                  :readonly="isReadonly || scheduleObjectField.readonly"
                  :model-value="modelValue?.type"
                  @update:model-value="(value) => updateScheduleType(modelValue, value, setValue)"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
    <template v-slot:item.createdBy="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>
