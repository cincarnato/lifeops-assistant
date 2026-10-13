<script setup lang="ts">
import DelegateCrud from '../../cruds/DelegateCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="DelegateCrud.instance">
    <template v-slot:item.contact="{value}">{{value?.displayName}}</template>
    <template #item.skills="{value}"><v-chip v-for="skill in value" :key="skill">{{skill}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>
