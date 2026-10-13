<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const valueModel = defineModel<boolean>();
const delegateModel = defineModel<string | null>('delegate');
defineProps<{readonly?: boolean}>();
const {t} = useI18n();

function updateDelegable(value: boolean | null) {
  valueModel.value = value === true;
  if (!valueModel.value) {
    delegateModel.value = null;
  }
}
</script>

<template>
  <v-switch
      :model-value="valueModel === true"
      :label="t('task.field.delegable')"
      :hint="t('task.delegation.hint')"
      :readonly="readonly"
      color="primary"
      persistent-hint
      @update:model-value="updateDelegable"
  />
</template>
