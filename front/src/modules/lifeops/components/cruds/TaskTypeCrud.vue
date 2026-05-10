
<script setup lang="ts">
import TaskTypeCrud from '../../cruds/TaskTypeCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="TaskTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>
