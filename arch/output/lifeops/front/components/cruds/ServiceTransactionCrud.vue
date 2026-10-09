
<script setup lang="ts">
import ServiceTransactionCrud from '../../cruds/ServiceTransactionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ServiceTransactionCrud.instance">
    <template v-slot:item.service="{value}">{{value?.name}}</template>
    <template v-slot:item.paidAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>
