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
  <v-container fluid class="cc-page">
    <header class="cc-page-header">
      <div class="cc-page-heading">

        <h1>{{ t('commandCenter.title') }}</h1>
        <div class="cc-date d-flex align-center flex-wrap ga-2 mt-2">
          <span>{{ dateLabel }}</span>
          <span v-if="refreshedAt" class="cc-updated">{{ t('commandCenter.updatedAt', {time: refreshedAt.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}) }}</span>
        </div>
      </div>
      <div class="cc-header-tools">
        <v-btn variant="text" prepend-icon="mdi-refresh" size="small" :loading="refreshing" @click="center.refresh">{{ t('commandCenter.refresh') }}</v-btn>
        <command-center-actions :entities="center.entities.filter(entity => can(entity.key, 'create'))" @create="open($event, 'create')" />
      </div>
    </header>
    <command-center-metrics :metrics="metrics.filter(center.canMetric)" @navigate="navigate" @retry="center.loadMetrics" />
    <v-progress-linear v-if="opening" indeterminate color="primary" class="mb-2" :aria-label="t('commandCenter.loading')" />
    <div class="cc-content-layout" :class="{'cc-content-layout--with-focus': visibleTabs.some(tab => ['tasks', 'memories', 'schedules', 'jobs'].includes(tab))}">
      <aside v-if="visibleTabs.some(tab => ['tasks', 'memories', 'schedules', 'jobs'].includes(tab))" class="cc-focus-panel" :aria-label="t('commandCenter.design.focus')">
        <command-center-attention :memory="memory" :attention="attention" :automation="automation" :visible="visibleTabs" @open="(tab, item) => open(tab, 'view', item)" @another="center.anotherMemory" @retry-task="center.loadAttention" @retry-automation="center.loadAutomation" />
      </aside>
      <div class="cc-workspace-frame">
        <command-center-workspace v-if="visibleEntities.length" :tab="activeTab" :entities="visibleEntities" :entity="activeEntity" :state="state" :colors="colors" :can-create="can(activeTab, 'create')" :can-update="can(activeTab, 'update')" :can-delete="can(activeTab, 'delete')" :busy-id="busyId" @update:tab="center.selectTab" @changed="center.changed('tasks')" @load="center.load()" @create="open(activeTab, 'create')" @open="open(activeTab, 'view', $event)" @edit="open(activeTab, 'edit', $event)" @delete="open(activeTab, 'delete', $event)" @toggle="toggle" @navigate="navigate" @open-reference="(tab, id) => open(tab, 'view', undefined, id)" />
        <v-alert v-else type="info" variant="tonal" :text="t('commandCenter.noPermissions')" />
      </div>
    </div>
    <command-center-dialog v-if="dialog" :key="dialog.key" :entity="dialog.entity" :operation="dialog.operation" :item="dialog.item" :visible="visibleTabs" @close="dialog = undefined" @saved="saved" @navigate="navigate" @open-reference="(tab, id) => open(tab, 'view', undefined, id)" />
    <v-snackbar :model-value="!!snackbar" timeout="4000" @update:model-value="snackbar = ''">{{ snackbar }}</v-snackbar>
  </v-container>
</template>

<style scoped>
.cc-page {
  --cc-border: rgba(var(--v-theme-on-surface), 0.1);
  --cc-muted: rgba(var(--v-theme-on-surface), 0.64);
  --cc-soft: rgba(var(--v-theme-on-surface), 0.025);
  container-type: inline-size;
  max-width: 1680px;
  padding: 20px 32px 32px;
  color: rgb(var(--v-theme-on-surface));
}
.cc-content-layout {
  display: grid;
  gap: 16px;
}
.cc-workspace-frame {
  min-width: 0;
  container-type: inline-size;
}
.cc-focus-panel {
  min-width: 0;
}
@container (min-width: 1200px) {
  .cc-content-layout--with-focus {
    grid-template-columns: minmax(0, 1fr) 280px;
    align-items: start;
  }
  .cc-workspace-frame {
    grid-column: 1;
    grid-row: 1;
  }
  .cc-focus-panel {
    grid-column: 2;
    grid-row: 1;
  }
}
.cc-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--cc-border);
}
.cc-page-heading {
  min-width: 0;
}

.cc-page-heading h1 {
  font-size: clamp(1.65rem, 2.6vw, 2.2rem);
  font-weight: 650;
  line-height: 1.15;
  letter-spacing: -0.045em;
  overflow-wrap: anywhere;
}
.cc-date, .cc-updated {
  color: var(--cc-muted);
  font-size: 0.75rem;
  line-height: 1.6;
}
.cc-updated {
  padding-inline-start: 10px;
  border-inline-start: 1px solid var(--cc-border);
}
.cc-header-tools {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}
.cc-page :deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
.cc-page :deep(.v-field) {
  font-size: 0.8125rem;
  border-radius: 10px;
}
.cc-page :deep(.v-field:not(.v-field--focused) .v-field__outline) {
  --v-field-border-opacity: 0.15;
}
.cc-page :deep(.v-btn:focus-visible) {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
@media (max-width: 959px) {
  .cc-page {
    padding: 20px 16px 28px;
  }
  .cc-page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 18px;
    padding-bottom: 18px;
  }
  .cc-header-tools {
    width: 100%;
    justify-content: flex-start;
  }
}
@media (max-width: 599px) {
  .cc-page {
    padding: 16px 12px 24px;
  }

}
</style>
