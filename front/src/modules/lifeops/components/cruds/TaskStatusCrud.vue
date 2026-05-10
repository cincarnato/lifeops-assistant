
<script setup lang="ts">
import TaskStatusCrud from '../../cruds/TaskStatusCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TaskStatusCrud.instance">

  </crud>
</template>

<style scoped>

</style>
