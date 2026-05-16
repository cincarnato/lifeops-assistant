
<script setup lang="ts">
import LifeAreaCrud from '../../cruds/LifeAreaCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="LifeAreaCrud.instance">

  </crud>
</template>

<style scoped>

</style>

