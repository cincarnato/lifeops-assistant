
<script setup lang="ts">
import PurposeCrud from '../../cruds/PurposeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="PurposeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

