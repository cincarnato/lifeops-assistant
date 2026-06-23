<script setup lang="ts">
import CrudForm from "@drax/crud-vue/src/components/CrudForm.vue";
import {useI18n} from "vue-i18n";
import TaskCrud from "../cruds/TaskCrud";
import SourceCombobox from "../comboboxes/SourceCombobox.vue";
import TaskTypeCombobox from "../comboboxes/TaskTypeCombobox.vue";
import TaskStatusCombobox from "../comboboxes/TaskStatusCombobox.vue";
import PriorityCombobox from "../comboboxes/PriorityCombobox.vue";
import LifeAreaCombobox from "@/modules/lifeops/comboboxes/LifeAreaCombobox.vue";
import ProjectCombobox from "@/modules/lifeops/comboboxes/ProjectCombobox.vue";
import GoalCombobox from "@/modules/lifeops/comboboxes/GoalCombobox.vue";

const {t, te} = useI18n();

function taskFieldLabel(label?: string) {
  if (!label) {
    return "";
  }

  if (te(label)) {
    return t(label);
  }

  const taskFieldKey = `task.field.${label}`;
  return te(taskFieldKey) ? t(taskFieldKey) : label;
}
</script>

<template>
  <crud-form
      :entity="TaskCrud.instance"
      @created="item => $emit('created', item)"
      @updated="item => $emit('updated', item)"
      @deleted="$emit('deleted')"
      @viewed="$emit('viewed')"
      @canceled="$emit('canceled')"
  >
    <template v-slot:field.source="{field, form}">
      <source-combobox
          v-model="form.source"
          :name="field.name"
          :label="taskFieldLabel(field.label)"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:field.type="{field, form}">
      <task-type-combobox
          v-model="form.type"
          :name="field.name"
          :label="taskFieldLabel(field.label)"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:field.status="{field, form}">
      <task-status-combobox
          v-model="form.status"
          :name="field.name"
          :label="taskFieldLabel(field.label)"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:field.priority="{field, form}">
      <priority-combobox
          v-model="form.priority"
          :name="field.name"
          :label="taskFieldLabel(field.label)"
          item-title="name"
          item-value="name"
      />
    </template>

    <template v-slot:field.lifeArea="{field, form}">
      <life-area-combobox
        v-model="form.lifeArea"
        :name="field.name"
        :label="taskFieldLabel(field.label)"
        item-title="name"
        item-value="name"
      />
    </template>

    <template v-slot:field.project="{field, form}">
      <project-combobox
        v-model="form.project"
        :name="field.name"
        :label="taskFieldLabel(field.label)"
        :add-on-the-fly="field.addOnTheFly"
      />
    </template>

    <template v-slot:field.goals="{field, form}">
      <goal-combobox
        v-model="form.goals"
        :name="field.name"
        :label="taskFieldLabel(field.label)"
        :add-on-the-fly="field.addOnTheFly"
        multiple
        chips
      />
    </template>

  </crud-form>
</template>
