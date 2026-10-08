<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import type {CenterEntity, CenterTab} from './commandCenter'

defineProps<{entities: CenterEntity[]}>()
defineEmits<{create: [tab: CenterTab]}>()
const {t} = useI18n()
</script>

<template>
  <div class="d-flex flex-wrap ga-2 mb-3">
    <v-btn v-if="entities.some(entity => entity.key === 'tasks')" color="primary" prepend-icon="mdi-plus" size="small" @click="$emit('create', 'tasks')">{{ t('commandCenter.newTask') }}</v-btn>
    <v-btn v-if="entities.some(entity => entity.key === 'memories')" variant="tonal" prepend-icon="mdi-brain" size="small" @click="$emit('create', 'memories')">{{ t('commandCenter.newMemory') }}</v-btn>
    <v-menu v-if="entities.some(entity => !['tasks', 'memories'].includes(entity.key))">
      <template #activator="{props}">
        <v-btn v-bind="props" variant="text" append-icon="mdi-chevron-down" size="small">{{ t('commandCenter.add') }}</v-btn>
      </template>
      <v-list density="compact">
        <v-list-item v-for="entity in entities.filter(entry => !['tasks', 'memories'].includes(entry.key))" :key="entity.key" :prepend-icon="entity.icon" :title="t(`commandCenter.tabs.${entity.key}`)" @click="$emit('create', entity.key)" />
      </v-list>
    </v-menu>
  </div>
</template>
