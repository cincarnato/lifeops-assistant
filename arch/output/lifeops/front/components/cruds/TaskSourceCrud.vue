
<script setup lang="ts">
import TaskSourceCrud from '../../cruds/TaskSourceCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="TaskSourceCrud.instance">

  </crud>
</template>

<style scoped>

</style>

