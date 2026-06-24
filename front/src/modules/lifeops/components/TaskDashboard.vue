<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {DashboardView} from '@drax/dashboard-vue'
import type {IDashboardBase, IDashboardCard} from '@drax/dashboard-share'
import type {IDraxFieldFilter} from '@drax/crud-share'
import TaskCrud from '@/modules/lifeops/cruds/TaskCrud'

const {t} = useI18n()

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

const toStartOfDay = (value: string) => {
  return new Date(`${value}T00:00:00`)
}

const today = new Date()
const defaultDateFrom = toDateInputValue(addDays(today, -84))
const defaultDateTo = toDateInputValue(today)

const dateFrom = ref(defaultDateFrom)
const dateTo = ref(defaultDateTo)
const appliedDateFrom = ref(defaultDateFrom)
const appliedDateTo = ref(defaultDateTo)
const refreshKey = ref(0)

const createDateFilters = (field: string): IDraxFieldFilter[] => {
  const filters: IDraxFieldFilter[] = []

  if (appliedDateFrom.value) {
    filters.push({
      field,
      operator: 'gte',
      value: toStartOfDay(appliedDateFrom.value),
    })
  }

  if (appliedDateTo.value) {
    filters.push({
      field,
      operator: 'lt',
      value: addDays(toStartOfDay(appliedDateTo.value), 1),
    })
  }

  return filters
}

const createTaskGroupByCard = (
  title: string,
  dateField: 'completedAt' | 'createdAt',
  fields: string[],
  render: string,
): IDashboardCard => {
  return {
    entity: 'Task',
    entityInstance: TaskCrud.instance,
    type: 'groupBy',
    title,
    filters: createDateFilters(dateField),
    layout: {
      cols: 12,
      sm: 12,
      md: 6,
      lg: 4,
      height: 420,
      cardVariant: 'outlined',
    },
    groupBy: {
      fields,
      dateFormat: 'week',
      render,
    },
  }
}

const dashboard = computed<IDashboardBase>(() => {
  return {
    identifier: `task-dashboard-${refreshKey.value}`,
    title: t('task.dashboard.title'),
    updatedAt: new Date(),
    cards: [
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeekly'),
        'completedAt',
        ['completedAt'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeeklyValueScore'),
        'completedAt',
        ['completedAt', 'valueScore'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeeklyMotivationScore'),
        'completedAt',
        ['completedAt', 'motivationScore'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeeklyEffortScore'),
        'completedAt',
        ['completedAt', 'effortScore'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeeklyLifeArea'),
        'completedAt',
        ['completedAt', 'lifeArea'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.completedWeeklyType'),
        'completedAt',
        ['completedAt', 'type'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.createdWeeklySource'),
        'createdAt',
        ['createdAt', 'source'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.createdWeeklyProject'),
        'createdAt',
        ['createdAt', 'project'],
        'table',
      ),
      createTaskGroupByCard(
        t('task.dashboard.cards.createdWeeklyStatus'),
        'createdAt',
        ['createdAt', 'status'],
        'table',
      ),
    ],
  }
})

const refreshDashboard = () => {
  appliedDateFrom.value = dateFrom.value
  appliedDateTo.value = dateTo.value
  refreshKey.value += 1
}
</script>

<template>
  <v-container fluid>
    <v-card
      class="mb-4"
      variant="outlined"
    >
      <v-card-text>
        <v-row align="end">
          <v-col
            cols="12"
            sm="5"
            md="3"
          >
            <v-text-field
              v-model="dateFrom"
              :label="t('task.dashboard.filters.dateFrom')"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col
            cols="12"
            sm="5"
            md="3"
          >
            <v-text-field
              v-model="dateTo"
              :label="t('task.dashboard.filters.dateTo')"
              type="date"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>

          <v-col
            cols="12"
            sm="2"
            md="2"
          >
            <v-btn
              color="primary"
              prepend-icon="mdi-refresh"
              block
              @click="refreshDashboard"
            >
              {{ t('task.dashboard.actions.refresh') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <dashboard-view
      :key="refreshKey"
      :dashboard="dashboard"
    />
  </v-container>
</template>

<style scoped>

</style>
