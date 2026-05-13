
<script setup lang="ts">
import AgentJobCrud from '../../cruds/AgentJobCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="AgentJobCrud.instance">
    <template v-slot:item.createdBy="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>

