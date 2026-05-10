
<script setup lang="ts">
import ContactTypeCrud from '../../cruds/ContactTypeCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="ContactTypeCrud.instance">

  </crud>
</template>

<style scoped>

</style>

