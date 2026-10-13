<script setup lang="ts">
import {onBeforeMount, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import DelegateProvider from '../providers/DelegateProvider';
import type {IDelegate} from '../interfaces/IDelegate';

const valueModel = defineModel<string | null>();
const props = withDefaults(defineProps<{
  label?: string
  readonly?: boolean
  disabled?: boolean
  errorMessages?: string[]
}>(), {readonly: false, disabled: false});

const {t} = useI18n();
const items = ref<IDelegate[]>([]);
const loading = ref(false);
const error = ref(false);

async function loadItems() {
  loading.value = true;
  error.value = false;
  try {
    items.value = await DelegateProvider.instance.find({
      filters: [{field: 'active', operator: 'eq', value: true}],
      limit: 0
    });
    await loadSelected();
  } catch (cause) {
    error.value = true;
    console.error(cause);
  } finally {
    loading.value = false;
  }
}

async function loadSelected() {
  const selectedId = valueModel.value;
  if (selectedId && !items.value.some(item => item._id === selectedId)) {
    try {
      const selected = await DelegateProvider.instance.findById(selectedId);
      if (selected && valueModel.value === selectedId) {
        items.value.push(selected);
      }
    } catch (cause) {
      error.value = true;
      console.error(cause);
    }
  }
}

onBeforeMount(loadItems);
watch(valueModel, loadSelected);
</script>

<template>
  <v-autocomplete
      v-model="valueModel"
      :items="items"
      :item-title="item => item.contact?.displayName ?? item._id"
      item-value="_id"
      :label="props.label ?? t('task.field.delegate')"
      :readonly="props.readonly"
      :disabled="props.disabled"
      :loading="loading"
      :error-messages="error ? [t('delegate.validation.loadFailed')] : props.errorMessages"
      clearable
  >
    <template #item="{props: itemProps, item}">
      <v-list-item
          v-bind="itemProps"
          :disabled="!item.raw.active"
          :subtitle="item.raw.skills?.join(', ')"
      />
    </template>
  </v-autocomplete>
</template>
