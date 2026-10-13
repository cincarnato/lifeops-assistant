
<script setup lang="ts">
import ShoppingItemCrud from '../../cruds/ShoppingItemCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ShoppingItemCrud.instance">
    <template v-slot:item.purchasedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>
