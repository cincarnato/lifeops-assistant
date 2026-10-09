<script setup lang="ts">
import {computed, ref} from 'vue'
import {useDisplay} from 'vuetify'
import {useI18n} from 'vue-i18n'
import {CrudForm, useCrud, useCrudStore} from '@drax/crud-vue'
import type {IEntityCrud, IEntityCrudField, IEntityCrudOperation} from '@drax/crud-share'
import type {ITask} from '../../interfaces/ITask'
import TaskView from '../TaskView.vue'
import ServiceTransactionCrud from '../../cruds/ServiceTransactionCrud'
import CommandCenterCell from './CommandCenterCell.vue'
import ContactForm from '../ContactForm.vue'
import TaskTypeCombobox from '../../comboboxes/TaskTypeCombobox.vue'
import TaskStatusCombobox from '../../comboboxes/TaskStatusCombobox.vue'
import MemoryTypeCombobox from '../../comboboxes/MemoryTypeCombobox.vue'
import SourceCombobox from '../../comboboxes/SourceCombobox.vue'
import LifeAreaCombobox from '../../comboboxes/LifeAreaCombobox.vue'
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'
import CommandCenterRelations from './CommandCenterRelations.vue'
import CommandCenterScheduleField from './CommandCenterScheduleField.vue'
import {valueAt} from './commandCenter'
import type {CenterDestination, CenterEntity, CenterItem, CenterTab} from './commandCenter'

const props = defineProps<{entity: CenterEntity; operation: Exclude<IEntityCrudOperation, null>; item?: CenterItem; visible: CenterTab[]}>()
const emit = defineEmits<{close: []; saved: [item?: CenterItem]; navigate: [destination: CenterDestination]; openReference: [tab: CenterTab, id: string]}>()
const {t, te} = useI18n()
const {smAndDown} = useDisplay()
const expanded = ref(false)
const original = props.entity.crud
const quick = computed(() => props.operation === 'create' && ['tasks', 'memories'].includes(props.entity.key))
const storeName = `CommandCenter${original.name}`

function fields(source: IEntityCrudField[]): IEntityCrudField[] {
  return source.map(field => ({...field,
    label: te(`${original.name.toLowerCase()}.field.${field.name}`) ? t(`${original.name.toLowerCase()}.field.${field.name}`) : field.label,
    objectFields: field.objectFields ? fields(field.objectFields) : undefined,
    readonly: field.readonly || ['runtime', 'statusHistory', 'user'].includes(field.name),
  }))
}

function payload(data: Record<string, unknown>, source: IEntityCrudField[]): Record<string, unknown> {
  return Object.fromEntries(source.filter(field => !field.readonly && !['runtime', 'statusHistory'].includes(field.name) && data[field.name] !== undefined).map(field => {
    let value = data[field.name]
    if (field.type === 'ref' && value && typeof value === 'object') value = valueAt(value, '_id')
    if (field.type === 'array.ref' && Array.isArray(value)) value = value.map(entry => typeof entry === 'object' ? valueAt(entry, '_id') : entry)
    if (field.type === 'object' && value && typeof value === 'object' && field.objectFields) value = payload(value as Record<string, unknown>, field.objectFields)
    if (field.name === 'schedule' && value && typeof value === 'object') {
      const schedule = value as Record<string, unknown>
      const names: Record<string, string[]> = {once: ['runAt'], interval: ['interval'], daily: ['time'], weekly: ['time', 'daysOfWeek'], monthly: ['time', 'monthlyMode', 'daysOfMonth'], yearly: ['time', 'monthsOfYear', 'daysOfMonth'], cron: ['cronExpression']}
      value = Object.fromEntries(['type', 'timezone', ...(names[String(schedule.type)] ?? [])].filter(key => schedule[key] !== null && schedule[key] !== undefined).map(key => [key, schedule[key]]))
    }
    if (value === null && field.type === 'string' && ['priority', 'source', 'lifeArea'].includes(field.name) && props.entity.key !== 'tasks') value = ''
    return [field.name, value]
  }))
}

const provider = new Proxy(original.provider, {
  get(target, property) {
    if (property === 'create') return (data: Record<string, unknown>) => target.create!(payload(data, entity.createFields))
    if (property === 'update') return (id: string, data: Record<string, unknown>) => {
      const updated = payload(data, original.updateFields)
      const previous = payload(props.item ?? {}, original.updateFields)
      const changes = Object.fromEntries(Object.entries(updated).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key])))
      return target.updatePartial!(id, changes)
    }
    const value = Reflect.get(target, property)
    return typeof value === 'function' ? value.bind(target) : value
  },
})
const entity: IEntityCrud = new Proxy(original, {
  get(target, property) {
    if (property === 'name') return storeName
    if (property === 'i18nName') return original.name.toLowerCase()
    if (property === 'provider') return provider
    if (property === 'onInputs' && props.entity.key === 'serviceTransactions') return ServiceTransactionCrud.instance.onInputsForStore(store)
    if (['fields', 'createFields', 'updateFields', 'viewFields', 'deleteFields'].includes(String(property))) {
      let selected = Reflect.get(target, property) as IEntityCrudField[]
      if (property === 'createFields' && quick.value && !expanded.value) {
        selected = selected.filter(field => (props.entity.key === 'tasks' ? ['title'] : ['title', 'content', 'type']).includes(field.name))
      }
      return fields(selected)
    }
    return Reflect.get(target, property, target)
  },
})
const store = useCrudStore(storeName)
store.$reset()
const crud = useCrud(entity)
if (props.operation === 'create') crud.onCreate()
else if (props.operation === 'edit' && props.item) crud.onEdit(props.item)
else if (props.operation === 'delete' && props.item) crud.onDelete(props.item)
else if (props.item) crud.onView(props.item)

