
<script setup lang="ts">
import ClientTypeCrud from '../../cruds/ClientTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ClientTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

