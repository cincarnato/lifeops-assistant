
<script setup lang="ts">
import TaskPriorityCrud from '../../cruds/TaskPriorityCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TaskPriorityCrud.instance">

  </crud>
</template>

<style scoped>

</style>
