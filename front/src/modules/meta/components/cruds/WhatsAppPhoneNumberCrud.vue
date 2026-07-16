
<script setup lang="ts">
import WhatsAppPhoneNumberCrud from '../../cruds/WhatsAppPhoneNumberCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="WhatsAppPhoneNumberCrud.instance">
    <template v-slot:item.tenantId="{value}">{{value?.name}}</template>
  </crud>
</template>

<style scoped>

</style>

