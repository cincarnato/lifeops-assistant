<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useDisplay} from 'vuetify'
import CommandCenterCell from './CommandCenterCell.vue'
import CommandCenterMemoryCard from './CommandCenterMemoryCard.vue'
import CommandCenterRelations from './CommandCenterRelations.vue'
import {centerWorkspaceTabs, valueAt} from './commandCenter'
import type {CenterDestination, CenterEntity, CenterItem, CenterTab} from './commandCenter'
import type {useCommandCenter} from './useCommandCenter'
import MemoryTypeCombobox from '../../comboboxes/MemoryTypeCombobox.vue'
import LifeAreaCombobox from '../../comboboxes/LifeAreaCombobox.vue'

const props = defineProps<{
  entities: CenterEntity[]
  entity: CenterEntity
  state: ReturnType<typeof useCommandCenter>['state']['value']
  colors: Record<string, Record<string, string>>
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  busyId?: string
}>()
const tab = defineModel<CenterTab>('tab', {required: true})
const emit = defineEmits<{
  load: []; create: []; open: [item: CenterItem]; edit: [item: CenterItem]; delete: [item: CenterItem]
  toggle: [item: CenterItem]; navigate: [destination: CenterDestination]; openReference: [tab: CenterTab, id: string]
}>()
const {t, te} = useI18n()
const {smAndDown} = useDisplay()
const visible = computed(() => props.entities.map(entity => entity.key))
const serviceViews = computed(() => props.entities.filter(entity => ['services', 'serviceTransactions'].includes(entity.key)))
const workspaceTabs = computed(() => centerWorkspaceTabs(props.entities))
const mainTab = computed(() => ['services', 'serviceTransactions'].includes(tab.value) ? 'services' : tab.value)
const presets = computed(() => props.entity.key === 'tasks' ? ['today', 'overdue', 'urgent', 'unassigned']
  : props.entity.key === 'services' ? ['active', 'inactive']
  : props.entity.key === 'serviceTransactions' ? ['pending', 'paid']
  : ['schedules', 'jobs'].includes(props.entity.key) ? ['active', ...(props.entity.key === 'jobs' ? ['failed'] : [])] : [])
const headers = computed(() => [...props.entity.columns.map(key => ({key, title: fieldLabel(key), sortable: key !== 'schedule' && key !== 'content'})), {key: 'actions', title: t('commandCenter.actions'), sortable: false}])

function fieldLabel(key: string) {
  const entityKey = `${props.entity.crud.name.toLowerCase()}.field.${key}`
  if (['services', 'serviceTransactions'].includes(props.entity.key) && te(entityKey)) return t(entityKey)
  return te(`commandCenter.fields.${key}`) ? t(`commandCenter.fields.${key}`) : te(entityKey) ? t(entityKey) : key
}

function sort(sortBy: {key: string; order?: string}[]) {
  props.state.sortKey = sortBy[0]?.key ?? props.entity.columns[0]!
  props.state.sortOrder = sortBy[0]?.order === 'desc' ? 'desc' : 'asc'
  emit('load')
}

function preset(value: string) {
  emit('navigate', {tab: props.entity.key, preset: props.state.preset === value ? '' : value, context: props.state.context})
}

function page(value: number) {
  props.state.page = value
  emit('load')
}
</script>

