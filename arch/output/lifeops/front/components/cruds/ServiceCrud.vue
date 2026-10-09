
<script setup lang="ts">
import ServiceCrud from '../../cruds/ServiceCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ServiceCrud.instance">
    <template v-slot:item.businessPartner="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>
