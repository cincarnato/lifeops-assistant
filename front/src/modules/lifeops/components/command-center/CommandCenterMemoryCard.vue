<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import CommandCenterCell from './CommandCenterCell.vue'
import {displayValue} from './commandCenter'
import type {CenterItem} from './commandCenter'

const props = defineProps<{
  item: CenterItem
  colors: Record<string, Record<string, string>>
  canUpdate: boolean
  canDelete: boolean
}>()
defineEmits<{open: [item: CenterItem]; edit: [item: CenterItem]; delete: [item: CenterItem]}>()
const {t} = useI18n()
const accent = computed(() => props.colors.priority?.[String(props.item.priority)] || 'primary')
const accentColor = computed(() => accent.value.startsWith('#') || accent.value.startsWith('rgb') ? accent.value : `rgb(var(--v-theme-${accent.value}))`)
const tags = computed(() => Array.isArray(props.item.tags) ? props.item.tags.filter(tag => typeof tag === 'string' && tag.trim()) : [])
</script>

<template>
  <v-card variant="outlined" rounded="lg" class="memory-card d-flex flex-column h-100" :style="{'--memory-accent': accentColor}">
    <div class="memory-card-header pa-4 d-flex align-start ga-3">
      <v-icon icon="mdi-brain" size="20" class="memory-muted mt-1" />
      <div class="memory-heading flex-grow-1">
        <div class="memory-muted d-flex flex-wrap align-center ga-3 mb-2 text-caption">
          <span v-if="item.type" class="memory-metadata">{{ displayValue(item.type) }}</span>
          <span v-if="item.priority" class="memory-metadata d-inline-flex align-center ga-1" :title="t('commandCenter.fields.priority')"><v-icon icon="mdi-flag-outline" size="14" :color="accent" />{{ displayValue(item.priority) }}</span>
        </div>
        <button type="button" class="memory-title text-subtitle-1 font-weight-bold text-start" @click="$emit('open', item)">{{ displayValue(item.title) }}</button>
      </div>
    </div>
    <v-card-text class="px-4 pt-0 pb-4 flex-grow-1">
      <div v-if="item.lifeArea" class="memory-muted memory-metadata d-flex align-center ga-2 text-caption mb-3">
        <v-icon icon="mdi-compass-outline" size="16" />
        <span>{{ displayValue(item.lifeArea) }}</span>
      </div>
      <p class="memory-content text-body-2">{{ displayValue(item.content) }}</p>
      <div v-if="tags.length" class="memory-muted d-flex flex-wrap ga-2 mt-4">
        <span v-for="tag in tags" :key="tag" class="memory-tag text-caption">#{{ tag }}</span>
      </div>
    </v-card-text>
    <div v-if="item.source || item.createdAt" class="memory-muted px-4 pb-4 d-flex flex-column ga-2 text-caption">
      <div v-if="item.source" class="d-flex align-start ga-2">
        <v-icon icon="mdi-link-variant" size="16" class="mt-1" />
        <span class="memory-source"><span class="font-weight-medium">{{ t('commandCenter.fields.source') }}:</span> {{ displayValue(item.source) }}</span>
      </div>
      <div v-if="item.createdAt" class="d-flex align-center ga-2">
        <v-icon icon="mdi-calendar-outline" size="16" />
        <span>{{ t('commandCenter.fields.createdAt') }}: <command-center-cell field="createdAt" :value="item.createdAt" /></span>
      </div>
    </div>
    <v-card-actions class="memory-actions px-3 py-2 ga-1">
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
.memory-heading {
  min-width: 0;
}
.memory-muted {
  color: var(--cc-muted, rgba(var(--v-theme-on-surface), 0.65));
}
.memory-metadata {
  overflow-wrap: anywhere;
  min-width: 0;
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
  color: var(--memory-accent);
}
.memory-title:focus-visible {
  outline: 2px solid var(--memory-accent);
  outline-offset: 3px;
  border-radius: 4px;
}
.memory-content, .memory-source {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.memory-content {
  -webkit-line-clamp: 5;
  white-space: pre-line;
  line-height: 1.65;
}
.memory-source {
  -webkit-line-clamp: 2;
}
.memory-tag {
  max-width: 100%;
  overflow-wrap: anywhere;
}
@media (prefers-reduced-motion: reduce) {
  .memory-card {
    transition: none;
  }
}
</style>
