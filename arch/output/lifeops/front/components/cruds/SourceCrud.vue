
<script setup lang="ts">
import SourceCrud from '../../cruds/SourceCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="SourceCrud.instance">

  </crud>
</template>

<style scoped>

</style>

