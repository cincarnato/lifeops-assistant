
<script setup lang="ts">
import CompanyTypeCrud from '../../cruds/CompanyTypeCrud'
import {Crud} from "@drax/crud-vue";

</script>

<template>
  <crud :entity="CompanyTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>
