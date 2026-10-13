import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {TaskImportance} from '../interfaces/ITask'

const importanceLevels: Record<TaskImportance, {letter: string, color: string}> = {
  HIGH: {letter: 'A', color: 'red-darken-2'},
  MEDIUM: {letter: 'B', color: 'orange-darken-2'},
  LOW: {letter: 'C', color: 'teal-darken-1'}
}

export function useTaskImportance() {
  const {t} = useI18n()
  const importanceOptions = computed(() => Object.entries(importanceLevels).map(([value, {letter, color}]) => ({
    value: value as TaskImportance,
    letter,
    color,
    title: `${letter} - ${t(`task.importance.${value}.title`)}`,
    description: t(`task.importance.${value}.description`)
  })))

  function importanceOption(value?: TaskImportance | null) {
    return importanceOptions.value.find(option => option.value === value)
  }

  return {importanceOptions, importanceOption}
}
