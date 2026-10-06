
<script setup lang="ts">
import TaskScheduleCrud from '../../cruds/TaskScheduleCrud'
import {Crud, CrudFormField, useCrudStore} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import type {IEntityCrudField} from "@drax/crud-share";
import {computed} from "vue";
import TaskTypeCombobox from "@/modules/lifeops/comboboxes/TaskTypeCombobox.vue";
import SourceCombobox from "@/modules/lifeops/comboboxes/SourceCombobox.vue";
import TaskStatusCombobox from "@/modules/lifeops/comboboxes/TaskStatusCombobox.vue";
import PriorityCombobox from "@/modules/lifeops/comboboxes/PriorityCombobox.vue";
import LifeAreaCombobox from "@/modules/lifeops/comboboxes/LifeAreaCombobox.vue";

type ScheduleType = 'once' | 'interval' | 'daily' | 'weekly' | 'monthly' | 'yearly'

const scheduleFieldsByType: Record<ScheduleType, string[]> = {
  once: ['runAt'],
  interval: ['interval'],
  daily: ['time'],
  weekly: ['time', 'daysOfWeek'],
  monthly: ['time', 'monthlyMode', 'daysOfMonth'],
  yearly: ['time', 'monthsOfYear', 'daysOfMonth'],
}

const scheduleDefaults = {
  time: '',
  timezone: 'America/Argentina/Buenos_Aires',
  interval: {
    every: null,
    unit: null,
  },
  daysOfWeek: [],
  daysOfMonth: [],
  monthsOfYear: [],
  runAt: null,
  monthlyMode: null,
}

const store = useCrudStore(TaskScheduleCrud.instance.name)

const isReadonly = computed(() => store.operation === 'delete' || store.operation === 'view')

function scheduleField(field: IEntityCrudField, name: string) {
  return field.objectFields?.find((objectField) => objectField.name === name)
}

function scheduleVisibleFields(field: IEntityCrudField, schedule: any) {
  const type = schedule?.type as ScheduleType | undefined
  const typedFieldNames = type ? scheduleFieldsByType[type] || [] : []
  const fieldNames = ['type', ...(type ? ['timezone', ...typedFieldNames] : [])]

  return fieldNames
      .filter((name) => name !== 'daysOfMonth' || shouldShowDaysOfMonth(schedule))
      .map((name) => scheduleField(field, name))
      .filter((objectField): objectField is IEntityCrudField => !!objectField)
}

function shouldShowDaysOfMonth(schedule: any) {
  return schedule?.type !== 'monthly' || schedule?.monthlyMode !== 'lastDayOfMonth'
}

function updateScheduleType(schedule: any, type: ScheduleType | null, setValue: (value: any) => void) {
  const nextSchedule = {
    ...schedule,
    ...scheduleDefaults,
    type,
    timezone: schedule?.timezone || scheduleDefaults.timezone,
    interval: {...scheduleDefaults.interval},
  }

  setValue(nextSchedule)
}

</script>

<template>
  <crud :entity="TaskScheduleCrud.instance">
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
                  :entity="TaskScheduleCrud.instance"
                  :field="scheduleObjectField"
                  parent-field="schedule"
                  :readonly="isReadonly || scheduleObjectField.readonly"
                  v-model="modelValue[scheduleObjectField.name]"
              />
              <crud-form-field
                  v-else
                  :entity="TaskScheduleCrud.instance"
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

    <template v-slot:field.task.source="{field, modelValue, setValue}">
      <source-combobox
        :model-value="modelValue"
        @update:modelValue="setValue"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
        variant="outlined"
      />
    </template>

    <template v-slot:field.task.type="{field, modelValue, setValue}">
      <task-type-combobox
        :model-value="modelValue"
        @update:modelValue="setValue"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
        variant="outlined"
      />
    </template>

    <template v-slot:field.task.status="{field, modelValue, setValue}">
      <task-status-combobox
        :model-value="modelValue"
        @update:modelValue="setValue"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
        variant="outlined"
      />
    </template>

    <template v-slot:field.task.lifeArea="{field, modelValue, setValue}">
      <life-area-combobox
        :model-value="modelValue"
        @update:modelValue="setValue"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
        variant="outlined"
      />
    </template>

    <template v-slot:field.task.priority="{field, modelValue, setValue}">
      <priority-combobox
        :model-value="modelValue"
        @update:modelValue="setValue"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
        variant="outlined"
      />
    </template>

    <template v-slot:item.startAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.endAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>
