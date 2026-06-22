<script setup lang="ts">
import CrudForm from "@drax/crud-vue/src/components/CrudForm.vue";
import TaskCrud from "../cruds/TaskCrud";
import SourceCombobox from "../comboboxes/SourceCombobox.vue";
import TaskTypeCombobox from "../comboboxes/TaskTypeCombobox.vue";
import TaskStatusCombobox from "../comboboxes/TaskStatusCombobox.vue";
import PriorityCombobox from "../comboboxes/PriorityCombobox.vue";
import LifeAreaCombobox from "@/modules/lifeops/comboboxes/LifeAreaCombobox.vue";
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
          :label="field.label"
          item-title="name"
          item-value="name"
      />
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
    <template v-slot:field.priority="{field, form}">
      <priority-combobox
          v-model="form.priority"
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

  </crud-form>
</template>
