
<script setup lang="ts">
import CompanyTypeCrud from '../../cruds/CompanyTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="CompanyTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

