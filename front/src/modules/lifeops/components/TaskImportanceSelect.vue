<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {TaskImportance} from '../interfaces/ITask'
import {useTaskImportance} from '../composables/useTaskImportance'

const model = defineModel<TaskImportance | null>()
defineProps<{readonly?: boolean}>()
const {t} = useI18n()
const {importanceOptions, importanceOption} = useTaskImportance()
const selectedOption = computed(() => importanceOption(model.value))
</script>

<template>
  <v-select
      v-model="model"
      :label="t('task.field.importance')"
      :items="importanceOptions"
      :readonly="readonly"
      :hint="selectedOption?.description"
      persistent-hint
      clearable
  >
    <template #item="{props, item}">
      <v-list-item v-bind="props" :subtitle="item.raw.description">
        <template #prepend>
          <v-avatar :color="item.raw.color" rounded size="36" class="mr-3">
            {{ item.raw.letter }}
          </v-avatar>
        </template>
      </v-list-item>
    </template>
    <template #selection="{item}">
      <v-chip :color="item.raw.color" size="small">{{ item.raw.title }}</v-chip>
    </template>
  </v-select>
</template>
