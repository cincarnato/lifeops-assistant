
<script setup lang="ts">
import PushMessageCrud from '../../cruds/PushMessageCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="PushMessageCrud.instance">
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.sentAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

