
<script setup lang="ts">
import InstructionCrud from '../../cruds/InstructionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="InstructionCrud.instance">

  </crud>
</template>

<style scoped>

</style>
