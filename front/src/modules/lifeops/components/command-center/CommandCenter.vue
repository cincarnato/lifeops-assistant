<script setup lang="ts">
import {computed, onMounted, ref, shallowRef} from 'vue'
import {useI18n} from 'vue-i18n'
import {useAuth} from '@drax/identity-vue'
import TaskStatusProvider from '../../providers/TaskStatusProvider'
import PriorityProvider from '../../providers/PriorityProvider'
import TaskScheduleProvider from '../../providers/TaskScheduleProvider'
import CommandCenterMetrics from './CommandCenterMetrics.vue'
import CommandCenterActions from './CommandCenterActions.vue'
import CommandCenterAttention from './CommandCenterAttention.vue'
import CommandCenterWorkspace from './CommandCenterWorkspace.vue'
import CommandCenterDialog from './CommandCenterDialog.vue'
import {useCommandCenter} from './useCommandCenter'
import type {CenterDestination, CenterEntity, CenterItem, CenterTab} from './commandCenter'

const {t, locale} = useI18n()
const {hasPermission} = useAuth()
const center = useCommandCenter()
const {visibleEntities, activeTab, activeEntity, state, can, metrics, memory, attention, automation, refreshing, refreshedAt} = center
const visibleTabs = computed(() => visibleEntities.value.map(entity => entity.key))
const dialog = shallowRef<{entity: CenterEntity; operation: 'create' | 'view' | 'edit' | 'delete'; item?: CenterItem; key: number}>()
const colors = ref<Record<string, Record<string, string>>>({})
const busyId = ref<string>()
const opening = ref(false)
const snackbar = ref('')
let dialogKey = 0
const dateLabel = computed(() => new Intl.DateTimeFormat(locale.value, {timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full'}).format(refreshedAt.value ?? new Date()))

async function open(tab: CenterTab, operation: 'create' | 'view' | 'edit' | 'delete', item?: CenterItem, id?: string) {
  const permission = operation === 'edit' ? 'update' : operation === 'view' ? 'view' : operation
  if (!can(tab, permission) || opening.value) return
  const entity = center.entities.find(entry => entry.key === tab)!
  opening.value = true
  try {
    const record = id || item?._id ? await entity.crud.provider.findById!(id || item!._id) : undefined
    dialog.value = {entity, operation, item: record, key: ++dialogKey}
  } catch {
    snackbar.value = t('commandCenter.openError')
  } finally {
    opening.value = false
  }
}

function navigate(destination: CenterDestination) {
  dialog.value = undefined
  center.navigate(destination)
}

async function saved(item?: CenterItem) {
  const tab = dialog.value?.entity.key
  if (tab === 'memories' && dialog.value?.operation === 'delete' && memory.item?._id === dialog.value.item?._id) memory.item = null
  dialog.value = undefined
  snackbar.value = t('commandCenter.saved')
  if (tab) await center.changed(tab, item)
  if (tab === 'memories' && !memory.item) await center.anotherMemory()
}

async function toggle(item: CenterItem) {
  const tab = activeTab.value
  if (!can(tab, 'update') || busyId.value) return
  busyId.value = item._id
  try {
    if (tab === 'schedules') await TaskScheduleProvider.instance.setActive(item._id, !item.active)
    else await activeEntity.value.crud.provider.updatePartial!(item._id, {active: !item.active})
    await center.changed(tab)
    snackbar.value = t('commandCenter.saved')
  } catch {
    snackbar.value = t('commandCenter.saveError')
  } finally {
    busyId.value = undefined
  }
}

onMounted(async () => {
  await Promise.allSettled([
    center.refresh(), center.anotherMemory(),
    ...[{field: 'status', provider: TaskStatusProvider.instance, permission: 'taskstatus:view'}, {field: 'priority', provider: PriorityProvider.instance, permission: 'priority:view'}].map(async catalog => {
      if (!hasPermission(catalog.permission)) return
      const values = await catalog.provider.find({limit: 100})
      colors.value[catalog.field] = Object.fromEntries(values.map(value => [value.name, value.color || '']))
    }),
  ])
})
</script>

<template>
  <v-container fluid class="pa-3 pa-md-4">
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <div>
        <h1 class="text-h5 font-weight-bold">{{ t('commandCenter.title') }}</h1>
        <div class="text-caption text-medium-emphasis">{{ dateLabel }} · {{ t('commandCenter.timezone') }}</div>
      </div>
      <v-spacer />
      <span v-if="refreshedAt" class="text-caption text-medium-emphasis">{{ t('commandCenter.updatedAt', {time: refreshedAt.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}) }}</span>
      <v-btn variant="text" prepend-icon="mdi-refresh" size="small" :loading="refreshing" @click="center.refresh">{{ t('commandCenter.refresh') }}</v-btn>
    </div>
    <command-center-metrics :metrics="metrics.filter(metric => can(metric.tab, 'view'))" @navigate="navigate" @retry="center.loadMetrics" />
    <command-center-actions :entities="center.entities.filter(entity => can(entity.key, 'create'))" @create="open($event, 'create')" />
    <command-center-attention :memory="memory" :attention="attention" :automation="automation" :visible="visibleTabs" @open="(tab, item) => open(tab, 'view', item)" @another="center.anotherMemory" @retry-task="center.loadAttention" @retry-automation="center.loadAutomation" />
    <v-progress-linear v-if="opening" indeterminate color="primary" class="mb-2" />
    <command-center-workspace v-if="visibleEntities.length" :tab="activeTab" :entities="visibleEntities" :entity="activeEntity" :state="state" :colors="colors" :can-create="can(activeTab, 'create')" :can-update="can(activeTab, 'update')" :can-delete="can(activeTab, 'delete')" :busy-id="busyId" @update:tab="center.selectTab" @load="center.load()" @create="open(activeTab, 'create')" @open="open(activeTab, 'view', $event)" @edit="open(activeTab, 'edit', $event)" @delete="open(activeTab, 'delete', $event)" @toggle="toggle" @navigate="navigate" @open-reference="(tab, id) => open(tab, 'view', undefined, id)" />
    <v-alert v-else type="info" variant="tonal" :text="t('commandCenter.noPermissions')" />
    <command-center-dialog v-if="dialog" :key="dialog.key" :entity="dialog.entity" :operation="dialog.operation" :item="dialog.item" :visible="visibleTabs" @close="dialog = undefined" @saved="saved" @navigate="navigate" @open-reference="(tab, id) => open(tab, 'view', undefined, id)" />
    <v-snackbar :model-value="!!snackbar" timeout="4000" @update:model-value="snackbar = ''">{{ snackbar }}</v-snackbar>
  </v-container>
</template>
