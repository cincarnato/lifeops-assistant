<script setup lang="ts">
import {computed} from 'vue'
import type {Component} from 'vue'
import {useI18n} from 'vue-i18n'
import type {IEntityCrud, IEntityCrudField} from '@drax/crud-share'
import {useCrudStore} from '@drax/crud-vue'
import CrudFormField from '@drax/crud-vue/src/components/CrudFormField.vue'
import SourceCombobox from '../comboboxes/SourceCombobox.vue'
import TaskTypeCombobox from '../comboboxes/TaskTypeCombobox.vue'
import TaskStatusCombobox from '../comboboxes/TaskStatusCombobox.vue'
import PriorityCombobox from '../comboboxes/PriorityCombobox.vue'
import LifeAreaCombobox from '../comboboxes/LifeAreaCombobox.vue'
import TaskImportanceSelect from '../comboboxes/TaskImportanceSelect.vue'
import DelegateCombobox from '../comboboxes/DelegateCombobox.vue'
import TaskDelegableSwitch from './TaskDelegableSwitch.vue'
import TaskNotes from './TaskNotes.vue'

const props = defineProps<{
  entity: IEntityCrud
  field: IEntityCrudField
  form: Record<string, any>
  readonly?: boolean
}>()

const {t, te} = useI18n()
const store = computed(() => useCrudStore(props.entity.name))
const readOnlyMode = computed(() => props.readonly || props.field.readonly || false)
const label = computed(() => {
  const label = props.field.label || props.field.name
  if (te(label)) return t(label)
  const key = `${props.entity.i18nName}.field.${label}`
  return te(key) ? t(key) : label
})
const translatedField = computed(() => ({...props.field, label: label.value}))
const translateMessage = (value: boolean | string) => typeof value === 'string' && te(value) ? t(value) : value
const rules = computed(() => (props.entity.getRule(props.field.name) || []).map(rule =>
  async (value: unknown) => translateMessage(await rule(value)),
))
const errors = computed(() => store.value.getFieldInputErrors(props.field.name).map(
  (message: string) => te(message) ? t(message) : message,
))
const onInput = computed(() => props.entity.getOnInput(props.field.name))
const value = computed({
  get: () => props.form[props.field.name],
  set: value => { props.form[props.field.name] = value },
})
const delegate = computed({
  get: () => props.form.delegate,
  set: value => { props.form.delegate = value },
})
const catalogs: Record<string, Component> = {
  source: SourceCombobox,
  type: TaskTypeCombobox,
  status: TaskStatusCombobox,
  priority: PriorityCombobox,
  lifeArea: LifeAreaCombobox,
}
const catalog = computed(() => catalogs[props.field.name])

function updateValue(nextValue: unknown) {
  value.value = nextValue
  onInput.value?.(nextValue)
}
</script>

<template>
  <!-- Catalog wrappers only accept boolean hideDetails; VInput owns their messages and validation. -->
  <v-input
    v-if="catalog || field.name === 'notes'"
    :model-value="value"
    :name="field.name"
    :rules="rules"
    :error-messages="errors"
    hide-details="auto"
    density="compact"
  >
    <component
      :is="catalog"
      v-if="catalog"
      class="w-100"
      :model-value="value"
      :name="field.name"
      :label="label"
      item-title="name"
      item-value="name"
      :readonly="readOnlyMode"
      density="compact"
      variant="outlined"
      hide-details
      @update:model-value="updateValue"
    />
    <task-notes
      v-else
      class="w-100"
      :model-value="value"
      :readonly="readOnlyMode"
      @update:model-value="updateValue"
    />
  </v-input>

  <task-importance-select
    v-else-if="field.name === 'importance'"
    :model-value="value"
    :label="label"
    :readonly="readOnlyMode"
    :rules="rules"
    :error-messages="errors"
    density="compact"
    variant="outlined"
    hide-details="auto"
    @update:model-value="updateValue"
  />
  <task-delegable-switch
    v-else-if="field.name === 'delegable'"
    v-model:delegate="delegate"
    :model-value="value"
    :label="label"
    :readonly="readOnlyMode"
    :rules="rules"
    :error-messages="errors"
    density="compact"
    hide-details="auto"
    @update:model-value="updateValue"
  />
  <template v-else-if="field.name === 'delegate'">
    <delegate-combobox
      v-if="form.delegable"
      :model-value="value"
      :label="label"
      :readonly="readOnlyMode"
      :rules="rules"
      :error-messages="errors"
      density="compact"
      variant="outlined"
      hide-details="auto"
      @update:model-value="updateValue"
    />
  </template>
  <v-textarea
    v-else-if="field.name === 'description'"
    :model-value="value"
    :name="field.name"
    :label="label"
    :readonly="readOnlyMode"
    :rules="rules"
    :error-messages="errors"
    :rows="3"
    auto-grow
    density="compact"
    variant="outlined"
    hide-details="auto"
    @update:model-value="updateValue"
  />
  <div v-else>
    <crud-form-field
      v-model="value"
      :entity="entity"
      :field="translatedField"
      :readonly="readOnlyMode"
      :rules="rules"
      :error-messages="errors"
      :on-input="onInput"
      :hide-details="false"
      density="compact"
      variant="outlined"
    />
    <!-- CrudFormField hides its own messages in readonly mode. -->
    <v-messages v-if="readOnlyMode && errors.length" :messages="errors" color="error" />
  </div>
</template>
