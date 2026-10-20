<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import PlanningTaskProperties from './PlanningTaskProperties.vue'
import type {IDayPlanBase} from '../interfaces/IDayPlan'
import {assignTask, prioritySlots} from './taskPlanning'
const props = defineProps<{
  tasks: NonNullable<IDayPlanBase['tasks']>
  readonly?: boolean
  previousTaskIds?: string[]
  section?: 'planned' | 'proposals'
  visibleProperties?: string[]
  canEditTask?: boolean
  taskEditBusy?: boolean
}>()
const emit = defineEmits<{schedule: [taskId: string]; 'edit-task': [taskId: string]}>()
const {t} = useI18n()
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
  <div class="task-board d-flex flex-column ga-4">
    <v-card v-if="section !== 'proposals'" class="task-board__group task-board__group--priority" variant="outlined" rounded="xl">
      <v-card-title class="task-board__heading">
        <v-avatar color="primary" variant="tonal" rounded="lg" size="36"><v-icon icon="mdi-flag-checkered" size="20" /></v-avatar>
        <div class="flex-grow-1">
          <h2 class="text-subtitle-1 font-weight-bold">{{ t('dayplan.ui.priorities') }}</h2>
          <p class="text-caption text-medium-emphasis">{{ t('dayplan.ui.priorityProgress', {count}) }}</p>
        </div>
        <v-progress-circular :model-value="count / 3 * 100" color="primary" size="32" width="3" :aria-label="t('dayplan.ui.priorityProgress', {count})" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
      <v-row dense>
        <v-col v-for="slot in slots" :key="slot.priority" cols="12">
          <v-card variant="outlined" class="task-board__task pa-3" :class="{'task-board__task--focus': slot.priority === 'A1', 'task-board__task--empty': !slot.entry}" rounded="lg">
            <div class="d-flex flex-wrap align-center ga-2">
              <v-chip size="small" color="primary">{{ slot.priority }}</v-chip>
              <span v-if="slot.priority === 'A1'" class="text-caption">{{ t('dayplan.ui.nonNegotiable') }}</span>
              <v-spacer />
              <v-btn v-if="slot.entry && canEditTask" icon="mdi-pencil-outline" size="x-small" variant="text" :title="t('task.form.operation.edit')" :aria-label="t('dayplan.ui.editTask', {title: slot.entry.task?.title || slot.entry.task})" :disabled="readonly || taskEditBusy" @click="emit('edit-task', slot.entry.task?._id || slot.entry.task)" />
              <v-btn v-if="slot.entry" size="x-small" density="compact" variant="text" prepend-icon="mdi-calendar-plus" :disabled="readonly" @click="emit('schedule', slot.entry.task?._id || slot.entry.task)">{{ t('dayplan.ui.reserveHour') }}</v-btn>
              <v-btn v-if="slot.entry" size="small" density="compact" variant="text" :disabled="readonly" @click="assign(slot.entry, null)">{{ t('dayplan.ui.removeAssignment') }}</v-btn>
            </div>
            <p class="mt-1 text-body-2 font-weight-medium">{{ slot.entry ? (slot.entry.task?.title || slot.entry.task) : t('dayplan.ui.emptyPriority') }}</p>
            <PlanningTaskProperties v-if="slot.entry" :task="slot.entry.task" :visible-properties="visibleProperties ?? []" class="mt-2" />
          </v-card>
        </v-col>
      </v-row>
      </v-card-text>
    </v-card>

    <v-card v-if="section !== 'proposals'" class="task-board__group task-board__group--desirable" variant="outlined" rounded="xl">
      <v-card-title class="task-board__heading">
        <v-avatar color="info" variant="tonal" rounded="lg" size="36"><v-icon icon="mdi-star-outline" size="20" /></v-avatar>
        <div class="flex-grow-1">
          <h2 class="text-subtitle-1 font-weight-bold">{{ t('dayplan.ui.desirables') }}</h2>
          <p class="text-caption text-medium-emphasis">{{ t('dayplan.ui.desirablesHint') }}</p>
        </div>
        <v-chip color="info" size="small" variant="tonal">{{ desirables.length }}</v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4 d-flex flex-column ga-3">
        <p v-if="!desirables.length" class="task-board__empty text-body-2 text-medium-emphasis">{{ t('dayplan.ui.noDesirables') }}</p>
        <v-card v-for="(entry, index) in desirables" :key="entry.task?._id || index" variant="outlined" rounded="lg" class="task-board__task pa-3">
          <div class="d-flex align-start ga-2 mb-2">
            <p class="text-body-2 font-weight-medium flex-grow-1">{{ entry.task?.title || entry.task }}</p>
            <v-btn v-if="canEditTask" icon="mdi-pencil-outline" size="x-small" variant="text" :title="t('task.form.operation.edit')" :aria-label="t('dayplan.ui.editTask', {title: entry.task?.title || entry.task})" :disabled="readonly || taskEditBusy" @click="emit('edit-task', entry.task?._id || entry.task)" />
          </div>
          <PlanningTaskProperties :task="entry.task" :visible-properties="visibleProperties ?? []" class="mb-3" />
          <div class="d-flex flex-wrap ga-2">
            <v-btn v-for="priority in prioritySlots" :key="priority" size="small" variant="tonal" color="primary" :disabled="readonly" @click="assign(entry, priority)">{{ priority }}</v-btn>
            <v-btn size="small" variant="text" :disabled="readonly" @click="assign(entry, null)">{{ t('dayplan.ui.removeAssignment') }}</v-btn>
          </div>
        </v-card>
      </v-card-text>
    </v-card>

    <v-card v-if="section !== 'planned'" class="task-board__group task-board__group--proposals" variant="outlined" rounded="xl">
      <v-card-title class="task-board__heading">
        <v-avatar color="secondary" variant="tonal" rounded="lg" size="36"><v-icon icon="mdi-tray-arrow-down" size="20" /></v-avatar>
        <div class="flex-grow-1">
          <h2 class="text-subtitle-1 font-weight-bold">{{ t('dayplan.ui.proposals') }}</h2>
          <p class="text-caption text-medium-emphasis">{{ t('dayplan.ui.proposalsHint') }}</p>
        </div>
        <v-chip color="secondary" size="small" variant="tonal">{{ proposals.length }}</v-chip>
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
      <slot name="proposal-actions" />
      <v-alert v-if="!proposals.length" variant="tonal" class="my-3">{{ t('dayplan.ui.noProposals') }}</v-alert>
      <v-card v-for="(entry, index) in proposals" :key="entry.task?._id || index" variant="outlined" rounded="lg" class="task-board__task pa-3 mt-3">
        <v-chip v-if="previousTaskIds?.includes(entry.task?._id || entry.task)" size="small" density="compact" variant="tonal" class="mb-2">{{ t('dayplan.ui.previousPending') }}</v-chip>
        <div class="d-flex align-start ga-2 mb-2">
          <p class="text-body-2 font-weight-medium flex-grow-1">{{ entry.task?.title || entry.task }}</p>
          <v-btn v-if="canEditTask" icon="mdi-pencil-outline" size="x-small" variant="text" :title="t('task.form.operation.edit')" :aria-label="t('dayplan.ui.editTask', {title: entry.task?.title || entry.task})" :disabled="readonly || taskEditBusy" @click="emit('edit-task', entry.task?._id || entry.task)" />
        </div>
        <PlanningTaskProperties :task="entry.task" :visible-properties="visibleProperties ?? []" class="mb-3" />
        <div class="d-flex flex-wrap ga-2">
          <v-btn v-for="priority in prioritySlots" :key="priority" size="small" density="compact" variant="tonal" :disabled="readonly" @click="assign(entry, priority)">{{ priority }}</v-btn>
          <v-btn size="small" density="compact" variant="text" :disabled="readonly" @click="assign(entry, 'DESEABLE')">{{ t('dayplan.ui.desirable') }}</v-btn>
          <v-btn size="small" density="compact" variant="text" :disabled="readonly" @click="discard(entry)">{{ t('dayplan.ui.notToday') }}</v-btn>
        </div>
      </v-card>

      <v-expansion-panels v-if="discarded.length" variant="accordion" class="mt-4">
        <v-expansion-panel :title="t('dayplan.ui.hiddenTasks', {count: discarded.length})">
          <v-expansion-panel-text>
            <div v-for="(entry, index) in discarded" :key="entry.task?._id || index" class="d-flex flex-wrap align-center ga-2 my-2">
              <div class="flex-grow-1">
                <span>{{ entry.task?.title || entry.task }}</span>
                <PlanningTaskProperties :task="entry.task" :visible-properties="visibleProperties ?? []" class="mt-2" />
              </div>
              <v-btn v-if="canEditTask" icon="mdi-pencil-outline" size="x-small" variant="text" :title="t('task.form.operation.edit')" :aria-label="t('dayplan.ui.editTask', {title: entry.task?.title || entry.task})" :disabled="readonly || taskEditBusy" @click="emit('edit-task', entry.task?._id || entry.task)" />
              <v-btn size="small" density="compact" variant="text" :disabled="readonly" @click="assign(entry, null)">{{ t('dayplan.ui.restoreTask') }}</v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.task-board__group {
  --task-accent: var(--v-theme-primary);
  border-color: rgba(var(--v-theme-on-surface), 0.12);
  border-top: 3px solid rgba(var(--task-accent), 0.7);
  background: rgb(var(--v-theme-surface));
}
.task-board__group--desirable { --task-accent: var(--v-theme-info); }
.task-board__group--proposals { --task-accent: var(--v-theme-secondary); }
.task-board__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  white-space: normal;
  overflow-wrap: anywhere;
  background: linear-gradient(120deg, rgba(var(--task-accent), 0.07), transparent);
}
.task-board__heading h2 { line-height: 1.4; }
.task-board__heading p { margin-top: 2px; line-height: 1.5; }
.task-board__task {
  border-color: rgba(var(--v-theme-on-surface), 0.1);
  background: rgba(var(--v-theme-on-surface), 0.025);
  overflow-wrap: anywhere;
}
.task-board__task--focus {
  border-color: rgba(var(--v-theme-primary), 0.28);
  background: rgba(var(--v-theme-primary), 0.05);
}
.task-board__task--empty { border-style: dashed; }
.task-board__empty {
  padding: 16px;
  border: 1px dashed rgba(var(--v-theme-info), 0.25);
  border-radius: 12px;
  background: rgba(var(--v-theme-info), 0.035);
}
.task-board :deep(.v-btn) { text-transform: none; letter-spacing: 0; border-radius: 8px; }
.task-board :deep(.v-divider) { opacity: 0.08; }
</style>