<template>
  <v-card variant="flat" border>
    <v-tabs :model-value="mainTab" color="primary" density="compact" show-arrows @update:model-value="tab = workspaceTabs.find(entry => entry.key === $event)!.tab">
      <v-tab v-for="entry in workspaceTabs" :key="entry.key" :value="entry.key" class="text-none" :prepend-icon="entry.icon">{{ t(`commandCenter.tabs.${entry.key}`) }}</v-tab>
    </v-tabs>
    <v-divider />
    <v-tabs v-if="mainTab === 'services'" :model-value="tab" color="primary" density="compact" show-arrows @update:model-value="tab = $event as CenterTab">
      <v-tab v-for="entry in serviceViews" :key="entry.key" :value="entry.key" class="text-none" :prepend-icon="entry.icon">{{ t(`commandCenter.tabs.${entry.key}`) }}</v-tab>
    </v-tabs>
    <div class="pa-3">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="5">
          <v-text-field v-model="state.search" :label="t('commandCenter.search')" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details clearable @update:model-value="state.search = $event ?? ''" />
        </v-col>
        <v-col cols="12" sm="6" md="7" class="d-flex align-center flex-wrap ga-2">
          <v-chip v-for="value in presets" :key="value" :color="state.preset === value ? 'primary' : undefined" :variant="state.preset === value ? 'tonal' : 'outlined'" size="small" @click="preset(value)">{{ t(`commandCenter.presets.${entity.key === 'services' ? `services_${value}` : value}`) }}</v-chip>
          <v-spacer />
          <v-btn v-if="canCreate" size="small" variant="tonal" prepend-icon="mdi-plus" @click="$emit('create')">{{ t('commandCenter.add') }}</v-btn>
          <v-btn icon="mdi-refresh" size="small" variant="text" :loading="state.loading" :aria-label="t('commandCenter.refresh')" @click="$emit('load')" />
        </v-col>
      </v-row>
      <v-chip v-if="state.context" class="mt-2" size="small" color="primary" closable @click:close="$emit('navigate', {tab: entity.key, preset: state.preset})">{{ state.context.label }}</v-chip>
      <v-row v-if="entity.key === 'memories'" dense class="mt-2">
        <v-col cols="12" sm="4"><memory-type-combobox v-model="state.memoryType" :label="t('commandCenter.fields.type')" item-value="name" density="compact" variant="outlined" hide-details /></v-col>
        <v-col cols="12" sm="4"><life-area-combobox v-model="state.memoryArea" :label="t('commandCenter.fields.lifeArea')" item-value="name" density="compact" variant="outlined" hide-details /></v-col>
        <v-col cols="12" sm="4"><v-text-field v-model="state.memoryTag" :label="t('commandCenter.fields.tags')" density="compact" variant="outlined" hide-details clearable /></v-col>
      </v-row>
    </div>
    <v-alert v-if="state.error" type="error" variant="tonal" class="mx-3 mb-3" :text="t('commandCenter.loadError')">
      <template #append><v-btn size="small" variant="text" @click="$emit('load')">{{ t('commandCenter.retry') }}</v-btn></template>
    </v-alert>
    <template v-else>
      <div v-if="entity.key === 'memories'" class="px-3 pb-3">
        <div class="d-flex align-center ga-2 mb-3">
          <v-select :model-value="state.sortKey" :items="headers.filter(header => header.sortable)" item-title="title" item-value="key" :label="t('commandCenter.sortBy')" density="compact" variant="outlined" hide-details style="max-width: 240px" @update:model-value="sort([{key: $event, order: state.sortOrder}])" />
          <v-btn :icon="state.sortOrder === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'" variant="tonal" size="small" :aria-label="t(state.sortOrder === 'asc' ? 'commandCenter.sortDescending' : 'commandCenter.sortAscending')" @click="sort([{key: state.sortKey, order: state.sortOrder === 'asc' ? 'desc' : 'asc'}])" />
        </div>
        <v-row v-if="state.loading" dense :aria-label="t('commandCenter.loading')" aria-busy="true">
          <v-col v-for="index in 3" :key="index" cols="12" md="6" xl="4"><v-skeleton-loader type="article, actions" /></v-col>
        </v-row>
        <div v-else-if="!state.items.length" class="text-center text-medium-emphasis py-8">
          <v-icon icon="mdi-brain" size="48" color="primary" class="mb-3" />
          <p>{{ t('commandCenter.empty') }}</p>
        </div>
        <v-row v-else dense>
          <v-col v-for="item in state.items" :key="item._id" cols="12" sm="6" md="4" xl="3" class="pa-2">
            <command-center-memory-card :item="item" :colors="colors" :can-update="canUpdate" :can-delete="canDelete" @open="$emit('open', $event)" @edit="$emit('edit', $event)" @delete="$emit('delete', $event)" />
          </v-col>
        </v-row>
      </div>
      <v-data-table-server v-else-if="!smAndDown" :headers="headers" :items="state.items" :items-length="state.total" :loading="state.loading" :items-per-page="10" :page="state.page" :sort-by="[{key: state.sortKey, order: state.sortOrder}]" density="compact" hover hide-default-footer :no-data-text="t('commandCenter.empty')" :loading-text="t('commandCenter.loading')" @update:sort-by="sort">
        <template v-for="field in entity.columns" :key="field" #[`item.${field}`]="{item}">
          <v-btn v-if="field === entity.columns[0]" class="text-none justify-start text-wrap px-0" variant="text" size="small" @click="$emit('open', item)"><command-center-cell :field="field" :value="valueAt(item, field)" :tab="entity.key" :colors="colors[field]" /></v-btn>
          <command-center-cell v-else :field="field" :value="valueAt(item, field)" :tab="entity.key" :colors="colors[field]" />
        </template>
        <template #item.actions="{item}">
          <div class="d-flex align-center ga-1">
            <v-btn icon="mdi-eye-outline" variant="text" size="x-small" :aria-label="t('commandCenter.open')" @click="$emit('open', item)" />
            <v-btn v-if="canUpdate" icon="mdi-pencil-outline" variant="text" size="x-small" :aria-label="t('commandCenter.edit')" @click="$emit('edit', item)" />
            <v-btn v-if="canUpdate && ['schedules', 'jobs'].includes(entity.key)" :icon="item.active ? 'mdi-pause' : 'mdi-play'" variant="text" size="x-small" :loading="busyId === item._id" :disabled="!!busyId" :aria-label="t(item.active ? 'commandCenter.pause' : 'commandCenter.activate')" @click="$emit('toggle', item)" />
            <v-btn v-if="canDelete" icon="mdi-delete-outline" variant="text" size="x-small" :aria-label="t('commandCenter.delete')" @click="$emit('delete', item)" />
          </div>
          <command-center-relations :tab="entity.key" :item="item" :visible="visible" @navigate="$emit('navigate', $event)" @open-reference="(target, id) => $emit('openReference', target, id)" />
        </template>
      </v-data-table-server>
      <div v-else class="px-3">
        <v-skeleton-loader v-if="state.loading" type="list-item-two-line@3" />
        <div v-else-if="!state.items.length" class="text-center text-medium-emphasis py-8">{{ t('commandCenter.empty') }}</div>
        <v-card v-for="item in state.items" v-else :key="item._id" variant="outlined" class="mb-2">
          <v-card-text class="pa-3">
            <v-btn class="text-none text-wrap justify-start px-0" variant="text" @click="$emit('open', item)"><command-center-cell :field="entity.columns[0]!" :value="valueAt(item, entity.columns[0]!)" :tab="entity.key" /></v-btn>
            <div v-for="field in entity.columns.slice(1)" :key="field" class="text-caption mb-1"><span class="text-medium-emphasis mr-2">{{ fieldLabel(field) }}:</span><command-center-cell :value="valueAt(item, field)" :field="field" :tab="entity.key" :colors="colors[field]" /></div>
            <command-center-relations :tab="entity.key" :item="item" :visible="visible" @navigate="$emit('navigate', $event)" @open-reference="(target, id) => $emit('openReference', target, id)" />
            <div class="d-flex ga-2 mt-1">
              <v-btn v-if="canUpdate" size="small" variant="text" prepend-icon="mdi-pencil-outline" @click="$emit('edit', item)">{{ t('commandCenter.edit') }}</v-btn>
              <v-btn v-if="canUpdate && ['schedules', 'jobs'].includes(entity.key)" size="small" variant="text" :loading="busyId === item._id" :disabled="!!busyId" @click="$emit('toggle', item)">{{ t(item.active ? 'commandCenter.pause' : 'commandCenter.activate') }}</v-btn>
              <v-btn v-if="canDelete" size="small" variant="text" :aria-label="t('commandCenter.delete')" icon="mdi-delete-outline" @click="$emit('delete', item)" />
            </div>
          </v-card-text>
        </v-card>
      </div>
      <div class="d-flex align-center justify-space-between flex-wrap px-3 py-2 ga-2" aria-live="polite">
        <span class="text-caption text-medium-emphasis">{{ t('commandCenter.results', {count: state.total}) }}</span>
        <v-pagination v-if="state.total > 10" :model-value="state.page" :length="Math.ceil(state.total / 10)" :total-visible="smAndDown ? 3 : 5" density="compact" size="small" @update:model-value="page" />
      </div>
    </template>
  </v-card>
</template>
