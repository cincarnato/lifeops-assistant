
<script setup lang="ts">
import TaskCrud from '../../cruds/TaskCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="TaskCrud.instance">
    <template v-slot:item.source="{value}">{{value?.name}}</template>
    <template v-slot:item.type="{value}">{{value?.name}}</template>
    <template v-slot:item.status="{value}">{{value?.name}}</template>
    <template v-slot:item.priority="{value}">{{value?.name}}</template>
    <template v-slot:item.goals="{value}">{{ value.map(v => v.name).join(",") }}</template>
    <template v-slot:item.project="{value}">{{value?.name}}</template>
    <template v-slot:item.client="{value}">{{value?.name}}</template>
    <template v-slot:item.contacts="{value}">{{ value.map(v => v.displayName).join(",") }}</template>
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

