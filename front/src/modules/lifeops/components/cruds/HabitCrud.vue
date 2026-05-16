
<script setup lang="ts">
import HabitCrud from '../../cruds/HabitCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="HabitCrud.instance">

  </crud>
</template>

<style scoped>

</style>

