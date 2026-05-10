
<script setup lang="ts">
import PriorityCrud from '../../cruds/PriorityCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="PriorityCrud.instance">

  </crud>
</template>

<style scoped>

</style>
