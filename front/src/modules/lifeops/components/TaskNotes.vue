<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import type {ITask, ITaskNote} from '../interfaces/ITask'

const props = defineProps<{
  modelValue?: ITask['notes']
  readonly?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [notes: ITaskNote[]]
}>()
const {t, locale} = useI18n()
const draft = ref('')
const notes = computed<ITaskNote[]>(() => {
  if (Array.isArray(props.modelValue)) return props.modelValue
  if (typeof props.modelValue === 'string' && props.modelValue.trim()) {
    return [{note: props.modelValue.trim()}]
  }
  return []
})

watch(() => props.modelValue, () => {
  draft.value = ''
})

function addNote() {
  const note = draft.value.trim()
  if (props.readonly || !note) return
  emit('update:modelValue', [...notes.value, {note}])
  draft.value = ''
}

function formatNoteDate(value?: Date) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}
</script>

<template>
  <v-card variant="outlined">
    <v-card-title class="text-subtitle-1">
      <v-icon icon="mdi-note-text-outline" size="small" class="mr-2" />
      {{ t('task.field.notes') }}
    </v-card-title>
    <v-card-text>
      <v-row v-if="!readonly" class="mb-2">
        <v-col cols="12">
          <v-textarea
              v-model="draft"
              :label="t('task.notes.newNote')"
              :hint="t('task.notes.hint')"
              persistent-hint
              variant="outlined"
              rows="2"
              auto-grow
              @keydown.ctrl.enter.prevent="addNote"
              @keydown.meta.enter.prevent="addNote"
          />
          <v-btn
              class="mt-2"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-plus"
              :disabled="!draft.trim()"
              @click="addNote"
          >
            {{ t('task.notes.add') }}
          </v-btn>
        </v-col>
      </v-row>
      <p v-if="!notes.length" class="text-medium-emphasis mb-0">
        {{ t('task.notes.empty') }}
      </p>
      <v-card
          v-for="(note, index) in notes"
          :key="index"
          class="mb-2"
          variant="tonal"
      >
        <v-card-text>
          <div class="text-caption text-medium-emphasis mb-1">
            {{ formatNoteDate(note.date) || t('task.notes.pending') }}
          </div>
          <div class="task-notes__text">{{ note.note }}</div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.task-notes__text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
