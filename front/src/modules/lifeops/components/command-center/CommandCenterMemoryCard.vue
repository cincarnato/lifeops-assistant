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
      <v-avatar :color="accent" variant="tonal" rounded="lg" size="44"><v-icon icon="mdi-brain" size="26" /></v-avatar>
      <div class="flex-grow-1" style="min-width: 0">
        <div class="d-flex flex-wrap ga-2 mb-2">
          <v-chip v-if="item.type" size="x-small" :color="accent" variant="tonal" prepend-icon="mdi-bookmark-outline">{{ displayValue(item.type) }}</v-chip>
          <v-chip v-if="item.priority" size="x-small" :color="accent" variant="outlined" prepend-icon="mdi-flag-outline" :title="t('commandCenter.fields.priority')">{{ displayValue(item.priority) }}</v-chip>
        </div>
        <button type="button" class="memory-title text-subtitle-1 font-weight-bold text-start" @click="$emit('open', item)">{{ displayValue(item.title) }}</button>
      </div>
    </div>
    <v-card-text class="pa-4 flex-grow-1">
      <div v-if="item.lifeArea" class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-3">
        <v-icon icon="mdi-compass-outline" size="16" />
        <span>{{ displayValue(item.lifeArea) }}</span>
      </div>
      <p class="memory-content text-body-2">{{ displayValue(item.content) }}</p>
      <div v-if="tags.length" class="d-flex flex-wrap ga-1 mt-4">
        <v-chip v-for="tag in tags" :key="tag" size="x-small" variant="tonal" color="secondary" class="memory-tag">#{{ tag }}</v-chip>
      </div>
    </v-card-text>
    <div v-if="item.source || item.createdAt" class="px-4 pb-3 d-flex flex-column ga-2 text-caption text-medium-emphasis">
      <div v-if="item.source" class="d-flex align-start ga-2">
        <v-icon icon="mdi-link-variant" size="16" class="mt-1" />
        <span class="memory-source"><span class="font-weight-medium">{{ t('commandCenter.fields.source') }}:</span> {{ displayValue(item.source) }}</span>
      </div>
      <div v-if="item.createdAt" class="d-flex align-center ga-2">
        <v-icon icon="mdi-calendar-outline" size="16" />
        <span>{{ t('commandCenter.fields.createdAt') }}: <command-center-cell field="createdAt" :value="item.createdAt" /></span>
      </div>
    </div>
    <v-divider />
    <v-card-actions class="px-3 py-2 ga-1">
      <v-btn :color="accent" variant="text" size="small" prepend-icon="mdi-arrow-top-right" class="text-none" @click="$emit('open', item)">{{ t('commandCenter.open') }}</v-btn>
      <v-spacer />
      <v-btn v-if="canUpdate" icon="mdi-pencil-outline" variant="text" size="small" :aria-label="t('commandCenter.edit')" :title="t('commandCenter.edit')" @click="$emit('edit', item)" />
      <v-btn v-if="canDelete" icon="mdi-delete-outline" variant="text" size="small" color="error" :aria-label="t('commandCenter.delete')" :title="t('commandCenter.delete')" @click="$emit('delete', item)" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.memory-card {
  border-top: 3px solid var(--memory-accent);
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.memory-card:hover {
  border-color: color-mix(in srgb, var(--memory-accent) 55%, transparent);
  box-shadow: 0 6px 24px rgba(var(--v-theme-on-surface), 0.08);
}
.memory-card-header {
  background: linear-gradient(135deg, color-mix(in srgb, var(--memory-accent) 12%, transparent), color-mix(in srgb, var(--memory-accent) 2%, transparent));
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
}
@media (prefers-reduced-motion: reduce) {
  .memory-card {
    transition: none;
  }
}
</style>
