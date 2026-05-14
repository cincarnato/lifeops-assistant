
<script setup lang="ts">
import MemoryCrud from '../../cruds/MemoryCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="MemoryCrud.instance">
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
  </crud>
</template>

<style scoped>

</style>
