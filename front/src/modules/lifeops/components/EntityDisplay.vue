<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {IEntityCrud} from "@drax/crud-share";

const props = defineProps<{
  entityCrud?: IEntityCrud
  entity?: IEntityCrud
  value?: string | null
}>();

const DISPLAY_FIELDS = ["name", "title", "identifier", "displayName"];

const loading = ref(false);
const item = ref<Record<string, any> | null>(null);
const requestId = ref(0);

const entity = computed(() => props.entityCrud || props.entity || null);

const displayText = computed(() => {
  if (!props.value) {
    return "";
  }

  if (!item.value) {
    return props.value;
  }

  const displayValue = DISPLAY_FIELDS
      .map(field => item.value?.[field])
      .find(value => value !== undefined && value !== null && String(value).trim() !== "");

  return displayValue ? String(displayValue) : props.value;
});

watch(
    () => [entity.value, props.value] as const,
    async ([currentEntity, value]) => {
      const currentRequestId = requestId.value + 1;
      requestId.value = currentRequestId;
      item.value = null;

      if (!currentEntity || !value) {
        loading.value = false;
        return;
      }

      try {
        loading.value = true;

        if (typeof currentEntity.provider.findById !== "function") {
          throw new Error("EntityDisplay provider does not have a findById method");
        }

        const foundItem = await currentEntity.provider.findById(value);

        if (requestId.value === currentRequestId) {
          item.value = foundItem || null;
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (requestId.value === currentRequestId) {
          loading.value = false;
        }
      }
    },
    {immediate: true}
);
</script>

<template>
  <span class="entity-display" :aria-busy="loading">
    {{ displayText }}
  </span>
</template>
