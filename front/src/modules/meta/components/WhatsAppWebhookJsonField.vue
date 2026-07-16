<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'

const props = defineProps<{
  label: string
  modelValue: Record<string, unknown> | null | undefined
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const {t} = useI18n()

const jsonText = ref('')
const parseError = ref('')

const prettyJson = computed(() => stringifyJson(props.modelValue ?? {}))

watch(
  () => props.modelValue,
  (value) => {
    jsonText.value = stringifyJson(value ?? {})
    parseError.value = ''
  },
  {immediate: true}
)

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function updateJson(value: string) {
  jsonText.value = value

  try {
    const parsed = JSON.parse(value)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      parseError.value = t('whatsappwebhookevent.ui.payloadObjectRequired')
      return
    }

    parseError.value = ''
    emit('update:modelValue', parsed as Record<string, unknown>)
  } catch {
    parseError.value = t('whatsappwebhookevent.ui.invalidJson')
  }
}

async function copyJson() {
  if (!navigator?.clipboard) {
    return
  }

  await navigator.clipboard.writeText(prettyJson.value)
}
</script>

<template>
  <v-sheet class="whatsapp-webhook-json-field" border rounded="lg">
    <div class="d-flex align-center justify-space-between px-4 py-2">
      <div class="text-subtitle-2">{{ label }}</div>
      <v-tooltip :text="t('whatsappwebhookevent.ui.copyJson')">
        <template #activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            icon="mdi-content-copy"
            variant="text"
            density="comfortable"
            @click="copyJson"
          />
        </template>
      </v-tooltip>
    </div>

    <v-divider />

    <pre v-if="props.readonly === true" class="json-preview ma-0 pa-4">{{ prettyJson }}</pre>

    <v-textarea
      v-else
      :model-value="jsonText"
      class="json-editor"
      variant="plain"
      rows="18"
      auto-grow
      hide-details="auto"
      :error-messages="parseError ? [parseError] : []"
      :rules="[() => !parseError || parseError]"
      @update:model-value="updateJson"
    />
  </v-sheet>
</template>

<style scoped>
.whatsapp-webhook-json-field {
  overflow: hidden;
}

.json-preview {
  max-height: 520px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}

.json-editor :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.45;
}
</style>
