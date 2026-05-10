
<script setup lang="ts">
import GoalCrud from '../../cruds/GoalCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'

</script>

<template>
  <crud :entity="GoalCrud.instance">
    <template v-slot:field.priority="{field, form}">
      <priority-combobox
          v-model="form.priority"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:item.priority="{value}">{{value}}</template>
    <template v-slot:item.targetDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.completedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.constraints="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
  </crud>
</template>

<style scoped>

</style>
