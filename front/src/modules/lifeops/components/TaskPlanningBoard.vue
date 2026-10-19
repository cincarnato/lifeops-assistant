<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import type {IDayPlanBase} from '../interfaces/IDayPlan'
import {assignTask, prioritySlots} from './taskPlanning'
const props = defineProps<{tasks: NonNullable<IDayPlanBase['tasks']>; readonly?: boolean; previousTaskIds?: string[]}>()
const emit = defineEmits<{schedule: [taskId: string]}>()
const {t, locale} = useI18n()
function explanation(task: Record<string, unknown>) {
  const facts: string[] = []
  if (['HIGH', 'MEDIUM', 'LOW'].includes(String(task?.importance))) facts.push(t('dayplan.ui.importanceFact', {value: t(`task.importance.${task.importance}.title`)}))
  if (typeof task?.urgent === 'boolean') facts.push(t(task.urgent ? 'dayplan.ui.urgentFact' : 'dayplan.ui.notUrgentFact'))
  if (task?.dueDate && !Number.isNaN(new Date(String(task.dueDate)).getTime())) facts.push(t('dayplan.ui.dueFact', {date: new Date(String(task.dueDate)).toLocaleDateString(locale.value, {timeZone: 'UTC'})}))
  const project = task?.project as {name?: string} | undefined
  if (project?.name) facts.push(t('dayplan.ui.projectFact', {name: project.name}))
  return t('dayplan.ui.taskFacts', {facts: facts.join(' · ') || t('dayplan.ui.noTaskFacts')})
}
function discard(entry: NonNullable<IDayPlanBase['tasks']>[number]) {
  if (props.readonly) return
  entry.priority = null
  entry.decision = 'DESCARTADO'
}
const discarded = computed(() => props.tasks.filter(task => task.decision === 'DESCARTADO'))
const slots = computed(() => prioritySlots.map(priority => ({priority, entry: props.tasks.find(task => task.priority === priority)})))
const proposals = computed(() => props.tasks.filter(task => !task.priority && task.decision !== 'DESEABLE' && task.decision !== 'DESCARTADO'))
const desirables = computed(() => props.tasks.filter(task => !task.priority && task.decision === 'DESEABLE'))
const count = computed(() => slots.value.filter(slot => slot.entry).length)
function assign(entry: NonNullable<IDayPlanBase['tasks']>[number], target: 'A1' | 'A2' | 'A3' | 'DESEABLE' | null) {
  if (!props.readonly) assignTask(props.tasks, entry, target)
}
</script>

<template>
  <v-card variant="outlined" rounded="lg">
    <v-card-text>
      <h2 class="text-h6">{{ t('dayplan.ui.priorityProgress', {count}) }}</h2>
      <v-progress-linear :model-value="count / 3 * 100" color="primary" rounded class="my-3" />
      <v-row dense>
        <v-col v-for="slot in slots" :key="slot.priority" cols="12">
          <v-card :variant="slot.priority === 'A1' ? 'tonal' : 'outlined'" :color="slot.priority === 'A1' ? 'primary' : undefined" class="pa-4" rounded="lg">
            <div class="d-flex align-center ga-2">
              <v-chip size="small" color="primary">{{ slot.priority }}</v-chip>
              <span v-if="slot.priority === 'A1'" class="text-caption">{{ t('dayplan.ui.nonNegotiable') }}</span>
              <v-spacer />
              <v-btn v-if="slot.entry" size="small" variant="text" :disabled="readonly" @click="assign(slot.entry, null)">{{ t('dayplan.ui.removeAssignment') }}</v-btn>
            </div>
            <v-btn v-if="slot.entry" size="small" variant="text" :disabled="readonly" @click="emit('schedule', slot.entry.task?._id || slot.entry.task)">{{ t('dayplan.ui.reserveHour') }}</v-btn>
            <p class="mt-3 font-weight-medium">{{ slot.entry ? (slot.entry.task?.title || slot.entry.task) : t('dayplan.ui.emptyPriority') }}</p>
            <p v-if="slot.entry?.task?.project?.name" class="text-caption text-medium-emphasis mt-1">{{ slot.entry.task.project.name }}</p>
          </v-card>
        </v-col>
      </v-row>
      <h3 class="text-subtitle-1 mt-6 mb-3">{{ t('dayplan.ui.proposals') }}</h3>
      <slot name="proposal-actions" />
      <v-alert v-if="!proposals.length" variant="tonal" class="my-3">{{ t('dayplan.ui.noProposals') }}</v-alert>
      <v-card v-for="(entry, index) in proposals" :key="entry.task?._id || index" variant="outlined" class="pa-3 my-3">
        <v-chip v-if="previousTaskIds?.includes(entry.task?._id || entry.task)" size="small" variant="tonal" class="mb-2">{{ t('dayplan.ui.previousPending') }}</v-chip>
        <p class="font-weight-medium mb-2">{{ entry.task?.title || entry.task }}</p>
        <p v-if="entry.task?.project?.name" class="text-caption text-medium-emphasis mb-2">{{ entry.task.project.name }}</p>
        <p class="text-caption text-medium-emphasis mb-2">{{ explanation(entry.task) }}</p>
        <div class="d-flex flex-wrap ga-2">
          <v-btn v-for="priority in prioritySlots" :key="priority" size="small" variant="tonal" :disabled="readonly" @click="assign(entry, priority)">{{ priority }}</v-btn>
          <v-btn size="small" variant="text" :disabled="readonly" @click="assign(entry, 'DESEABLE')">{{ t('dayplan.ui.desirable') }}</v-btn>
          <v-btn size="small" variant="text" :disabled="readonly" @click="discard(entry)">{{ t('dayplan.ui.notToday') }}</v-btn>
        </div>
      </v-card>
      <h3 class="text-subtitle-1 mt-6 mb-3">{{ t('dayplan.ui.desirables') }}</h3>
      <p v-if="!desirables.length" class="text-medium-emphasis">{{ t('dayplan.ui.noDesirables') }}</p>
      <v-card v-for="(entry, index) in desirables" :key="entry.task?._id || index" variant="tonal" class="pa-3 my-3">
        <p class="mb-2">{{ entry.task?.title || entry.task }}</p>
        <p v-if="entry.task?.project?.name" class="text-caption text-medium-emphasis mb-2">{{ entry.task.project.name }}</p>
        <div class="d-flex flex-wrap ga-2">
          <v-btn v-for="priority in prioritySlots" :key="priority" size="small" variant="text" :disabled="readonly" @click="assign(entry, priority)">{{ priority }}</v-btn>
          <v-btn size="small" variant="text" :disabled="readonly" @click="assign(entry, null)">{{ t('dayplan.ui.removeAssignment') }}</v-btn>
        </div>
      </v-card>
      <v-expansion-panels v-if="discarded.length" variant="accordion" class="mt-4">
        <v-expansion-panel :title="t('dayplan.ui.hiddenTasks', {count: discarded.length})">
          <v-expansion-panel-text>
            <div v-for="(entry, index) in discarded" :key="entry.task?._id || index" class="d-flex align-center ga-2 my-2">
              <span>{{ entry.task?.title || entry.task }}</span><v-spacer />
              <v-btn size="small" variant="text" :disabled="readonly" @click="assign(entry, null)">{{ t('dayplan.ui.restoreTask') }}</v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
