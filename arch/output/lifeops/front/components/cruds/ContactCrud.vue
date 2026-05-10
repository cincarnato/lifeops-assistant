
<script setup lang="ts">
import ContactCrud from '../../cruds/ContactCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ContactCrud.instance">
    <template v-slot:item.client="{value}">{{value?.name}}</template>
    <template v-slot:item.company="{value}">{{value?.name}}</template>
    <template v-slot:item.emails="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.phones="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

