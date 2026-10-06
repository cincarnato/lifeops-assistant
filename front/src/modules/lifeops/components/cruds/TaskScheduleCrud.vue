
<script setup lang="ts">
import TaskScheduleCrud from '../../cruds/TaskScheduleCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="TaskScheduleCrud.instance">
    <template v-slot:item.startAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.endAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>

