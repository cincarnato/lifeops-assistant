
<script setup lang="ts">
import HabitLogCrud from '../../cruds/HabitLogCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="HabitLogCrud.instance">
    <template v-slot:item.habit="{value}">{{value?.name}}</template>
    <template v-slot:item.date="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.task="{value}">{{value?.title}}</template>
  </crud>
</template>

<style scoped>

</style>

