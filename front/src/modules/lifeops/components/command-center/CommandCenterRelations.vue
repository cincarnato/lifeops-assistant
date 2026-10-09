<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {displayValue, referenceId, valueAt} from './commandCenter'
import type {CenterDestination, CenterItem, CenterTab} from './commandCenter'

const props = defineProps<{tab: CenterTab; item: CenterItem; visible: CenterTab[]}>()
const emit = defineEmits<{navigate: [destination: CenterDestination]; openReference: [tab: CenterTab, id: string]}>()
const {t} = useI18n()
function related(tab: CenterTab, field: string) {
  emit('navigate', {tab, context: {field, id: props.item._id, label: displayValue(props.item.name || props.item.title)}})
}
function open(tab: CenterTab, value: unknown) {
  const id = referenceId(value)
  if (id) emit('openReference', tab, id)
}
</script>

<template>
  <div class="d-flex flex-wrap ga-1">
    <v-btn v-if="['projects', 'goals', 'schedules'].includes(tab) && visible.includes('tasks')" variant="text" size="x-small" prepend-icon="mdi-format-list-checks" @click="related('tasks', tab === 'projects' ? 'project' : tab === 'goals' ? 'goals' : 'taskSchedule')">{{ t('commandCenter.tabs.tasks') }}</v-btn>
    <v-btn v-if="['businessPartners', 'goals'].includes(tab) && visible.includes('projects')" variant="text" size="x-small" prepend-icon="mdi-briefcase-outline" @click="related('projects', tab === 'businessPartners' ? 'businessPartner' : 'goals')">{{ t('commandCenter.tabs.projects') }}</v-btn>
    <v-btn v-if="tab === 'businessPartners' && item.mainContact && visible.includes('contacts')" variant="text" size="x-small" @click="open('contacts', item.mainContact)">{{ t('commandCenter.mainContact') }}</v-btn>
    <template v-if="tab === 'projects'">
      <v-btn v-if="item.businessPartner && visible.includes('businessPartners')" variant="text" size="x-small" @click="open('businessPartners', item.businessPartner)">{{ displayValue(item.businessPartner) }}</v-btn>
      <template v-if="Array.isArray(item.goals) && visible.includes('goals')">
        <v-btn v-for="goal in item.goals" :key="referenceId(goal)" variant="text" size="x-small" @click="open('goals', goal)">{{ displayValue(goal) }}</v-btn>
      </template>
    </template>
    <v-btn v-if="tab === 'schedules' && valueAt(item, 'runtime.lastTaskId') && visible.includes('tasks')" variant="text" size="x-small" @click="open('tasks', valueAt(item, 'runtime.lastTaskId'))">{{ t('commandCenter.lastTask') }}</v-btn>
  </div>
</template>
