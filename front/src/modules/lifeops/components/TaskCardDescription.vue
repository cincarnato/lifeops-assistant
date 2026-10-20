<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

const props = defineProps<{text: string}>()
const {t} = useI18n()
const tooltip = computed(() => `${t('task.field.description')}: ${props.text}`)
</script>

<template>
  <v-tooltip :text="tooltip" max-width="480">
    <template #activator="{props: activatorProps}">
      <p v-bind="activatorProps" class="task-card-description text-body-2 text-medium-emphasis" tabindex="0" :aria-label="tooltip">
        {{ text }}
      </p>
    </template>
  </v-tooltip>
</template>

<style scoped>
.task-card-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  max-height: 4.5em;
  overflow: hidden;
  overflow-wrap: anywhere;
  white-space: pre-line;
  line-height: 1.5;
}
.task-card-description:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
