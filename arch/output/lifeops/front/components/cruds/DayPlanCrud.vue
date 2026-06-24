
<script setup lang="ts">
import DayPlanCrud from '../../cruds/DayPlanCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="DayPlanCrud.instance">
    <template v-slot:item.date="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

