
<script setup lang="ts">
import TaskCrud from '../../cruds/TaskCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import TaskSourceCombobox from '../../comboboxes/TaskSourceCombobox.vue'
import TaskTypeCombobox from '../../comboboxes/TaskTypeCombobox.vue'
import TaskStatusCombobox from '../../comboboxes/TaskStatusCombobox.vue'
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'

</script>

<template>
  <crud :entity="TaskCrud.instance">
    <template v-slot:field.source="{field, form}">
      <task-source-combobox
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
    <template v-slot:item.source="{value}">{{value}}</template>
    <template v-slot:item.type="{value}">{{value}}</template>
    <template v-slot:item.status="{value}">{{value}}</template>
    <template v-slot:item.priority="{value}">{{value}}</template>
    <template v-slot:item.goals="{value}">{{ value.map((v: any) => v.name).join(",") }}</template>
    <template v-slot:item.project="{value}">{{value?.name}}</template>
    <template v-slot:item.client="{value}">{{value?.name}}</template>
    <template v-slot:item.contacts="{value}">{{ value.map((v: any) => v.displayName).join(",") }}</template>
    <template v-slot:item.dueDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.scheduledDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.completedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>
