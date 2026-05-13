
<script setup lang="ts">
import GoogleConnectionCrud from '../../cruds/GoogleConnectionCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="GoogleConnectionCrud.instance">
    <template v-slot:item.userId="{value}">{{value?.email}}</template>
    <template v-slot:item.scope="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.expiryDate="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.lastUsedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.connectedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.updatedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

