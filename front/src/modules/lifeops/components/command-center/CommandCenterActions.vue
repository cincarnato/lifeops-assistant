<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import type {CenterEntity, CenterTab} from './commandCenter'

defineProps<{entities: CenterEntity[]}>()
defineEmits<{create: [tab: CenterTab]}>()
const {t} = useI18n()
</script>

<template>
  <div v-if="entities.length" class="cc-quick-actions d-flex flex-wrap ga-2" role="group" :aria-label="t('commandCenter.design.quickCreate')">
    <v-btn v-if="entities.some(entity => entity.key === 'tasks')" color="primary" variant="flat" prepend-icon="mdi-plus" @click="$emit('create', 'tasks')">{{ t('commandCenter.newTask') }}</v-btn>
    <v-btn v-if="entities.some(entity => entity.key === 'memories')" variant="outlined" prepend-icon="mdi-note-plus-outline" @click="$emit('create', 'memories')">{{ t('commandCenter.newMemory') }}</v-btn>
    <v-menu v-if="entities.some(entity => !['tasks', 'memories'].includes(entity.key))">
      <template #activator="{props}">
        <v-btn v-bind="props" variant="text" append-icon="mdi-chevron-down">{{ t('commandCenter.add') }}</v-btn>
      </template>
      <v-list density="compact" rounded="lg" elevation="3">
        <v-list-item v-for="entity in entities.filter(entry => !['tasks', 'memories'].includes(entry.key))" :key="entity.key" :prepend-icon="entity.icon" :title="t(`commandCenter.tabs.${entity.key}`)" @click="$emit('create', entity.key)" />
      </v-list>
    </v-menu>
  </div>
</template>

<style scoped>
.cc-quick-actions :deep(.v-btn) {
  min-height: 40px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: normal;
}
.cc-quick-actions :deep(.v-btn--variant-outlined) {
  border-color: var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
}
</style>
