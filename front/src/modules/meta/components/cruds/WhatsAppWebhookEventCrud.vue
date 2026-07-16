
<script setup lang="ts">
import WhatsAppWebhookEventCrud from '../../cruds/WhatsAppWebhookEventCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

</script>

<template>
  <crud :entity="WhatsAppWebhookEventCrud.instance">
    <template v-slot:item.tenantId="{value}">{{value?.name}}</template>
    <template v-slot:item.phoneNumberRef="{value}">{{value?.displayPhoneNumber}}</template>
    <template v-slot:item.receivedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.eventAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.processedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.lastProcessingAttemptAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>

