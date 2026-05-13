
<script setup lang="ts">
import AgentJobExecutionCrud from '../../cruds/AgentJobExecutionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AgentJobExecutionCrud.instance">
    <template v-slot:item.jobId="{value}">{{value?.name}}</template>
    <template v-slot:item.scheduledFor="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.startedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.finishedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

