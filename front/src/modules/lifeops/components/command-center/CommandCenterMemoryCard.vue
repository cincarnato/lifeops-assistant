<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import CommandCenterCell from './CommandCenterCell.vue'
import {displayValue} from './commandCenter'
import type {CenterItem} from './commandCenter'

defineProps<{
  item: CenterItem
  canUpdate: boolean
  canDelete: boolean
}>()
defineEmits<{open: [item: CenterItem]; edit: [item: CenterItem]; delete: [item: CenterItem]}>()
const {t} = useI18n()
</script>

<template>
  <v-card variant="outlined" rounded="lg" class="memory-card d-flex flex-column h-100">
    <div class="pa-3 pb-2">
      <div class="memory-muted d-flex flex-wrap align-center justify-space-between ga-2 mb-2 text-caption">
        <span v-if="item.type">{{ displayValue(item.type) }}</span>
        <span v-if="item.createdAt" :title="t('commandCenter.fields.createdAt')"><command-center-cell field="createdAt" :value="item.createdAt" /></span>
      </div>
      <button type="button" class="memory-title text-subtitle-1 font-weight-bold text-start" @click="$emit('open', item)">{{ displayValue(item.title) }}</button>
    </div>
    <v-card-text class="px-3 pt-0 pb-3 flex-grow-1">
      <p class="memory-content text-body-2">{{ displayValue(item.content) }}</p>
    </v-card-text>
    <v-card-actions class="memory-actions px-3 py-1 ga-1">
      <v-btn color="primary" variant="text" size="small" prepend-icon="mdi-arrow-top-right" class="text-none" @click="$emit('open', item)">{{ t('commandCenter.open') }}</v-btn>
      <v-spacer />
      <v-btn v-if="canUpdate" icon="mdi-pencil-outline" variant="text" size="small" :aria-label="t('commandCenter.edit')" :title="t('commandCenter.edit')" @click="$emit('edit', item)" />
      <v-btn v-if="canDelete" icon="mdi-delete-outline" variant="text" size="small" color="error" :aria-label="t('commandCenter.delete')" :title="t('commandCenter.delete')" @click="$emit('delete', item)" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.memory-card {
  border: 1px solid var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
  background: rgb(var(--v-theme-surface));
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.memory-card:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.25);
  box-shadow: 0 4px 16px rgba(var(--v-theme-on-surface), 0.04);
}
.memory-muted {
  color: var(--cc-muted, rgba(var(--v-theme-on-surface), 0.65));
  overflow-wrap: anywhere;
}
.memory-actions {
  border-top: 1px solid var(--cc-border, rgba(var(--v-theme-on-surface), 0.12));
  background: var(--cc-soft, rgba(var(--v-theme-on-surface), 0.035));
  flex-wrap: wrap;
}
.memory-title {
  color: inherit;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.memory-title:hover {
  color: rgb(var(--v-theme-primary));
}
.memory-title:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 3px;
  border-radius: 4px;
}
.memory-content {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  overflow-wrap: anywhere;
  white-space: pre-line;
  line-height: 1.5;
}
@media (prefers-reduced-motion: reduce) {
  .memory-card {
    transition: none;
  }
}
</style>
