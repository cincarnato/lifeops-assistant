<script setup lang="ts">
import {computed, nextTick, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {VForm} from 'vuetify/components'
import type {SubmitEventPromise} from 'vuetify'
import {useAuth} from '@drax/identity-vue'
import {useCrud, useCrudStore} from '@drax/crud-vue'
import type {IEntityCrud, IEntityCrudField} from '@drax/crud-share'
import TaskCrud from '../cruds/TaskCrud'
import TaskFormField from './TaskFormField.vue'

const props = defineProps<{entity?: IEntityCrud}>()
const emit = defineEmits<{
  created: [item?: Record<string, unknown>]
  updated: [item?: Record<string, unknown>]
  deleted: []
  viewed: []
  canceled: []
}>()
const entity = props.entity ?? TaskCrud.instance
const {t, te} = useI18n()
const {hasPermission} = useAuth()
const {form, operation, onSubmit, onCancel, error, loading} = useCrud(entity)
const store = useCrudStore(entity.name)
const formRef = ref<InstanceType<typeof VForm>>()
const body = ref<HTMLElement>()
const tab = ref('detail')
const submitting = ref(false)
const invalid = ref(false)
const readonly = computed(() => operation.value === 'view' || operation.value === 'delete')
const fields = computed(() => {
  if (operation.value === 'create') return entity.createFields
  if (operation.value === 'edit') return entity.updateFields
  if (operation.value === 'delete') return entity.deleteFields
  return entity.viewFields
})
const fieldMap = computed(() => new Map(fields.value
  .filter(field => !field.permission || hasPermission(field.permission))
  .map(field => [field.name, field])))
function selected(names: string[]) {
  return names.flatMap(name => {
    const field = fieldMap.value.get(name)
    return field ? [field] : []
  })
}
const primary = computed(() => selected(['title', 'status', 'importance', 'urgent']))
const context = computed(() => selected(['project', 'goals']))
const tabs = [
  {value: 'detail', icon: 'mdi-text-box-outline', sections: [
    {key: 'description', icon: 'mdi-text', fields: ['description']},
    {key: 'notes', icon: 'mdi-note-text-outline', fields: ['notes']},
  ]},
  {value: 'classification', icon: 'mdi-tag-multiple-outline', sections: [
    {key: 'classification', icon: 'mdi-shape-outline', fields: ['type', 'lifeArea', 'source', 'tags']},
    {key: 'evaluation', icon: 'mdi-tune-vertical', fields: ['priority', 'valueScore', 'motivationScore', 'effortScore']},
  ]},
  {value: 'schedule', icon: 'mdi-calendar-clock-outline', sections: [
    {key: 'planning', icon: 'mdi-calendar-outline', fields: ['scheduledDate', 'dueDate']},
    {key: 'tracking', icon: 'mdi-history', fields: ['completedAt', 'archivedAt', 'createdAt', 'updatedAt', 'statusHistory']},
  ]},
  {value: 'execution', icon: 'mdi-account-arrow-right-outline', sections: [
    {key: 'delegation', icon: 'mdi-account-multiple-outline', fields: ['delegable', 'delegate']},
    {key: 'instruction', icon: 'mdi-script-text-outline', fields: ['instruction']},
  ]},
  {value: 'integrations', icon: 'mdi-link-variant', sections: [
    {key: 'integrations', icon: 'mdi-cloud-outline', fields: ['redmineIssueId', 'emailMessageId', 'calendarEventId']},
  ]},
]
const visibleTabs = computed(() => tabs.map(item => ({...item,
  sections: item.sections.map(section => ({...section, fields: selected(section.fields)}))
    .filter(section => section.fields.length),
})).filter(item => item.sections.length))

function columns(field: IEntityCrudField) {
  if (['description', 'notes', 'tags', 'instruction', 'statusHistory'].includes(field.name)) return 12
  if (['valueScore', 'motivationScore', 'effortScore'].includes(field.name)) return 4
  if (['type', 'lifeArea', 'source'].includes(field.name)) return 12
  if (field.name === 'priority') return 12
  if (['redmineIssueId', 'emailMessageId', 'calendarEventId'].includes(field.name)) return 4
  return 6
}
function hasErrors(names: string[]) {
  return names.some(name => store.getFieldInputErrors(name).length > 0)
}
async function showErrors() {
  await nextTick()
  const element = body.value?.querySelector<HTMLElement>('.v-input--error')
  const panel = element?.closest<HTMLElement>('[data-task-tab]')
  if (panel?.dataset.taskTab) tab.value = panel.dataset.taskTab
  await nextTick()
  element?.scrollIntoView({block: 'center', behavior: 'smooth'})
}
async function submit(event: SubmitEventPromise) {
  if (loading.value || submitting.value) return
  submitting.value = true
  try {
    store.resetErrors()
    invalid.value = false
    if (!readonly.value) {
      // VForm already validates on native submit; await that pass instead of running it twice.
      const result = await event
      if (!result.valid) {
        invalid.value = true
        await showErrors()
        return
      }
    }
    const result = await onSubmit(form.value)
    if (result.status === 'created') emit('created', result.item)
    else if (result.status === 'updated') emit('updated', result.item)
    else if (result.status === 'deleted') emit('deleted')
    else if (result.status === 'viewed') emit('viewed')
    else await showErrors()
  } finally {
    submitting.value = false
  }
}
function cancel() {
  onCancel()
  emit('canceled')
}
</script>

<template>
  <v-form ref="formRef" class="task-form" @submit.prevent="submit">
    <div ref="body" class="task-form__body">
      <v-alert v-if="operation === 'delete'" type="warning" variant="tonal" class="mb-4" :text="t('task.form.deleteWarning')" />
      <v-alert v-if="error || invalid" type="error" variant="tonal" class="mb-4" role="alert">
        {{ error ? (te(error) ? t(error) : error) : t('task.form.validationError') }}
      </v-alert>

      <v-card class="task-form__hero mb-4" variant="outlined" rounded="xl">
        <v-card-text>
          <div class="d-flex align-center ga-3 mb-5">
            <v-avatar color="primary" variant="tonal" rounded="lg" size="42">
              <v-icon icon="mdi-checkbox-marked-circle-outline" size="26" />
            </v-avatar>
            <div>
              <h2 class="text-subtitle-1 font-weight-bold">{{ t(`task.form.operation.${operation ?? 'view'}`) }}</h2>
              <p class="text-caption text-medium-emphasis">{{ t('task.form.focusHint') }}</p>
            </div>
          </div>
          <v-row dense align="center">
            <v-col v-for="field in primary" :key="field.name" cols="12"
                   :sm="field.name === 'title' ? 12 : field.name === 'urgent' ? 4 : 8"
                   :md="field.name === 'title' ? 8 : field.name === 'status' ? 4 : field.name === 'importance' ? 8 : 4"
                   :class="{'task-form__title': field.name === 'title', 'task-form__urgent': field.name === 'urgent'}">
              <task-form-field :entity="entity" :field="field" :form="form" :readonly="readonly" />
            </v-col>
          </v-row>
          <v-divider class="my-4" />
          <div class="d-flex align-center ga-2 text-caption text-medium-emphasis mb-3">
            <v-icon icon="mdi-folder-outline" size="18" />
            {{ t('task.form.context') }}
          </div>
          <v-row dense>
            <v-col v-for="field in context" :key="field.name" cols="12" sm="6">
              <task-form-field :entity="entity" :field="field" :form="form" :readonly="readonly" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-tabs v-model="tab" class="task-form__tabs mb-4" grow show-arrows hide-slider height="52">
        <v-tab v-for="item in visibleTabs" :key="item.value" :value="item.value" :prepend-icon="item.icon">
          {{ t(`task.form.tabs.${item.value}`) }}
          <v-icon v-if="hasErrors(item.sections.flatMap(section => section.fields.map(field => field.name)))"
                  icon="mdi-alert-circle" color="error" size="16" class="ml-2" />
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item v-for="item in visibleTabs" :key="item.value" :value="item.value" eager :data-task-tab="item.value">
          <v-row>
            <v-col v-for="section in item.sections" :key="section.key" cols="12"
                   :lg="['description', 'notes', 'classification', 'evaluation', 'delegation', 'instruction'].includes(section.key) ? 6 : 12">
              <v-card v-if="section.key !== 'notes'" class="task-form__section" variant="outlined" rounded="lg" height="100%">
                <v-card-title class="task-form__section-title">
                  <v-icon :icon="section.icon" color="primary" />
                  <div>
                    <h3 class="text-subtitle-2 font-weight-bold">{{ t(`task.form.sections.${section.key}`) }}</h3>
                    <p class="text-caption text-medium-emphasis font-weight-regular">{{ t(`task.form.hints.${section.key}`) }}</p>
                  </div>
                </v-card-title>
                <v-divider />
                <v-card-text>
                  <v-row dense>
                    <template v-for="field in section.fields" :key="field.name">
                      <v-col v-if="field.name !== 'delegate' || form.delegable" cols="12" :sm="columns(field)">
                        <task-form-field :entity="entity" :field="field" :form="form" :readonly="readonly" />
                      </v-col>
                    </template>
                  </v-row>
                </v-card-text>
              </v-card>
              <task-form-field v-else class="task-form__notes" :entity="entity" :field="section.fields[0]!" :form="form" :readonly="readonly" />
            </v-col>
          </v-row>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <div class="task-form__actions d-flex align-center justify-end ga-2 pa-3">
      <v-btn variant="text" :disabled="loading || submitting" @click="cancel">
        {{ t(operation === 'view' ? 'action.close' : 'action.cancel') }}
      </v-btn>
      <v-btn v-if="operation !== 'view'" type="submit" variant="flat"
             :color="operation === 'delete' ? 'error' : 'primary'" :loading="loading || submitting"
             :prepend-icon="operation === 'delete' ? 'mdi-delete-outline' : 'mdi-check'">
        {{ t(operation === 'create' ? 'task.form.create' : operation === 'delete' ? 'action.delete' : 'task.form.save') }}
      </v-btn>
    </div>
  </v-form>
</template>

<style scoped>
.task-form {
  --task-border: rgba(var(--v-theme-on-surface), 0.12);
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1360px;
  min-height: 0;
  margin: 0 auto;
  color: rgb(var(--v-theme-on-surface));
}
.crud-dialog--fixed-actions .task-form {
  flex: 1 1 auto;
  overflow: hidden;
}
.task-form__body {
  min-height: 0;
  padding: 4px 4px 20px;
}
.crud-dialog--fixed-actions .task-form__body {
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.task-form__hero {
  background: linear-gradient(120deg, rgba(var(--v-theme-primary), 0.045), rgb(var(--v-theme-surface)) 65%);
}
.task-form :deep(.v-card--variant-outlined) {
  border-color: var(--task-border);
}
.task-form :deep(.v-card-text) {
  padding: 20px;
}
.task-form :deep(.v-row--dense) {
  margin: -6px;
}
.task-form :deep(.v-row--dense > .v-col) {
  padding: 6px;
}
.task-form :deep(.v-field) {
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  font-size: 0.875rem;
}
.task-form :deep(.v-field:not(.v-field--focused) .v-field__outline) {
  --v-field-border-opacity: 0.16;
}
.task-form :deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-primary));
}
.task-form :deep(.v-input__details) {
  min-height: 0;
  padding-top: 4px;
}
.task-form :deep(.v-input__details:not(:has(.v-messages__message, .v-counter))) {
  display: none;
}
.task-form :deep(.v-divider) {
  opacity: 0.08;
}
.task-form :deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}
.task-form__title :deep(.v-field__input) {
  font-size: 1.15rem;
  font-weight: 500;
  min-height: 52px;
}
.task-form__urgent {
  padding-inline-start: 18px !important;
}
.task-form__tabs {
  border: 1px solid var(--task-border);
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.task-form__tabs :deep(.v-tab) {
  align-self: center;
  height: 40px;
  margin-inline: 4px;
  padding-inline: 14px;
  border-radius: 8px;
  font-size: 0.8125rem;
}
.task-form__tabs :deep(.v-tab--selected) {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), 0.1);
}
.task-form__section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 16px 20px;
  white-space: normal;
}
.task-form__section-title > .v-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  font-size: 20px;
}
.task-form__notes :deep(.v-card) {
  border-radius: 12px;
}
.task-form__notes :deep(.v-card-title) {
  padding: 16px 20px;
  font-weight: 600;
}
.task-form__notes :deep(.v-textarea .v-field) {
  --v-input-control-height: 40px;
}
.task-form__actions {
  flex: 0 0 auto;
  border-top: 1px solid var(--task-border);
  background: rgb(var(--v-theme-surface));
}
.task-form__actions > .v-btn {
  min-height: 42px;
  border-radius: 10px;
  padding-inline: 20px;
}
@media (max-width: 600px) {
  .task-form :deep(.v-card-text) {
    padding: 16px;
  }
  .task-form__actions {
    flex-wrap: wrap;
  }
  .task-form__actions > .v-btn {
    flex: 1 1 auto;
  }
}
</style>
