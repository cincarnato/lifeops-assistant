
<script setup lang="ts">
import MemoryTypeCrud from '../../cruds/MemoryTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="MemoryTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

