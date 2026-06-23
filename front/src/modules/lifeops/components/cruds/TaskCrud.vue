
<script setup lang="ts">
import {ref} from 'vue'
import TaskCrud from '../../cruds/TaskCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import SourceCombobox from '../../comboboxes/SourceCombobox.vue'
import TaskTypeCombobox from '../../comboboxes/TaskTypeCombobox.vue'
import TaskStatusCombobox from '../../comboboxes/TaskStatusCombobox.vue'
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'
import TaskView from "@/modules/lifeops/components/TaskView.vue";
import LifeAreaCombobox from "@/modules/lifeops/comboboxes/LifeAreaCombobox.vue";
import TaskProvider from "@/modules/lifeops/providers/TaskProvider";
import type {ITask} from "@/modules/lifeops/interfaces/ITask";

const triagingIds = ref<Set<string>>(new Set())
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

function getItem(item: any): ITask {
  return (item?.raw ?? item) as ITask
}

function setTriaging(id: string, value: boolean) {
  const next = new Set(triagingIds.value)
  if (value) {
    next.add(id)
  } else {
    next.delete(id)
  }
  triagingIds.value = next
}

function showSnackbar(message: string, color: 'success' | 'error') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

async function triageTask(item: any) {
  const task = getItem(item)
  if (!task?._id || triagingIds.value.has(task._id)) return

  setTriaging(task._id, true)
  try {
    const triaged = await TaskProvider.instance.triage(task._id)
    Object.assign(task, triaged)
    showSnackbar('Tarea analizada y actualizada con IA', 'success')
  } catch (e: any) {
    console.error('Error triaging task:', e)
    showSnackbar(e?.message ?? 'No se pudo analizar la tarea con IA', 'error')
  } finally {
    setTriaging(task._id, false)
  }
}

</script>

<template>
  <crud :entity="TaskCrud.instance">


    <template v-slot:form="{operation, form}">
      <task-view v-if="operation === 'view'" :item="form"></task-view>
    </template>


    <template v-slot:field.type="{field, form}">
      <task-type-combobox
          v-model="form.type"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:field.status="{field, form}">
      <task-status-combobox
          v-model="form.status"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>

    <template v-slot:field.lifeArea="{field, form}">
      <life-area-combobox
        v-model="form.lifeArea"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
      />
    </template>

    <template v-slot:field.source="{field, form}">
      <source-combobox
        v-model="form.source"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
      />
    </template>

    <template v-slot:field.priority="{field, form}">
      <priority-combobox
          v-model="form.priority"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:item.source="{value}">{{value}}</template>
    <template v-slot:item.type="{value}">{{value}}</template>
    <template v-slot:item.status="{value}">{{value}}</template>
    <template v-slot:item.priority="{value}">{{value}}</template>
    <template v-slot:item.goals="{value}">{{ value.map((v: any) => v.name).join(",") }}</template>
    <template v-slot:item.project="{value}">{{value?.name}}</template>
    <template v-slot:item.dueDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.scheduledDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.completedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.actions="{item}">
      <v-tooltip text="Analizar con IA">
        <template #activator="{ props }">
          <v-btn
              v-bind="props"
              icon="mdi-auto-fix"
              variant="text"
              color="primary"
              :loading="triagingIds.has(getItem(item)._id)"
              :disabled="triagingIds.has(getItem(item)._id)"
              @click.stop="triageTask(item)"
          />
        </template>
      </v-tooltip>
    </template>
  </crud>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<style scoped>

</style>