const dialog = computed({get: () => store.dialog, set: value => {
  store.setDialog(value)
  if (!value) emit('close')
}})
const readonly = computed(() => ['view', 'delete'].includes(props.operation))
const serviceFields = computed(() => ['services', 'serviceTransactions'].includes(props.entity.key)
  ? entity.fields.filter(field => field.type === 'enum' || field.name === 'paidAt') : [])
const catalogSlots = computed(() => {
  if (['services', 'serviceTransactions'].includes(props.entity.key)) return []
  const components = {type: props.entity.key === 'memories' ? MemoryTypeCombobox : TaskTypeCombobox, status: TaskStatusCombobox, source: SourceCombobox, priority: PriorityCombobox, lifeArea: LifeAreaCombobox}
  return Object.entries(components).flatMap(([name, component]) => [
    {name: `field.${name}`, component}, {name: `field.task.${name}`, component},
  ])
})
function serviceRules(name: string) {
  return entity.getRule(name)?.map(rule => (value: unknown) => {
    const result = rule(value) as boolean | string
    return typeof result === 'string' && te(result) ? t(result) : result
  })
}
const title = computed(() => t(`operation.${props.operation}`, {entity: t(`${original.name.toLowerCase()}.entity`)}))
function saved(item?: CenterItem) {emit('saved', item)}
</script>

<template>
  <v-dialog v-model="dialog" :fullscreen="smAndDown" max-width="1000" :persistent="store.loading" :z-index="entity.dialogZindex">
    <v-card>
      <v-toolbar density="compact">
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-btn icon="mdi-close" :disabled="store.loading" :aria-label="t('commandCenter.close')" @click="dialog = false" />
      </v-toolbar>
      <v-card-text>
        <command-center-relations v-if="item && operation === 'view'" class="mb-3" :tab="props.entity.key" :item="item" :visible="visible" @navigate="$emit('navigate', $event)" @open-reference="(tab, id) => $emit('openReference', tab, id)" />
        <v-alert v-if="operation === 'delete'" type="warning" variant="tonal" class="mb-3" :text="t('commandCenter.confirmDelete')" />
        <v-btn v-if="quick" variant="text" size="small" :append-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="expanded = !expanded">{{ t('commandCenter.moreFields') }}</v-btn>
        <template v-if="operation === 'view' && props.entity.key === 'tasks'">
          <task-view :item="item as unknown as ITask" />
          <v-btn class="mt-3" variant="text" @click="dialog = false">{{ t('commandCenter.close') }}</v-btn>
        </template>
        <template v-else-if="operation === 'view' && props.entity.key === 'memories'">
          <h2 class="text-h6 mb-2">{{ item?.title }}</h2>
          <div class="memory-content">{{ item?.content }}</div>
          <v-chip v-if="item?.type" class="mt-3" size="small">{{ item.type }}</v-chip>
          <v-btn class="mt-3" variant="text" @click="dialog = false">{{ t('commandCenter.close') }}</v-btn>
        </template>
        <contact-form v-else-if="props.entity.key === 'contacts'" :entity="entity" :item="store.form" :operation="operation" @saved="saved" @canceled="dialog = false" />
        <crud-form v-else :entity="entity" @created="saved" @updated="saved" @deleted="saved()" @canceled="dialog = false" @viewed="dialog = false">
          <template v-for="entry in serviceFields" :key="entry.name" #[`field.${entry.name}`]="{field, modelValue, setValue}">
            <div v-if="field.name === 'paidAt'" class="mb-4">
              <div class="text-caption text-medium-emphasis">{{ field.label }}</div>
              <command-center-cell :field="field.name" :value="modelValue" :tab="props.entity.key" />
            </div>
            <v-select v-else :model-value="modelValue" :items="field.enum?.map(value => ({title: t(`${original.name.toLowerCase()}.${field.name}.${value}`), value}))" :label="field.label" :readonly="readonly" :rules="serviceRules(field.name)" :error-messages="store.getFieldInputErrors(field.name)" variant="outlined" @update:model-value="setValue" />
          </template>
          <template #field.schedule="{field, modelValue, setValue}">
            <command-center-schedule-field :entity="entity" :field="field" :model-value="modelValue" :readonly="readonly" @update:model-value="setValue" />
          </template>
          <template v-for="slot in catalogSlots" :key="slot.name" #[slot.name]="{field, modelValue, setValue}">
            <component :is="slot.component" :model-value="modelValue" :label="field.label" :name="field.name" item-title="name" item-value="name" :readonly="readonly" :rules="entity.getRule(field.name)" :error-messages="store.getFieldInputErrors(field.name)" variant="outlined" @update:model-value="setValue" />
          </template>
        </crud-form>
        <v-alert v-if="operation === 'view' && props.entity.key === 'jobs'" variant="tonal" type="info" class="mt-3" :text="t('commandCenter.executionsPending')" />
        <div v-if="operation === 'view' && ['jobs', 'schedules'].includes(props.entity.key)" class="text-body-2 mt-3">
          <div v-for="field in ['lastRunAt', 'nextRunAt', 'lastStatus', 'lastError']" :key="field">{{ t(`commandCenter.runtime.${field}`) }}: {{ valueAt(item, `runtime.${field}`) || '—' }}</div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.memory-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
