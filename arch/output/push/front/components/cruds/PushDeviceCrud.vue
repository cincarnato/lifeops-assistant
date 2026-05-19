
<script setup lang="ts">
import PushDeviceCrud from '../../cruds/PushDeviceCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="PushDeviceCrud.instance">
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.lastSeenAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

