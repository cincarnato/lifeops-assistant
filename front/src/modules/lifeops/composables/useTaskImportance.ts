import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {TaskImportance} from '../interfaces/ITask'

const importanceColors: Record<TaskImportance, string> = {
  A: 'red-darken-2',
  B: 'orange-darken-2',
  C: 'teal-darken-1',
  D: 'blue-darken-1',
  E: 'grey-darken-1'
}

export function useTaskImportance() {
  const {t} = useI18n()
  const importanceOptions = computed(() => Object.entries(importanceColors).map(([value, color]) => ({
    value: value as TaskImportance,
    color,
    title: `${value} · ${t(`task.importance.${value}.title`)}`,
    description: t(`task.importance.${value}.description`)
  })))

  function importanceOption(value?: TaskImportance | null) {
    return importanceOptions.value.find(option => option.value === value)
  }

  return {importanceOptions, importanceOption}
}
