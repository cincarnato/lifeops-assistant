
<script setup lang="ts">
import ProjectCrud from '../../cruds/ProjectCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ProjectCrud.instance">
    <template v-slot:item.goals="{value}">{{ value.map((v: any) => v.name).join(",") }}</template>
    <template v-slot:item.client="{value}">{{value?.name}}</template>
    <template v-slot:item.startDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.targetDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.completedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>
