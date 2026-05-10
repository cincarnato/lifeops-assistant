
<script setup lang="ts">
import ClientCrud from '../../cruds/ClientCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ClientCrud.instance">
    <template v-slot:item.emailDomains="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.mainContact="{value}">{{value?.displayName}}</template>
    <template v-slot:item.redmineProjectIds="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

